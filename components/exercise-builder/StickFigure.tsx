import React from 'react';
import Svg, { Circle, Line, Rect, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';

export type StickFigureProps = {
  perspective: 'oben' | 'vorne' | 'seite';
  combo?: string;
  benchType?: 'flat' | 'incl' | 'upright' | null;
  benchAngle?: number | null;
  exerciseName?: string;
  size?: number;
};

type Pt = [number, number];
type Arms = { eL: Pt; hL: Pt; eR: Pt; hR: Pt };

const C = Colors.TEXT;
const SW = 3.5;

function seg(x1: number, y1: number, x2: number, y2: number, key: string) {
  return (
    <Line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={C} strokeWidth={SW} strokeLinecap="round" />
  );
}

// ── Arm presets (front view, 100×160 viewBox) ────────────────────────────────
// Shoulders: L=(28,30)  R=(72,30)
const ARM_POSES: Record<string, Arms> = {
  neutral: { eL:[20,55], hL:[16,76], eR:[80,55], hR:[84,76] },
  curl:    { eL:[24,55], hL:[34,32], eR:[76,55], hR:[66,32] },
  press:   { eL:[20,12], hL:[14,0],  eR:[80,12], hR:[86,0]  },
  fly:     { eL:[8,36],  hL:[2,24],  eR:[92,36], hR:[98,24] },
  pull:    { eL:[22,14], hL:[14,2],  eR:[78,14], hR:[86,2]  },
  push:    { eL:[22,38], hL:[20,62], eR:[78,38], hR:[80,62] },
  row:     { eL:[14,34], hL:[8,22],  eR:[86,34], hR:[92,22] },
  raise:   { eL:[10,28], hL:[4,22],  eR:[90,28], hR:[96,22] },
};

function getArmCat(name?: string): string {
  const n = (name ?? '').toLowerCase();
  if (/curl/.test(n))                      return 'curl';
  if (/fly|rfly/.test(n))                  return 'fly';
  if (/press/.test(n))                     return 'press';
  if (/pd|ext|crusher|ohext/.test(n))      return 'push';
  if (/pull|apull|fpull|rpull/.test(n))    return 'pull';
  if (/row|frow/.test(n))                  return 'row';
  if (/raise|shrugg|flap|kshrugg/.test(n)) return 'raise';
  return 'neutral';
}

type BodyMode = 'standing' | 'bench_flat' | 'bench_incline' | 'bench_upright' | 'lat';

function getBodyMode(combo?: string, benchType?: string | null): BodyMode {
  if (combo === 'lat_pull' || combo === 'lat_row') return 'lat';
  if (combo === 'bench_cable' || combo === 'bench_freeweight') {
    if (benchType === 'flat')    return 'bench_flat';
    if (benchType === 'incl')    return 'bench_incline';
    if (benchType === 'upright') return 'bench_upright';
  }
  return 'standing';
}

// ── Standing front ───────────────────────────────────────────────────────────
function StandingFront({ arms }: { arms: Arms }) {
  const { eL, hL, eR, hR } = arms;
  return (
    <G>
      <Circle cx={50} cy={13} r={10} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,23, 50,80, 's')}
      {seg(28,30, 72,30, 'sh')}
      {seg(28,30, eL[0],eL[1], 'uaL')}{seg(eL[0],eL[1], hL[0],hL[1], 'faL')}
      {seg(72,30, eR[0],eR[1], 'uaR')}{seg(eR[0],eR[1], hR[0],hR[1], 'faR')}
      {seg(39,80, 61,80, 'h')}
      {seg(39,80, 34,112, 'ulL')}{seg(34,112, 28,146, 'llL')}
      {seg(61,80, 66,112, 'ulR')}{seg(66,112, 72,146, 'llR')}
    </G>
  );
}

// ── Standing side ────────────────────────────────────────────────────────────
const SIDE_ARMS: Record<string, { e: Pt; h: Pt }> = {
  neutral: { e:[54,55], h:[56,76] },
  curl:    { e:[52,55], h:[36,36] },
  press:   { e:[54,10], h:[52,0]  },
  fly:     { e:[68,38], h:[80,28] },
  pull:    { e:[46,16], h:[40,4]  },
  push:    { e:[54,40], h:[52,64] },
  row:     { e:[66,36], h:[76,26] },
  raise:   { e:[70,28], h:[82,22] },
};

function StandingSide({ armCat }: { armCat: string }) {
  const { e, h } = SIDE_ARMS[armCat] ?? SIDE_ARMS.neutral;
  return (
    <G>
      <Circle cx={50} cy={13} r={10} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,23, 50,80, 's')}
      {seg(52,30, e[0],e[1], 'ua')}{seg(e[0],e[1], h[0],h[1], 'fa')}
      {seg(48,30, 40,52, 'uaB')}{seg(40,52, 38,72, 'faB')}
      {seg(50,80, 56,110, 'ulN')}{seg(56,110, 60,145, 'llN')}
      {seg(50,80, 44,108, 'ulF')}{seg(44,108, 38,143, 'llF')}
    </G>
  );
}

