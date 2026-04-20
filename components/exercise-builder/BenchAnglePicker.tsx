import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import type { BenchType } from '../../lib/exercise-builder/types';
import { BENCH_TYPE_LABEL } from '../../lib/exercise-builder/abbreviation';
import {
  getBenchPresets, addBenchPreset, linkRasterToDegree, updateBenchPreset, deleteBenchPreset,
  type BenchPreset,
} from '../../lib/local-storage';

// Default preset degrees when bench has no stored presets
const DEFAULT_DEGREE_PRESETS = [15, 20, 30, 45, 60, 75];
// Raster positions to show
const RASTER_COUNT = 10;

type Props = {
  benchTypes: BenchType[];
  selectedType: BenchType | null;
  benchAngle: number | null;
  onTypeChange: (type: BenchType) => void;
  onAngleChange: (angle: number | null) => void;
};

export function BenchAnglePicker({
  benchTypes,
  selectedType,
  benchAngle,
  onTypeChange,
  onAngleChange,
}: Props) {
  const router = useRouter();
  const [benches, setBenches] = useState<BenchPreset[]>([]);
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBenchLabel, setNewBenchLabel] = useState('');
  const [newBenchHasDegrees, setNewBenchHasDegrees] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [rasterInputs, setRasterInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    loadBenches();
  }, []);

  async function loadBenches() {
    const loaded = await getBenchPresets();
    setBenches(loaded);
    if (loaded.length === 1) {
      setSelectedBenchId(loaded[0].id);
    }
  }

  if (benchTypes.length === 0) return null;

  const selectedBench = benches.find((b) => b.id === selectedBenchId) ?? null;

  // ── Add bench ─────────────────────────────────────────────────────────────
  const handleAddBench = async () => {
    if (!newBenchLabel.trim()) return;
    const preset: BenchPreset = {
      id: Date.now().toString(),
      label: newBenchLabel.trim(),
      has_degree_markings: newBenchHasDegrees,
      presets: [],
    };
    await addBenchPreset(preset);
    const updated = await getBenchPresets();
    setBenches(updated);
    if (updated.length === 1) {
      setSelectedBenchId(updated[0].id);
    }
    setNewBenchLabel('');
    setNewBenchHasDegrees(true);
    setShowAddModal(false);
  };

  // ── Raster scan / link ────────────────────────────────────────────────────
  const handleScanRaster = (pos: number) => {
    if (!selectedBenchId) return;
    router.push({
      pathname: '/scan/bench-angle',
      params: { benchId: selectedBenchId, rasterNumber: String(pos) },
    });
  };

  const handleRasterTap = (rasterNumber: number) => {
    if (!selectedBench) return;
    const linked = selectedBench.presets.find((r) => r.raster_number === rasterNumber);
    if (linked) {
      onAngleChange(linked.degree);
    }
    // If not linked, user fills input and taps scan — handled inline
  };

  const handleLinkRaster = async (rasterNumber: number) => {
    if (!selectedBenchId) return;
    const inputVal = rasterInputs[rasterNumber];
    const deg = parseInt(inputVal ?? '', 10);
    if (!isNaN(deg) && deg > 0 && deg < 90) {
      await linkRasterToDegree(selectedBenchId, rasterNumber, deg);
      await loadBenches();
      onAngleChange(deg);
      setRasterInputs((prev) => {
        const next = { ...prev };
        delete next[rasterNumber];
        return next;
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>BENCH POSITION</Text>

      {/* ── Bench selection ──────────────────────────────────────────────── */}
      {benches.length === 0 && (
        <View style={styles.noBenchRow}>
          <Text style={styles.noBenchText}>No bench configured</Text>
          <TouchableOpacity style={styles.addBenchBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBenchBtnText}>+ Add Bench</Text>
          </TouchableOpacity>
        </View>
      )}

      {benches.length >= 2 && (
        <View style={styles.benchChipRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipList}>
              {benches.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.chip, selectedBenchId === b.id && styles.chipActive]}
                  onPress={() => setSelectedBenchId(b.id)}
                >
                  <Text style={[styles.chipText, selectedBenchId === b.id && styles.chipTextActive]}>
                    {b.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.chip} onPress={() => setShowAddModal(true)}>
                <Text style={styles.chipText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {benches.length === 1 && (
        <View style={styles.singleBenchRow}>
          <Text style={styles.singleBenchLabel}>{benches[0].label}</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBenchLink}>+ Add Bench</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bench type selector ──────────────────────────────────────────── */}
      {benchTypes.length === 1 ? (
        <View style={styles.textLabel}>
          <Text style={styles.textLabelValue}>{BENCH_TYPE_LABEL[benchTypes[0]]}</Text>
        </View>
      ) : (
        <View style={styles.toggle}>
          {benchTypes.map((bt) => (
            <TouchableOpacity
              key={bt}
              style={[styles.toggleBtn, selectedType === bt && styles.toggleBtnActive]}
              onPress={() => onTypeChange(bt)}
            >
              <Text style={[styles.toggleBtnText, selectedType === bt && styles.toggleBtnTextActive]}>
                {BENCH_TYPE_LABEL[bt]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Incline angle picker ─────────────────────────────────────────── */}
      {selectedType === 'incl' && (
        <View style={styles.angleSection}>
          <Text style={styles.angleLabel}>Incline Angle</Text>

          {/* With degree markings: show preset chips */}
          {(!selectedBench || selectedBench.has_degree_markings) && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.presets}>
                  {(selectedBench && selectedBench.presets.length > 0
                    ? selectedBench.presets.map((r) => r.degree)
                    : DEFAULT_DEGREE_PRESETS
                  ).map((angle) => (
                    <TouchableOpacity
                      key={angle}
                      style={[styles.preset, benchAngle === angle && styles.presetActive]}
                      onPress={() => onAngleChange(angle)}
                    >
                      <Text style={[styles.presetText, benchAngle === angle && styles.presetTextActive]}>
                        {angle}°
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Custom input */}
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  value={customInput}
                  onChangeText={setCustomInput}
                  placeholder="Custom °"
                  placeholderTextColor={Colors.TEXT_SECONDARY}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TouchableOpacity
                  style={styles.customBtn}
                  onPress={() => {
                    const v = parseInt(customInput, 10);
                    if (!isNaN(v) && v > 0 && v < 90) {
                      onAngleChange(v);
                      setCustomInput('');
                    }
                  }}
                >
                  <Text style={styles.customBtnText}>Set</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Without degree markings: show raster positions */}
          {selectedBench && !selectedBench.has_degree_markings && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.presets}>
                {Array.from({ length: RASTER_COUNT }, (_, i) => i + 1).map((rasterNum) => {
                  const linked = selectedBench.presets.find((r) => r.raster_number === rasterNum);
                  const isSelected = linked != null && benchAngle === linked.degree;

                  return (
                    <View key={rasterNum} style={styles.rasterItem}>
                      <TouchableOpacity
                        style={[styles.preset, isSelected && styles.presetActive]}
                        onPress={() => handleRasterTap(rasterNum)}
                      >
                        <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                          {linked ? `Pos ${rasterNum} (${linked.degree}°)` : `Pos ${rasterNum} (?)`}
                        </Text>
                      </TouchableOpacity>

                      {!linked && (
                        <View style={styles.rasterLinkRow}>
                          <TextInput
                            style={styles.rasterInput}
                            value={rasterInputs[rasterNum] ?? ''}
                            onChangeText={(v) =>
                              setRasterInputs((prev) => ({ ...prev, [rasterNum]: v }))
                            }
                            placeholder="°"
                            placeholderTextColor={Colors.TEXT_SECONDARY}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          <TouchableOpacity
                            style={styles.scanBtn}
                            onPress={() => handleScanRaster(rasterNum)}
                          >
                            <Text style={styles.scanBtnText}>Scan</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.customBtn}
                            onPress={() => handleLinkRaster(rasterNum)}
                          >
                            <Text style={styles.customBtnText}>Link</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {benchAngle != null && (
            <Text style={styles.selected}>Selected: {benchAngle}°</Text>
          )}
        </View>
      )}

      {/* ── Add Bench Modal ──────────────────────────────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Bench</Text>

            <TextInput
              style={styles.modalInput}
              value={newBenchLabel}
              onChangeText={setNewBenchLabel}
              placeholder="Bench label (e.g. Adjustable Bench)"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalToggleRow}
              onPress={() => setNewBenchHasDegrees((v) => !v)}
            >
              <View style={[styles.modalCheckbox, newBenchHasDegrees && styles.modalCheckboxActive]} />
              <Text style={styles.modalToggleText}>Has degree markings</Text>
            </TouchableOpacity>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewBenchLabel('');
                  setNewBenchHasDegrees(true);
                }}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleAddBench}
              >
                <Text style={styles.modalBtnConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER + '66',
  },
  label: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // No bench
  noBenchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  noBenchText: { color: Colors.TEXT_SECONDARY, fontSize: 13 },
  addBenchBtn: {
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBenchBtnText: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 13 },

  // Single bench
  singleBenchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  singleBenchLabel: { color: Colors.TEXT, fontSize: 13, fontWeight: '500' },
  addBenchLink: { color: Colors.PRIMARY, fontSize: 12 },

  // Bench chips
  benchChipRow: { marginBottom: 8 },
  chipList: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER,
  },
  chipActive: { backgroundColor: Colors.PRIMARY + '22', borderColor: Colors.PRIMARY },
  chipText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: Colors.PRIMARY },

  // Bench type toggle
  textLabel: {
    backgroundColor: Colors.SURFACE_2, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start',
  },
  textLabelValue: { color: Colors.TEXT, fontSize: 14, fontWeight: '500' },

  toggle: {
    flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.BORDER,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.SURFACE },
  toggleBtnActive: { backgroundColor: Colors.PRIMARY },
  toggleBtnText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 14 },
  toggleBtnTextActive: { color: Colors.TEXT },

  // Angle section
  angleSection: { marginTop: 12 },
  angleLabel: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginBottom: 8 },

  presets: { flexDirection: 'row', gap: 8 },
  preset: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER,
  },
  presetActive: { backgroundColor: Colors.PRIMARY + '22', borderColor: Colors.PRIMARY },
  presetText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 13 },
  presetTextActive: { color: Colors.PRIMARY },

  customRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  customInput: {
    flex: 1, backgroundColor: Colors.SURFACE, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.BORDER,
    color: Colors.TEXT, padding: 10, fontSize: 14,
  },
  customBtn: {
    backgroundColor: Colors.SURFACE_2, borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  customBtnText: { color: Colors.TEXT, fontWeight: '600' },

  selected: { color: Colors.PRIMARY, fontWeight: '600', marginTop: 8, fontSize: 13 },

  // Raster
  rasterItem: { marginRight: 8 },
  rasterLinkRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  rasterInput: {
    width: 44, backgroundColor: Colors.SURFACE, borderRadius: 6,
    borderWidth: 1, borderColor: Colors.BORDER,
    color: Colors.TEXT, padding: 6, fontSize: 12, textAlign: 'center',
  },
  scanBtn: {
    backgroundColor: Colors.SURFACE_2, borderRadius: 6,
    paddingHorizontal: 8, justifyContent: 'center',
  },
  scanBtnText: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 11 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.SURFACE, borderRadius: 16,
    padding: 24, width: '85%',
    borderWidth: 1, borderColor: Colors.BORDER,
  },
  modalTitle: { color: Colors.TEXT, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    backgroundColor: Colors.SURFACE_2, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.BORDER,
    color: Colors.TEXT, padding: 12, fontSize: 14, marginBottom: 12,
  },
  modalToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  modalCheckbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.BORDER,
    backgroundColor: Colors.SURFACE_2,
  },
  modalCheckboxActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  modalToggleText: { color: Colors.TEXT, fontSize: 14 },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: Colors.SURFACE_2 },
  modalBtnCancelText: { color: Colors.TEXT_SECONDARY, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: Colors.PRIMARY },
  modalBtnConfirmText: { color: Colors.TEXT, fontWeight: '700' },
});
