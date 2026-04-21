> Verwandte Notizen: [[3D Modell in der App]] · [[Claude Perspektiven]] · [[Griffe einscannen]] · [[MOC — Gym App]]

Schritt 1: Das 3D-Modell

  Du brauchst ein menschliches 3D-Modell im GLB-Format mit Skelett (Bones/Rig).

  Wo herbekommen:
  - Mixamo (Adobe, kostenlos) — mixamo.com
    - Fertiges Modell + Animationen (z.B. "T-Pose")
    - Export als FBX → dann mit https://www.blender.org/ zu GLB konvertieren
  - Sketchfab — fertige GLB-Modelle downloadbar
  - Eigenes Modell in Blender erstellen (aufwendig)

  Minimalanforderung ans Modell:
  - Vollständiges Skelett (Bones: Schulter, Ellbogen, Hüfte, Knie, etc.)
  - Keine Textur nötig — einfaches flaches Material reicht
  - Dateigröße: möglichst unter 5 MB

  ---
  Schritt 2: Packages installieren

  npx expo install expo-gl expo-three three
  npm install @types/three

  ---
  Schritt 3: Modell laden & rendern

  components/exercise-builder/HumanModel3D.tsx (Struktur):

  import { GLView } from 'expo-gl';
  import { Renderer } from 'expo-three';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import { Asset } from 'expo-asset';

  export function HumanModel3D({
    perspective,   // 'vorne' | 'seite' | 'oben'
    muscleGroups,  // z.B. ['chest', 'triceps'] → diese rot einfärben
  }) {
    const onContextCreate = async (gl) => {
      // 1. Renderer aufsetzen
      const renderer = new Renderer({ gl });

      // 2. Szene + Kamera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, gl.drawingBufferWidth / gl.drawingBufferHeight);

      // 3. Kameraposition je nach Perspektive
      if (perspective === 'vorne') camera.position.set(0, 1, 3);
      if (perspective === 'seite') camera.position.set(3, 1, 0);
      if (perspective === 'oben')  camera.position.set(0, 4, 0.1);
      camera.lookAt(0, 1, 0);

      // 4. Modell laden (aus assets/)
      const asset = Asset.fromModule(require('../../assets/human.glb'));
      await asset.downloadAsync();
      const loader = new GLTFLoader();
      loader.load(asset.localUri, (gltf) => {
        // 5. Muskeln einfärben
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            if (muscleGroups.includes(child.name)) {
              child.material = new THREE.MeshBasicMaterial({ color: 0xff4444 });
            } else {
              child.material = new THREE.MeshBasicMaterial({ color: 0x888888 });
            }
          }
        });
        scene.add(gltf.scene);
      });

      // 6. Render-Loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    };

    return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
  }

  ---
  Schritt 4: Muskel-Mapping

  Das Modell muss benannte Meshes haben — z.B. chest, biceps_left, triceps_right. In Blender kannst du die Mesh-Namen manuell setzen.

  // lib/muscleMeshMap.ts
  export const MUSCLE_MESH_MAP: Record<string, string[]> = {
    chest:    ['chest_left', 'chest_right'],
    triceps:  ['triceps_left', 'triceps_right'],
    biceps:   ['biceps_left', 'biceps_right'],
    lats:     ['lat_left', 'lat_right'],
    shoulders:['deltoid_left', 'deltoid_right'],
    // ...
  };

  ---
  Schritt 5: Integration in PerspectivePlaceholder

  Aktuell nutzt ihr <StickFigure> — ihr würdet das durch <HumanModel3D> ersetzen:

  // PerspectivePlaceholder.tsx
  import { HumanModel3D } from './HumanModel3D';

  // Statt:
  <StickFigure {...figureProps} size={110} />

  // So:
  <HumanModel3D
    perspective={figureProps.perspective}
    muscleGroups={figureProps.muscleGroups}
  />

  ---
  Komplexität & Aufwand

  ┌────────────────────────────────────────────┬─────────┐
  │                  Schritt                   │ Aufwand │
  ├────────────────────────────────────────────┼─────────┤
  │ Modell finden/erstellen (Mixamo + Blender) │ ~2-4h   │
  ├────────────────────────────────────────────┼─────────┤
  │ Blender: Mesh-Namen setzen + GLB export    │ ~1-2h   │
  ├────────────────────────────────────────────┼─────────┤
  │ expo-gl Setup + GLTFLoader                 │ ~2-3h   │
  ├────────────────────────────────────────────┼─────────┤
  │ Muskel-Einfärbelogik                       │ ~1h     │
  ├────────────────────────────────────────────┼─────────┤
  │ Kamera-Perspektiven                        │ ~1h     │
  └────────────────────────────────────────────┴─────────┘

  Wichtigste Hürde: Das Modell muss in Blender sauber aufgeteilt sein — jeder Muskel als separates Mesh mit eindeutigem Namen. Ohne das ist das Einfärben
  nicht möglich.