// ── Standing top ─────────────────────────────────────────────────────────────
function StandingTop() {
  return (
    <G>
      <Circle cx={50} cy={20} r={9} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,29, 50,78, 'body')}
      {seg(50,38, 16,42, 'armL')}{seg(50,38, 84,42, 'armR')}
      {seg(50,78, 38,100, 'legL')}{seg(50,78, 62,100, 'legR')}
    </G>
  );
}

// ── Bench flat – side ────────────────────────────────────────────────────────
const BENCH_FLAT_SIDE_ARMS: Record<string, { e: Pt; h: Pt }> = {
  neutral: { e:[66,82], h:[64,100] },
  curl:    { e:[66,82], h:[52,70]  },
  press:   { e:[66,66], h:[66,50]  },
  fly:     { e:[78,72], h:[88,64]  },
  pull:    { e:[66,68], h:[60,56]  },
  push:    { e:[66,82], h:[66,100] },
  row:     { e:[66,72], h:[76,64]  },
  raise:   { e:[70,72], h:[82,66]  },
};

function BenchFlatSide({ armCat }: { armCat: string }) {
  const { e, h } = BENCH_FLAT_SIDE_ARMS[armCat] ?? BENCH_FLAT_SIDE_ARMS.neutral;
  return (
    <G>
      <Rect x={8} y={88} width={84} height={9} rx={2}
        stroke={C} strokeWidth={2} fill={Colors.SURFACE_2} />
      {seg(16,97, 16,115, 'bl1')}{seg(84,97, 84,115, 'bl2')}
      <Circle cx={86} cy={81} r={9} stroke={C} strokeWidth={SW} fill="none" />
      {seg(77,81, 22,81, 'body')}
      {seg(68,81, e[0],e[1], 'ua')}{seg(e[0],e[1], h[0],h[1], 'fa')}
      {seg(68,81, 70,96, 'uaB')}{seg(70,96, 68,108, 'faB')}
      {seg(22,81, 20,100, 'tL')}{seg(20,100, 22,130, 'sL')}
      {seg(22,81, 24,100, 'tR')}{seg(24,100, 22,130, 'sR')}
    </G>
  );
}

// ── Bench flat – front (head-on) ─────────────────────────────────────────────
function BenchFlatFront({ armCat }: { armCat: string }) {
  const offsets: Record<string, [number, number, number, number]> = {
    neutral: [-18,12, 18,12],
    curl:    [-16,10, 16,10],
    press:   [-14,0,  14,0],
    fly:     [-24,4,  24,4],
    pull:    [-14,4,  14,4],
    push:    [-14,10, 14,10],
    row:     [-22,6,  22,6],
    raise:   [-26,4,  26,4],
  };
  const [dexL,, dexR] = offsets[armCat] ?? offsets.neutral;
  const [,deyL,, deyR] = offsets[armCat] ?? offsets.neutral;
  return (
    <G>
      <Rect x={28} y={84} width={44} height={9} rx={2}
        stroke={C} strokeWidth={2} fill={Colors.SURFACE_2} />
      <Circle cx={50} cy={72} r={10} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,82, 50,102, 'body')}
      {seg(50,86, 50+dexL,86+deyL, 'armL')}
      {seg(50,86, 50+dexR,86+deyR, 'armR')}
      {seg(42,102, 40,122, 'lL')}{seg(58,102, 60,122, 'lR')}
    </G>
  );
}

// ── Bench flat – top ─────────────────────────────────────────────────────────
function BenchFlatTop() {
  return (
    <G>
      <Rect x={20} y={50} width={60} height={110} rx={4}
        stroke={C} strokeWidth={2} fill={Colors.SURFACE_2} opacity={0.4} />
      <Circle cx={50} cy={58} r={9} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,67, 50,120, 'body')}
      {seg(50,78, 20,82, 'armL')}{seg(50,78, 80,82, 'armR')}
      {seg(50,120, 40,148, 'legL')}{seg(50,120, 60,148, 'legR')}
    </G>
  );
}

