import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Colors } from '../../constants/colors';

let GLTFLoader: any = null;
try {
  const loaders = require('three/examples/jsm/loaders/GLTFLoader.js');
  GLTFLoader = loaders.GLTFLoader;
} catch (e) {}

// ── Key joints for gym exercises ──────────────────────────────────────────────
const CONTROL_BONES: { key: string; boneName: string; label: string; color: number }[] = [
  { key: 'leftShoulder',  boneName: 'mixamorig6LeftArm_016',      label: 'L Shoulder',  color: 0xaa44ff },
  { key: 'leftElbow',     boneName: 'mixamorig6LeftForeArm_017',  label: 'L Elbow',     color: 0xaa44ff },
  { key: 'rightShoulder', boneName: 'mixamorig6RightArm_035',     label: 'R Shoulder',  color: 0xaa44ff },
  { key: 'rightElbow',    boneName: 'mixamorig6RightForeArm_036', label: 'R Elbow',     color: 0xaa44ff },
  { key: 'hips',          boneName: 'mixamorig6Hips_01',          label: 'Hips',        color: 0x44aaff },
  { key: 'leftKnee',      boneName: 'mixamorig6LeftLeg_03',       label: 'L Knee',      color: 0x44aaff },
  { key: 'rightKnee',     boneName: 'mixamorig6RightLeg_07',      label: 'R Knee',      color: 0x44aaff },
];

type JointOverlay = { key: string; label: string; x: number; y: number };
type BoneRotations = Record<string, { x: number; y: number; z: number }>;

type Perspective = 'oben' | 'vorne' | 'seite';

type Props = {
  width?: number;
  height?: number;
  bench?: boolean;
  benchAngle?: number;
  benchZAngle?: number;
  perspective?: Perspective;
  benchCableAngle?: 0 | 90 | 180 | null;
  pose?: BoneRotations;
  /** Bench + Cable: in top view („oben“) allow moving bench on XZ floor */
  allowBenchXZEditor?: boolean;
  /** If user tippt „Bank“ bei anderer Ansicht: zu „Oben“ wechseln (Parent setzt Tab) */
  onBenchAdjustRequestOben?: () => void;
};

const BENCH_NUDGE = 0.07;
const DPAD_HALF = 72;

function getCameraSetup(perspective: Perspective, benchCableAngle: number | null) {
  // Base camera positions
  const bases: Record<Perspective, { pos: [number, number, number]; look: [number, number, number] }> = {
    vorne: { pos: [0,   1.0, 4.5], look: [0, 0.5, 0] },
    seite: { pos: [4.5, 1.0, 0],   look: [0, 0.5, 0] },
    oben:  { pos: [0,   5.0, 0.5], look: [0, 0,   0] },
  };
  const base = bases[perspective];

  // Rotate vorne/seite around Y axis by benchCableAngle
  if (benchCableAngle && perspective !== 'oben') {
    const a = (benchCableAngle * Math.PI) / 180;
    const [bx, by, bz] = base.pos;
    const rx = bx * Math.cos(a) - bz * Math.sin(a);
    const rz = bx * Math.sin(a) + bz * Math.cos(a);
    return {
      pos: new THREE.Vector3(rx, by, rz),
      look: new THREE.Vector3(...base.look),
    };
  }
  return {
    pos: new THREE.Vector3(...base.pos),
    look: new THREE.Vector3(...base.look),
  };
}


