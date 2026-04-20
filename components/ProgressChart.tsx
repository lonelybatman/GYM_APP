import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Colors } from '../constants/colors';
import type { ProgressPoint } from '../lib/queries/set-tracking';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChartMode = 'best' | 'avg' | 'volume' | '1rm';

type Props = {
  data: ProgressPoint[];
  mode: ChartMode;
  isOneHanded: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getValue(point: ProgressPoint, mode: ChartMode, hand: 'L' | 'R' | null): number {
  if (hand === 'L') return {
    best: point.left_best ?? 0,
    avg: point.left_avg ?? 0,
    volume: point.left_volume ?? 0,
    '1rm': point.left_one_rm ?? 0,
  }[mode];
  if (hand === 'R') return {
    best: point.right_best ?? 0,
    avg: point.right_avg ?? 0,
    volume: point.right_volume ?? 0,
    '1rm': point.right_one_rm ?? 0,
  }[mode];
  return {
    best: point.best_weight,
    avg: point.avg_weight,
    volume: point.volume,
    '1rm': point.one_rm,
  }[mode];
}

function formatYLabel(value: number, mode: ChartMode): string {
  if (mode === 'volume') {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return `${Math.round(value)}`;
  }
  if (mode === '1rm') return `${Math.round(value)}`;
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}`;
}

function formatXLabel(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${months[month]} ${day}`;
}

