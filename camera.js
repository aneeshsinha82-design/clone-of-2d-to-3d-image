// Camera movement presets for the Script → Video editor.
// Inspired by public-domain concepts commonly used in open-source motion tools:
// eased Ken Burns paths, dolly/pan/tilt/roll, orbit and restrained handheld motion.
// These are original implementations; no third-party source code is copied.
import { W, H, clamp01 } from './util.js';

const LEVELS = [
  { id: 'subtle', label: 'Subtle', amount: 0.55, duration: 3.6 },
  { id: 'classic', label: 'Classic', amount: 0.8, duration: 3.0 },
  { id: 'cinematic', label: 'Cinematic', amount: 1.0, duration: 2.7 },
  { id: 'bold', label: 'Bold', amount: 1.25, duration: 2.35 }
];

// 25 motion families × 4 intensities = 100 selectable camera animation presets.
const FAMILIES = [
  { id: 'dolly-in', label: 'Dolly In', group: 'Dolly & Zoom', type: 'zoom', zoom: 0.16 },
  { id: 'dolly-out', label: 'Dolly Out', group: 'Dolly & Zoom', type: 'zoom', zoom: -0.14 },
  { id: 'pan-left', label: 'Pan Left', group: 'Pan & Tilt', type: 'move', x: -0.15 },
  { id: 'pan-right', label: 'Pan Right', group: 'Pan & Tilt', type: 'move', x: 0.15 },
  { id: 'tilt-up', label: 'Tilt Up', group: 'Pan & Tilt', type: 'move', y: -0.12 },
  { id: 'tilt-down', label: 'Tilt Down', group: 'Pan & Tilt', type: 'move', y: 0.12 },
  { id: 'truck-left', label: 'Truck Left', group: 'Truck & Pedestal', type: 'move', x: -0.21, zoom: 0.045 },
  { id: 'truck-right', label: 'Truck Right', group: 'Truck & Pedestal', type: 'move', x: 0.21, zoom: 0.045 },
  { id: 'pedestal-up', label: 'Pedestal Up', group: 'Truck & Pedestal', type: 'move', y: -0.19, zoom: 0.035 },
  { id: 'pedestal-down', label: 'Pedestal Down', group: 'Truck & Pedestal', type: 'move', y: 0.19, zoom: 0.035 },
  { id: 'diagonal-in-left', label: 'Diagonal Push In · Left', group: 'Dolly & Zoom', type: 'move', x: -0.09, y: -0.06, zoom: 0.15 },
  { id: 'diagonal-in-right', label: 'Diagonal Push In · Right', group: 'Dolly & Zoom', type: 'move', x: 0.09, y: -0.06, zoom: 0.15 },
  { id: 'diagonal-out-left', label: 'Diagonal Pull Out · Left', group: 'Dolly & Zoom', type: 'move', x: -0.08, y: 0.06, zoom: -0.1 },
  { id: 'diagonal-out-right', label: 'Diagonal Pull Out · Right', group: 'Dolly & Zoom', type: 'move', x: 0.08, y: 0.06, zoom: -0.1 },
  { id: 'orbit-left', label: 'Orbit Left', group: 'Orbit & Arc', type: 'orbit', direction: -1 },
  { id: 'orbit-right', label: 'Orbit Right', group: 'Orbit & Arc', type: 'orbit', direction: 1 },
  { id: 'arc-up', label: 'Arc Up', group: 'Orbit & Arc', type: 'arc', direction: -1 },
  { id: 'arc-down', label: 'Arc Down', group: 'Orbit & Arc', type: 'arc', direction: 1 },
  { id: 'roll-clockwise', label: 'Roll Clockwise', group: 'Roll & Organic', type: 'roll', direction: 1 },
  { id: 'roll-counterclockwise', label: 'Roll Counterclockwise', group: 'Roll & Organic', type: 'roll', direction: -1 },
  { id: 'handheld', label: 'Handheld Documentary', group: 'Roll & Organic', type: 'handheld' },
  { id: 'gentle-float', label: 'Gentle Floating Camera', group: 'Roll & Organic', type: 'float' },
  { id: 'dolly-zoom-in', label: 'Dolly Zoom In', group: 'Dolly & Zoom', type: 'dollyzoom', direction: 1 },
  { id: 'dolly-zoom-out', label: 'Dolly Zoom Out', group: 'Dolly & Zoom', type: 'dollyzoom', direction: -1 },
  { id: 'snap-zoom', label: 'Snap Zoom + Settle', group: 'Dolly & Zoom', type: 'snap' }
];
const LEVEL_BY_ID = Object.fromEntries(LEVELS.map(level => [level.id, level]));
const FAMILY_BY_ID = Object.fromEntries(FAMILIES.map(family => [family.id, family]));
export const CAMERA_PRESETS = FAMILIES.flatMap(family => LEVELS.map(level => ({
  id: family.id + '-' + level.id,
  label: family.label + ' — ' + level.label,
  group: family.group,
  family: family.id,
  amount: level.amount,
  duration: level.duration
})));
const PRESET_BY_ID = Object.fromEntries(CAMERA_PRESETS.map(preset => [preset.id, preset]));