export function HumanModel3D({
  width = 200,
  height = 280,
  bench = false,
  benchAngle = 0,
  benchZAngle = 0,
  perspective = 'vorne',
  benchCableAngle = null,
  pose,
  allowBenchXZEditor = false,
  onBenchAdjustRequestOben,
}: Props) {
  const rendererRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const bonesRef = useRef<Record<string, THREE.Bone>>({});
  const glSizeRef = useRef({ w: 1, h: 1 });

  // Refs for live updates (read every frame)
  const perspectiveRef = useRef<Perspective>(perspective);
  const benchCableAngleRef = useRef<number | null>(benchCableAngle);
  const benchAngleRef = useRef<number>(benchAngle);
  const benchZAngleRef = useRef<number>(benchZAngle);
  const benchPadRef = useRef<THREE.Object3D | null>(null);
  const allowBenchXZEditorRef = useRef(allowBenchXZEditor);
  perspectiveRef.current = perspective;
  benchCableAngleRef.current = benchCableAngle;
  benchAngleRef.current = benchAngle;
  benchZAngleRef.current = benchZAngle;
  allowBenchXZEditorRef.current = allowBenchXZEditor;

  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenRef = useRef(false);
  fullscreenRef.current = fullscreen;
  const [joints, setJoints] = useState<JointOverlay[]>([]);
  const [selectedJoint, setSelectedJoint] = useState<string | null>(null);
  const [boneRotations, setBoneRotations] = useState<BoneRotations>({});
  const [savedPoseJson, setSavedPoseJson] = useState<string | null>(null);

  const benchModelRef = useRef<THREE.Object3D | null>(null);
  const [dbgPos, setDbgPos] = useState({ x: 0.8, y: -2.1, z: -0.6 });
  const dbgPosRef = useRef(dbgPos);
  dbgPosRef.current = dbgPos;

  const [benchXZMode, setBenchXZMode] = useState(false);
  const benchXZModeRef = useRef(false);
  benchXZModeRef.current = benchXZMode;
  const planeDragOffsetRef = useRef<{ x: number; z: number } | null>(null);

  useEffect(() => {
    if (perspective !== 'oben') setBenchXZMode(false);
  }, [perspective]);

  useEffect(() => {
    if (!fullscreen) setBenchXZMode(false);
  }, [fullscreen]);

  const intersectXZPlane = useCallback(
    (locationX: number, locationY: number): THREE.Vector3 | null => {
      const cam = cameraRef.current;
      if (!cam) return null;
      const w = glSizeRef.current.w || width;
      const h = glSizeRef.current.h || height;
      const ndcX = (locationX / w) * 2 - 1;
      const ndcY = 1 - (locationY / h) * 2;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);
      const planeY = dbgPosRef.current.y;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hit)) return hit;
      return null;
    },
    [width, height],
  );

  const panBenchMove = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          !!fullscreenRef.current &&
          !!benchXZModeRef.current &&
          allowBenchXZEditorRef.current &&
          perspectiveRef.current === 'oben' &&
          (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),
        onPanResponderGrant: (e) => {
          const p = intersectXZPlane(e.nativeEvent.locationX, e.nativeEvent.locationY);
          if (p) {
            planeDragOffsetRef.current = {
              x: dbgPosRef.current.x - p.x,
              z: dbgPosRef.current.z - p.z,
            };
          } else {
            planeDragOffsetRef.current = null;
          }
        },
        onPanResponderMove: (e) => {
          const p = intersectXZPlane(e.nativeEvent.locationX, e.nativeEvent.locationY);
          const off = planeDragOffsetRef.current;
          if (!p || !off) return;
          setDbgPos((prev) => ({
            x: p.x + off.x,
            y: prev.y,
            z: p.z + off.z,
          }));
        },
        onPanResponderRelease: () => {
          planeDragOffsetRef.current = null;
        },
      }),
    [intersectXZPlane],
  );

  const nudgeBenchXZ = useCallback((dx: number, dz: number) => {
    setDbgPos((p) => ({ x: +(p.x + dx).toFixed(3), y: p.y, z: +(p.z + dz).toFixed(3) }));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      rendererRef.current?.dispose();
    };
  }, []);

  // Apply pose to bones whenever pose prop changes
  useEffect(() => {
    if (!pose) return;
    for (const [key, rot] of Object.entries(pose)) {
      const bone = bonesRef.current[key];
      if (bone) bone.rotation.set(rot.x, rot.y, rot.z);
    }
    setBoneRotations(pose);
  }, [pose]);


  // ── Project bone world position to 2D screen coords ───────────────────────
  const updateJointOverlays = useCallback(() => {
    if (!cameraRef.current || !mountedRef.current) return;
    const camera = cameraRef.current;
    const { w, h } = glSizeRef.current;

    const overlays: JointOverlay[] = [];
    for (const ctrl of CONTROL_BONES) {
      const bone = bonesRef.current[ctrl.key];
      if (!bone) continue;
      const pos = new THREE.Vector3();
      bone.getWorldPosition(pos);
      pos.project(camera);
      overlays.push({
        key: ctrl.key,
        label: ctrl.label,
        x: (pos.x * 0.5 + 0.5) * w,
        y: (-pos.y * 0.5 + 0.5) * h,
      });
    }
    setJoints(overlays);
  }, []);

  const setupGL = useCallback(async (gl: any) => {
    if (!mountedRef.current) return;

    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    glSizeRef.current = { w, h };

    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Colors.SURFACE ?? '#1a1a1a');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    const animate = () => {
      if (!mountedRef.current) return;
      frameRef.current = requestAnimationFrame(animate);
      const { pos, look } = getCameraSetup(perspectiveRef.current, benchCableAngleRef.current);
      camera.position.copy(pos);
      camera.lookAt(look);
      if (benchPadRef.current) {
        benchPadRef.current.rotation.y = -(benchAngleRef.current * Math.PI) / 180;
      }
      if (benchModelRef.current) {
        benchModelRef.current.rotation.z = (benchZAngleRef.current * Math.PI) / 180;
        const p = dbgPosRef.current;
        benchModelRef.current.position.set(p.x, p.y, p.z);
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();

    // ── Load GLBs ───────────────────────────────────────────────────────────
    if (!GLTFLoader) return;
    const { Asset } = require('expo-asset');
    const { readAsStringAsync } = require('expo-file-system/legacy');

    // Human model
    try {
      const asset = Asset.fromModule(require('../../assets/models/human.glb'));
      await asset.downloadAsync();
      if (!mountedRef.current) return;

      const base64 = await readAsStringAsync(asset.localUri ?? asset.uri, { encoding: 'base64' });
      if (!mountedRef.current) return;

      const binary = atob(base64);
      const buffer = new ArrayBuffer(binary.length);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const loader = new GLTFLoader();
      loader.parse(buffer, '', (gltf: any) => {
        if (!mountedRef.current) return;
        const model = gltf.scene;

        model.traverse((child: any) => {
          if (child.isMesh) {
            child.material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
          }
        });

        model.traverse((child: any) => {
          if (child.isBone || child.type === 'Bone') {
            const ctrl = CONTROL_BONES.find((c) => c.boneName === child.name);
            if (ctrl) bonesRef.current[ctrl.key] = child;
          }
        });

        model.rotation.x = Math.PI / 2;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 2.5 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        scene.add(model);
        updateJointOverlays();
      }, (err: any) => console.error('GLB parse error:', err));
    } catch (e) {
      console.error('Asset load error:', e);
    }

    // Bench model
    if (bench) {
      try {
        const benchAsset = Asset.fromModule(require('../../blender/bench.glb'));
        await benchAsset.downloadAsync();
        if (!mountedRef.current) return;

        const benchBase64 = await readAsStringAsync(benchAsset.localUri ?? benchAsset.uri, { encoding: 'base64' });
        if (!mountedRef.current) return;

        const benchBinary = atob(benchBase64);
        const benchBuffer = new ArrayBuffer(benchBinary.length);
        const benchBytes = new Uint8Array(benchBuffer);
        for (let i = 0; i < benchBinary.length; i++) benchBytes[i] = benchBinary.charCodeAt(i);

        const benchLoader = new GLTFLoader();
        benchLoader.parse(benchBuffer, '', (gltf: any) => {
          if (!mountedRef.current) return;
          const benchModel = gltf.scene;

          benchModel.traverse((child: any) => {
            if (child.isMesh) {
              child.material = new THREE.MeshLambertMaterial({ color: 0x888888 });
              if (child.name === 'bench_pad') benchPadRef.current = child;
            }
          });

          benchModelRef.current = benchModel;
          benchModel.scale.setScalar(0.5);
          benchModel.rotation.set(0, Math.PI, 0);
          benchModel.position.set(0.8, -2.1, -0.6);
          scene.add(benchModel);
        }, (err: any) => console.error('Bench GLB error:', err));
      } catch (e) {
        console.error('Bench load error:', e);
      }
    }
  }, [updateJointOverlays, bench]);

  // ── Apply bone rotation from state ────────────────────────────────────────
  const applyRotation = useCallback((key: string, axis: 'x' | 'y' | 'z', delta: number) => {
    const bone = bonesRef.current[key];
    if (!bone) return;
    bone.rotation[axis] += delta;
    setBoneRotations((prev) => ({
      ...prev,
      [key]: {
        x: bone.rotation.x,
        y: bone.rotation.y,
        z: bone.rotation.z,
      },
    }));
    updateJointOverlays();
  }, [updateJointOverlays]);

  const selectedCtrl = CONTROL_BONES.find((c) => c.key === selectedJoint);

  const showBenchButton = allowBenchXZEditor && bench;
  const benchOben = perspective === 'oben';
  /** Bank nur im Vollbild-Modal verschieben */
  const benchMoveActive = fullscreen && showBenchButton && benchOben && benchXZMode;

  const handleBenchToolbarPress = () => {
    if (!benchOben) {
      onBenchAdjustRequestOben?.();
      setBenchXZMode(true);
      return;
    }
    setBenchXZMode((v) => !v);
  };

  let benchToolbarLabel = 'Bank verschieben (Draufsicht „Oben“)';
  if (showBenchButton && !benchOben) {
    benchToolbarLabel = 'Zuerst Ansicht „Oben“ wählen — oder tippen zum Wechseln';
  } else if (benchMoveActive) {
    benchToolbarLabel = 'Bewegen beenden (Steuerkreuz ausblenden)';
  }

  return (
    <>
      {/* ── Vorschau: GL nur wenn kein Vollbild (sonst 2 Kontexte → kaputte Refs / kein Kreuz) ── */}
      {!fullscreen ? (
        <View style={[styles.previewOuter, { width }]} collapsable={false}>
          <View style={[styles.container, { width, height }]} collapsable={false}>
            <GLView style={[StyleSheet.absoluteFill, { zIndex: 0 }]} onContextCreate={setupGL} />
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => setFullscreen(true)}
              activeOpacity={0.85}
            />
          </View>
        </View>
      ) : (
        <View style={{ width, height }} />
      )}

      {/* ── Vollbild: Modal nur gemountet wenn offen → genau ein GL-Kontext ── */}
      {fullscreen ? (
        <Modal visible animationType="slide" onRequestClose={() => setFullscreen(false)}>
          <View style={styles.modal}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Position</Text>
              <TouchableOpacity
                onPress={() => {
                  const json = JSON.stringify(boneRotations, (_, v) =>
                    typeof v === 'number' ? Math.round(v * 1000) / 1000 : v, 2);
                  setSavedPoseJson(json);
                }}
              >
                <Text style={styles.savePoseBtn}>Save Pose</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setFullscreen(false); setSavedPoseJson(null); }}>
                <Text style={styles.closeBtn}>Done</Text>
              </TouchableOpacity>
            </View>

            {savedPoseJson && (
              <View style={styles.poseJson}>
                <Text style={styles.poseJsonText} selectable>{savedPoseJson}</Text>
              </View>
            )}

            {/* Bank-Leiste direkt unter dem Header — sonst von flex:1-3D-Bereich weggeschoben */}
            {showBenchButton && (
              <View style={styles.benchToolbarRowModal}>
                <TouchableOpacity
                  style={styles.benchToolbarBtn}
                  onPress={handleBenchToolbarPress}
                  activeOpacity={0.75}
                >
                  <Text style={styles.benchToolbarBtnText}>{benchToolbarLabel}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modelContainer}>
              <GLView style={StyleSheet.absoluteFill} onContextCreate={setupGL} />
              {joints.map((j) => (
                <TouchableOpacity
                  key={j.key}
                  onPress={() => setSelectedJoint(j.key === selectedJoint ? null : j.key)}
                  style={[
                    styles.jointDot,
                    { left: j.x - 10, top: j.y - 10 },
                    selectedJoint === j.key && styles.jointDotSelected,
                  ]}
                >
                  <Text style={styles.jointLabel}>{j.label}</Text>
                </TouchableOpacity>
              ))}
              {benchMoveActive && (
                <View
                  style={[StyleSheet.absoluteFill, { zIndex: 5 }]}
                  collapsable={false}
                  {...panBenchMove.panHandlers}
                />
              )}
              {benchMoveActive && (
                <View
                  style={styles.dpadModalFixed}
                  pointerEvents="box-none"
                  collapsable={false}
                >
                  <View style={styles.dpadRow}>
                    <View style={styles.dpadCell} />
                    <TouchableOpacity style={styles.dpadBtn} onPress={() => nudgeBenchXZ(0, -BENCH_NUDGE)}>
                      <Text style={styles.dpadBtnText}>↑</Text>
                    </TouchableOpacity>
                    <View style={styles.dpadCell} />
                  </View>
                  <View style={styles.dpadRow}>
                    <TouchableOpacity style={styles.dpadBtn} onPress={() => nudgeBenchXZ(-BENCH_NUDGE, 0)}>
                      <Text style={styles.dpadBtnText}>←</Text>
                    </TouchableOpacity>
                    <View style={[styles.dpadBtn, styles.dpadCenter]} />
                    <TouchableOpacity style={styles.dpadBtn} onPress={() => nudgeBenchXZ(BENCH_NUDGE, 0)}>
                      <Text style={styles.dpadBtnText}>→</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dpadRow}>
                    <View style={styles.dpadCell} />
                    <TouchableOpacity style={styles.dpadBtn} onPress={() => nudgeBenchXZ(0, BENCH_NUDGE)}>
                      <Text style={styles.dpadBtnText}>↓</Text>
                    </TouchableOpacity>
                    <View style={styles.dpadCell} />
                  </View>
                </View>
              )}
            </View>

          {/* Rotation controls for selected joint */}
          {selectedCtrl && (
            <View style={styles.controls}>
              <Text style={styles.controlTitle}>{selectedCtrl.label}</Text>
              {(['x', 'y', 'z'] as const).map((axis) => (
                <View key={axis} style={styles.axisRow}>
                  <Text style={styles.axisLabel}>{axis.toUpperCase()}</Text>
                  <TouchableOpacity style={styles.rotBtn} onPress={() => applyRotation(selectedCtrl.key, axis, -0.1)}>
                    <Text style={styles.rotBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.rotValue}>
                    {((boneRotations[selectedCtrl.key]?.[axis] ?? 0) * (180 / Math.PI)).toFixed(0)}°
                  </Text>
                  <TouchableOpacity style={styles.rotBtn} onPress={() => applyRotation(selectedCtrl.key, axis, 0.1)}>
                    <Text style={styles.rotBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {!selectedCtrl && (
            <View style={styles.hint}>
              <Text style={styles.hintText}>Tap a violet dot to adjust a joint</Text>
            </View>
          )}

          <View style={styles.debugPanel}>
            {([['X', 'x'], ['Y', 'y'], ['Z', 'z']] as [string, 'x'|'y'|'z'][]).map(([label, key]) => (
              <View key={key} style={styles.debugRow}>
                <Text style={styles.debugLabel}>{label}</Text>
                <TouchableOpacity style={styles.debugBtn} onPress={() => setDbgPos(p => ({ ...p, [key]: +(p[key] - 0.1).toFixed(2) }))}>
                  <Text style={styles.debugBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.debugVal}>{dbgPos[key].toFixed(2)}</Text>
                <TouchableOpacity style={styles.debugBtn} onPress={() => setDbgPos(p => ({ ...p, [key]: +(p[key] + 0.1).toFixed(2) }))}>
                  <Text style={styles.debugBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ))}
            <Text style={styles.debugCopy} selectable>{`px:${dbgPos.x} py:${dbgPos.y} pz:${dbgPos.z}`}</Text>
          </View>

        </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  previewOuter: {
    alignItems: 'stretch',
    overflow: 'visible',
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.SURFACE,
    position: 'relative',
  },
  benchToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  benchToolbarRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  benchToolbarBtn: {
    flex: 1,
    backgroundColor: Colors.PRIMARY ?? '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    elevation: 3,
  },
  benchToolbarBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  benchToolbarIconBtn: {
    backgroundColor: Colors.SURFACE ?? '#2a2a2a',
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER ?? '#444',
  },
  benchExpandBtnText: {
    color: Colors.TEXT ?? '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dpadWrap: {
    position: 'absolute',
    zIndex: 110,
    width: DPAD_HALF * 2,
    height: DPAD_HALF * 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  /** Fix unten im Vollbild-3D — immer sichtbar, unabhängig von Projektion */
  dpadModalFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    zIndex: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 14,
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCell: {
    width: 44,
    height: 44,
  },
  dpadBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(40,40,40,0.92)',
    borderWidth: 1,
    borderColor: Colors.PRIMARY ?? '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  dpadCenter: {
    opacity: 0.35,
    borderColor: Colors.BORDER ?? '#555',
  },
  dpadBtnText: {
    color: Colors.TEXT ?? '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND ?? '#0d0d0d',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER ?? '#333',
  },
  modalTitle: {
    color: Colors.TEXT ?? '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    color: Colors.PRIMARY ?? '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
  modelContainer: {
    flex: 1,
    position: 'relative',
  },
  jointDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#aa44ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  jointDotSelected: {
    backgroundColor: '#ff44aa',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  jointLabel: {
    display: 'none',
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER ?? '#333',
  },
  controlTitle: {
    color: Colors.TEXT ?? '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  axisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  axisLabel: {
    color: Colors.TEXT_SECONDARY ?? '#888',
    fontSize: 13,
    fontWeight: '700',
    width: 20,
  },
  rotBtn: {
    backgroundColor: Colors.SURFACE ?? '#1a1a1a',
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER ?? '#333',
  },
  rotBtnText: {
    color: Colors.TEXT ?? '#fff',
    fontSize: 22,
    fontWeight: '300',
  },
  rotValue: {
    color: Colors.TEXT ?? '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  hint: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER ?? '#333',
  },
  hintText: {
    color: Colors.TEXT_SECONDARY ?? '#888',
    fontSize: 14,
  },
  savePoseBtn: {
    color: '#4fffb0',
    fontSize: 15,
    fontWeight: '600',
  },
  poseJson: {
    backgroundColor: '#0a0a0a',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    maxHeight: 160,
  },
  poseJsonText: {
    color: '#0f0',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  debugPanel: {
    padding: 10, backgroundColor: '#111',
    borderTopWidth: 1, borderTopColor: '#444',
  },
  debugRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8,
  },
  debugLabel: {
    color: '#ff0', fontSize: 12, fontWeight: '700', width: 20,
  },
  debugBtn: {
    backgroundColor: '#333', borderRadius: 4,
    width: 36, height: 30, alignItems: 'center', justifyContent: 'center',
  },
  debugBtnText: { color: '#fff', fontSize: 20, fontWeight: '300' },
  debugVal: { color: '#fff', fontSize: 12, width: 48, textAlign: 'center' },
  debugCopy: { color: '#0f0', fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
});