// ── Bench incline – side ─────────────────────────────────────────────────────
function BenchInclineSide({ armCat, angle }: { armCat: string; angle: number }) {
  const deg = Math.max(10, Math.min(80, angle));
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // pivot at hips (55, 105)
  const hx = 55, hy = 105;
  // head: 62 units along bench direction
  const hdx = -sin * 62, hdy = -cos * 62;
  const headX = hx + hdx, headY = hy + hdy;
  // shoulder: 46 units up
  const shX = hx + (-sin * 46), shY = hy + (-cos * 46);
  // arm perp to bench (toward ceiling)
  const px = cos, py = -sin; // perpendicular up-direction
  return (
    <G>
      {/* Bench surface */}
      <Line x1={hx - sin * 10} y1={hy - cos * 10}
            x2={hx + sin * 70} y2={hy + cos * 70}
            stroke={C} strokeWidth={10} strokeLinecap="round" opacity={0.2} />
      <Line x1={hx - sin * 10} y1={hy - cos * 10}
            x2={hx + sin * 70} y2={hy + cos * 70}
            stroke={C} strokeWidth={2} strokeLinecap="round" />
      {/* Bench leg */}
      {seg(hx + sin*60, hy + cos*60, hx + sin*60, hy + cos*60 + 20, 'bl')}
      {/* Head */}
      <Circle cx={headX} cy={headY} r={10} stroke={C} strokeWidth={SW} fill="none" />
      {/* Body */}
      <Line x1={headX - hdx * 0.16} y1={headY - hdy * 0.16}
            x2={hx} y2={hy}
            stroke={C} strokeWidth={SW} strokeLinecap="round" />
      {/* Near arm */}
      <Line x1={shX} y1={shY}
            x2={shX + px * 22} y2={shY + py * 22}
            stroke={C} strokeWidth={SW} strokeLinecap="round" />
      <Line x1={shX + px * 22} y1={shY + py * 22}
            x2={shX + px * 22 + (-sin) * 16} y2={shY + py * 22 + (-cos) * 16}
            stroke={C} strokeWidth={SW} strokeLinecap="round" />
      {/* Legs */}
      {seg(hx, hy, hx + 10, hy + 30, 'legN')}{seg(hx + 10, hy + 30, hx + 8, hy + 55, 'll')}
    </G>
  );
}

// ── Bench upright – side ─────────────────────────────────────────────────────
function BenchUprightSide({ armCat }: { armCat: string }) {
  const { e, h } = SIDE_ARMS[armCat] ?? SIDE_ARMS.neutral;
  return (
    <G>
      <Rect x={10} y={100} width={56} height={8} rx={2}
        stroke={C} strokeWidth={2} fill={Colors.SURFACE_2} />
      {seg(18,108, 18,128, 'bl1')}{seg(58,108, 58,128, 'bl2')}
      <Circle cx={50} cy={13} r={10} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,23, 50,80, 'spine')}
      {seg(52,30, e[0],e[1], 'ua')}{seg(e[0],e[1], h[0],h[1], 'fa')}
      {seg(48,30, 40,52, 'uaB')}{seg(40,52, 38,70, 'faB')}
      {seg(50,100, 62,100, 'th1')}{seg(62,100, 64,135, 'sh1')}
      {seg(50,100, 38,100, 'th2')}{seg(38,100, 36,135, 'sh2')}
    </G>
  );
}

// ── Lat pull / row – side ────────────────────────────────────────────────────
function LatSide() {
  return (
    <G>
      <Rect x={22} y={100} width={40} height={7} rx={2}
        stroke={C} strokeWidth={2} fill={Colors.SURFACE_2} />
      {seg(30,107, 30,128, 'bl1')}{seg(54,107, 54,128, 'bl2')}
      {seg(10,14, 90,14, 'bar')}{seg(50,14, 50,22, 'cable')}
      <Circle cx={50} cy={34} r={10} stroke={C} strokeWidth={SW} fill="none" />
      {seg(50,44, 50,100, 'spine')}
      {seg(50,52, 30,28, 'uaL')}{seg(30,28, 22,16, 'faL')}
      {seg(50,52, 70,28, 'uaR')}{seg(70,28, 78,16, 'faR')}
      {seg(50,100, 58,100, 'th1')}{seg(58,100, 60,134, 'sh1')}
      {seg(50,100, 42,100, 'th2')}{seg(42,100, 40,134, 'sh2')}
    </G>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function StickFigure({
  perspective, combo, benchType, benchAngle, exerciseName, size = 120,
}: StickFigureProps) {
  const armCat = getArmCat(exerciseName);
  const arms   = ARM_POSES[armCat] ?? ARM_POSES.neutral;
  const mode   = getBodyMode(combo, benchType);

  let content: React.ReactNode;

  if (mode === 'bench_flat') {
    if (perspective === 'seite')      content = <BenchFlatSide armCat={armCat} />;
    else if (perspective === 'vorne') content = <BenchFlatFront armCat={armCat} />;
    else                              content = <BenchFlatTop />;
  } else if (mode === 'bench_incline') {
    const ang = benchAngle ?? 45;
    if (perspective === 'seite')      content = <BenchInclineSide armCat={armCat} angle={ang} />;
    else if (perspective === 'vorne') content = <BenchFlatFront armCat={armCat} />;
    else                              content = <BenchFlatTop />;
  } else if (mode === 'bench_upright') {
    if (perspective === 'seite')      content = <BenchUprightSide armCat={armCat} />;
    else if (perspective === 'vorne') content = <StandingFront arms={arms} />;
    else                              content = <StandingTop />;
  } else if (mode === 'lat') {
    content = <LatSide />;
  } else {
    if (perspective === 'vorne')      content = <StandingFront arms={arms} />;
    else if (perspective === 'seite') content = <StandingSide armCat={armCat} />;
    else                              content = <StandingTop />;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 160">
      {content}
    </Svg>
  );
}

export default StickFigure;