export const CAMERAS = CAMERA_PRESETS.map(preset => preset.id);
export const EXITS = ['whipup', 'slideout', 'zoompush'];
const EXIT_MIX = ['whipup', 'none', 'zoompush', 'slideout', 'none'];
const EXIT_LEN = { whipup: 0.28, slideout: 0.33, zoompush: 0.2 };

export const cameraFor = (kind, si) => (!kind || kind === 'off' ? 'off' : kind === 'mix' ? CAMERAS[Math.max(si, 0) % CAMERAS.length] : kind);
export const exitFor = (kind, si) => (!kind || kind === 'none' ? 'none' : kind === 'mix' ? EXIT_MIX[Math.max(si, 0) % EXIT_MIX.length] : kind);

// u = seconds since scene start; r = seconds left. Motion is deterministic so
// preview and export render the same frames. The old measured presets stay valid
// for compatibility with existing scripts/tests; the selectable catalogue is 100.
export function cameraState(camKind, exitKind, u, r) {
  const st = { dx: 0, dy: 0, s: 1, rot: 0, blur: 0 };
  const time = Math.max(0, u);

  if (camKind === 'riseup') {
    st.dy = 0.38 * H * Math.pow(1 - clamp01(time / 1.65), 3);
  } else if (camKind === 'settle') {
    st.s = (1 - 0.25 * Math.pow(1 - clamp01(time / 0.8), 1.5)) * (1 + 0.045 * clamp01(time / 2.2));
  } else if (camKind === 'slidein') {
    st.dx = 0.36 * W * Math.pow(1 - clamp01(time / 0.9), 3);
  } else if (camKind === 'pushin') {
    st.s = 1 + 0.12 * (1 - Math.exp(-time / 2.4));
  } else if (camKind === 'pullout') {
    st.s = 1.14 - 0.14 * (1 - Math.exp(-time / 1.8));
  } else if (camKind === 'panleft') {
    st.dx = -0.14 * W * (1 - Math.exp(-time / 1.25)); st.s = 1.08;
  } else if (camKind === 'panright') {
    st.dx = 0.14 * W * (1 - Math.exp(-time / 1.25)); st.s = 1.08;
  } else if (camKind === 'handheld') {
    st.dx = Math.sin(time * 5.1) * 5 + Math.sin(time * 2.3) * 3;
    st.dy = Math.sin(time * 4.2 + 0.7) * 4; st.rot = Math.sin(time * 2.8) * 0.008; st.s = 1.025;
  } else if (camKind === 'orbit') {
    const d = Math.min(time, 3.5);
    st.dx = Math.sin(d * 0.72) * W * 0.055; st.dy = Math.cos(d * 0.62) * H * 0.018;
    st.rot = Math.sin(d * 0.55) * 0.035; st.s = 1.08 + 0.025 * Math.sin(d * 0.6);
  } else {
    const preset = PRESET_BY_ID[camKind];
    if (preset) {
      const family = FAMILY_BY_ID[preset.family], k = preset.amount, q = clamp01(time / preset.duration);
      const e = q * q * (3 - 2 * q);
      const x = (family.x || 0) * W * k, y = (family.y || 0) * H * k;
      const z = (family.zoom || 0) * k;
      if (family.type === 'zoom') {
        st.s = 1 + z * e;
      } else if (family.type === 'move') {
        st.dx = x * e; st.dy = y * e; st.s = Math.max(0.72, 1 + z * e);
      } else if (family.type === 'orbit') {
        const phase = time * (0.8 + 0.13 * k) * family.direction;
        st.dx = Math.sin(phase) * W * 0.045 * k;
        st.dy = Math.sin(phase * 0.72 + 0.8) * H * 0.025 * k;
        st.rot = Math.sin(phase * 0.6) * 0.025 * k;
        st.s = 1.045 + 0.018 * Math.cos(phase) * k;
      } else if (family.type === 'arc') {
        st.dx = Math.sin(e * Math.PI) * W * 0.055 * k * family.direction;
        st.dy = -Math.sin(e * Math.PI / 2) * H * 0.075 * k * family.direction;
        st.rot = Math.sin(e * Math.PI) * 0.018 * k * family.direction;
        st.s = 1 + 0.04 * e * k;
      } else if (family.type === 'roll') {
        st.rot = family.direction * 0.11 * k * e;
        st.s = 1 + 0.055 * k * e;
      } else if (family.type === 'handheld') {
        st.dx = (Math.sin(time * 4.7) * 5 + Math.sin(time * 1.9) * 3) * k;
        st.dy = (Math.sin(time * 3.8 + 0.6) * 4 + Math.sin(time * 1.4) * 2) * k;
        st.rot = Math.sin(time * 2.5) * 0.009 * k; st.s = 1.025 + 0.012 * k;
      } else if (family.type === 'float') {
        st.dx = Math.sin(time * 0.9) * W * 0.018 * k;
        st.dy = Math.sin(time * 0.7 + 1) * H * 0.015 * k;
        st.rot = Math.sin(time * 0.6) * 0.012 * k; st.s = 1.035 + 0.012 * Math.sin(time * 0.8) * k;
      } else if (family.type === 'dollyzoom') {
        const d = e * family.direction;
        st.s = 1 + 0.17 * d * k;
        st.dx = -Math.sign(d) * W * 0.025 * e * k;
        st.dy = H * 0.012 * e * k;
      } else if (family.type === 'snap') {
        const snap = 1 - Math.exp(-q * 12);
        const settle = q > 0.62 ? 1 - (q - 0.62) / 0.38 : 1;
        st.s = 1 + 0.14 * k * snap * Math.max(0, settle);
        st.dx = Math.sin(q * Math.PI * 2) * W * 0.012 * k * (1 - e);
        st.blur = q < 0.24 ? (1 - q / 0.24) * 2.5 * k : 0;
      }
    }
  }

  const D = EXIT_LEN[exitKind];
  if (D && r < D) {
    const q = clamp01(1 - r / D);
    if (exitKind === 'whipup') { st.dy += -0.6 * H * Math.pow(q, 2.2); st.blur = Math.max(st.blur, q * 7); }
    else if (exitKind === 'slideout') { st.dx += 0.5 * W * Math.pow(q, 2.4); }
    else if (exitKind === 'zoompush') { st.s *= 1 + 1.6 * Math.pow(q, 2.2); st.blur = Math.max(st.blur, q * 5); }
  }
  return st;
}

export function applyCamera(ctx, st) {
  if (st.dx === 0 && st.dy === 0 && st.s === 1 && st.rot === 0 && !st.blur) return;
  ctx.translate(W / 2 + st.dx, H / 2 + st.dy);
  if (st.rot) ctx.rotate(st.rot);
  ctx.scale(st.s, st.s);
  ctx.translate(-W / 2, -H / 2);
  if (st.blur > 0.5) ctx.filter = `blur(${st.blur.toFixed(1)}px)`;
}