function niceRange(min: number, max: number, ticks: number): { niceMin: number; niceMax: number; step: number } {
  if (min === max) {
    const offset = min === 0 ? 1 : Math.abs(min) * 0.1;
    min = min - offset;
    max = max + offset;
  }
  const range = max - min;
  const roughStep = range / (ticks - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let step: number;
  if (residual <= 1) step = magnitude;
  else if (residual <= 2) step = 2 * magnitude;
  else if (residual <= 5) step = 5 * magnitude;
  else step = 10 * magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  return { niceMin, niceMax, step };
}

// ── Line segment ──────────────────────────────────────────────────────────────

function LineSegment({
  x1, y1, x2, y2, color,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  return (
    <View
      style={{
        position: 'absolute',
        left: midX - length / 2,
        top: midY - 1,
        width: length,
        height: 2,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

// ── Dot ───────────────────────────────────────────────────────────────────────

function Dot({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x - 4,
        top: y - 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
      }}
    />
  );
}

// ── ProgressChart ─────────────────────────────────────────────────────────────

const CHART_HEIGHT = 200;
const LEFT_PAD = 50;
const RIGHT_PAD = 8;
const BOTTOM_PAD = 28;
const PLOT_HEIGHT = CHART_HEIGHT - BOTTOM_PAD;
const Y_TICKS = 5;

export default function ProgressChart({ data, mode, isOneHanded }: Props) {
  const [totalWidth, setTotalWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setTotalWidth(e.nativeEvent.layout.width);
  }, []);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No history yet</Text>
      </View>
    );
  }

  if (data.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data</Text>
      </View>
    );
  }

  const plotWidth = totalWidth > 0 ? totalWidth - LEFT_PAD - RIGHT_PAD : 0;

  // Gather all values for range calculation
  const allValues: number[] = [];
  for (const point of data) {
    if (isOneHanded) {
      allValues.push(getValue(point, mode, 'L'));
      allValues.push(getValue(point, mode, 'R'));
    } else {
      allValues.push(getValue(point, mode, null));
    }
  }

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const { niceMin, niceMax, step } = niceRange(rawMin, rawMax, Y_TICKS);

  // Y-axis tick values
  const yTicks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.01; v += step) {
    yTicks.push(parseFloat(v.toFixed(10)));
  }

  // Map value to pixel Y (inverted: top = high value)
  function toY(value: number): number {
    const ratio = (value - niceMin) / (niceMax - niceMin);
    return PLOT_HEIGHT - ratio * PLOT_HEIGHT;
  }

  // Map index to pixel X
  function toX(index: number): number {
    if (data.length <= 1) return LEFT_PAD + plotWidth / 2;
    return LEFT_PAD + (index / (data.length - 1)) * plotWidth;
  }

  // X-axis label indices: up to 6 evenly spaced
  const maxXLabels = 6;
  const xLabelIndices: number[] = [];
  if (data.length <= maxXLabels) {
    for (let i = 0; i < data.length; i++) xLabelIndices.push(i);
  } else {
    for (let i = 0; i < maxXLabels; i++) {
      xLabelIndices.push(Math.round(i * (data.length - 1) / (maxXLabels - 1)));
    }
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {totalWidth > 0 && (
        <>
          {/* Y-axis labels + gridlines */}
          {yTicks.map((tick, i) => {
            const y = toY(tick);
            return (
              <React.Fragment key={i}>
                {/* Gridline */}
                <View
                  style={[
                    styles.gridline,
                    { top: y, left: LEFT_PAD, width: plotWidth },
                  ]}
                />
                {/* Y label */}
                <Text
                  style={[styles.yLabel, { top: y - 9 }]}
                  numberOfLines={1}
                >
                  {formatYLabel(tick, mode)}
                </Text>
              </React.Fragment>
            );
          })}

          {/* X-axis labels */}
          {xLabelIndices.map((idx) => {
            const x = toX(idx);
            return (
              <Text
                key={idx}
                style={[
                  styles.xLabel,
                  { left: x - 22, top: PLOT_HEIGHT + 6 },
                ]}
                numberOfLines={1}
              >
                {formatXLabel(data[idx].session_date)}
              </Text>
            );
          })}

          {/* Lines and dots */}
          {isOneHanded ? (
            <>
              {/* Left hand line */}
              {data.map((point, i) => {
                if (i === 0) return null;
                const x1 = toX(i - 1);
                const y1 = toY(getValue(data[i - 1], mode, 'L'));
                const x2 = toX(i);
                const y2 = toY(getValue(point, mode, 'L'));
                return (
                  <LineSegment key={`L-line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} color={Colors.PRIMARY} />
                );
              })}
              {data.map((point, i) => (
                <Dot key={`L-dot-${i}`} x={toX(i)} y={toY(getValue(point, mode, 'L'))} color={Colors.PRIMARY} />
              ))}

              {/* Right hand line */}
              {data.map((point, i) => {
                if (i === 0) return null;
                const x1 = toX(i - 1);
                const y1 = toY(getValue(data[i - 1], mode, 'R'));
                const x2 = toX(i);
                const y2 = toY(getValue(point, mode, 'R'));
                return (
                  <LineSegment key={`R-line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} color={Colors.PRIMARY_LIGHT} />
                );
              })}
              {data.map((point, i) => (
                <Dot key={`R-dot-${i}`} x={toX(i)} y={toY(getValue(point, mode, 'R'))} color={Colors.PRIMARY_LIGHT} />
              ))}
            </>
          ) : (
            <>
              {/* Single line */}
              {data.map((point, i) => {
                if (i === 0) return null;
                const x1 = toX(i - 1);
                const y1 = toY(getValue(data[i - 1], mode, null));
                const x2 = toX(i);
                const y2 = toY(getValue(point, mode, null));
                return (
                  <LineSegment key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} color={Colors.PRIMARY} />
                );
              })}
              {data.map((point, i) => (
                <Dot key={`dot-${i}`} x={toX(i)} y={toY(getValue(point, mode, null))} color={Colors.PRIMARY} />
              ))}
            </>
          )}
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height: CHART_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
  },
  gridline: {
    position: 'absolute',
    height: 1,
    backgroundColor: Colors.BORDER,
  },
  yLabel: {
    position: 'absolute',
    left: 0,
    width: LEFT_PAD - 4,
    textAlign: 'right',
    color: Colors.TEXT_SECONDARY,
    fontSize: 10,
  },
  xLabel: {
    position: 'absolute',
    width: 44,
    textAlign: 'center',
    color: Colors.TEXT_SECONDARY,
    fontSize: 10,
  },
});
