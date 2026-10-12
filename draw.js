import { W, H, clamp01, easeOutCubic } from './util.js';
import { THEMES, ALTERNATE } from './themes.js';
import { ENTRANCES, ARCHIVE_ENTRANCES, entranceParams, drawPicture } from './pictures.js';
import { TRANSITIONS, TRANS_LEN, cameraPre, drawTransition, drawDeco, drawGhost, drawGiant, drawInk, drawBackdrop, cinematicPushState } from './fx.js';
import { CAMERAS, EXITS, cameraFor, exitFor, cameraState, applyCamera } from './camera.js';
import { drawText, TEXT_ANIMS, LAYOUTS } from './text.js';
import { drawOrbit, drawButton } from './icons.js';
import { drawPaper, drawEndCardOverlay, renderShowcase } from './wrapper.js';

export { W, H, TEXT_ANIMS, ENTRANCES, TRANSITIONS, LAYOUTS, CAMERAS, EXITS };

function drawWatermark(ctx, th, handle, handleIcon = 'youtube') {
  if (!handle) return;
  ctx.save();
  ctx.globalAlpha = 0.9; ctx.fillStyle = th.wm; ctx.strokeStyle = th.wm; ctx.lineWidth = 3;
  ctx.font = '500 26px Inter, Arial, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText(handle.toUpperCase(), W - 50, 150);
  const x = W - 74, y = 100;
  if (handleIcon === 'youtube') {
    ctx.fillStyle = '#FF0033';
    ctx.beginPath(); ctx.roundRect(x - 20, y - 14, 40, 28, 8); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.moveTo(x - 4, y - 7); ctx.lineTo(x + 8, y); ctx.lineTo(x - 4, y + 7); ctx.closePath(); ctx.fill();
  } else if (handleIcon === 'instagram') {
    ctx.beginPath(); ctx.roundRect(x - 18, y - 18, 36, 36, 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 11, y - 11, 2, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function drawOutro(ctx, th, a, handle) {
  ctx.fillStyle = th.outro; ctx.fillRect(0, 0, W, H);
  const p = easeOutCubic(Math.min(a / 0.5, 1));
  ctx.save();
  ctx.globalAlpha = p; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '800 64px Inter, Arial, sans-serif'; ctx.fillText(handle || '', W / 2, H / 2 - 20 + (1 - p) * 30);
  ctx.font = '800 50px Inter, Arial, sans-serif'; ctx.fillText('All rights reserved', W / 2, H / 2 + 50 + (1 - p) * 30);
  ctx.restore();
}

function sceneIndex(tl, t) {
  let si = tl.scenes.findIndex(s => t >= s.start && t < s.end);
  if (si < 0) si = t < tl.scenes[0].start ? -1 : tl.scenes.length - 1;
  return si;
}
const themeFor = (o, si) => (o.theme === 'alternate' ? THEMES[ALTERNATE[Math.max(si, 0) % 2]] : (THEMES[o.theme] || THEMES.editorial));
const ARCHIVE_TRANSITIONS = ['pageTurn', 'newspaper', 'archiveZoom', 'filmBurn', 'paperTear', 'zoom', 'blurin', 'wipe', 'flash'];

// Pair each camera's dominant movement with a transition that reinforces the same visual direction.
export function linkedTransitionFor(camera) {
  return ({
    riseup: 'bands', settle: 'iris', slidein: 'wipe', pushin: 'zoom', pullout: 'archiveZoom',
    panleft: 'wipe', panright: 'diagonal', handheld: 'glitch', orbit: 'iris'
  })[camera] || 'none';
}

function drawScene(ctx, t, S, tl, o) {
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.globalAlpha = 1; ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.filter = 'none'; ctx.setLineDash([]);
  const si = sceneIndex(tl, t), sc = si >= 0 ? tl.scenes[si] : null, th = themeFor(o, si);
  const sceneCamera = sc ? cameraFor(o.camera, si) : 'off';
  const linkedKind = o.linkMotionTransition && sceneCamera !== 'off' ? linkedTransitionFor(sceneCamera) : null;
  const tkind = sc && si > 0 ? (linkedKind || (o.trans && o.trans !== 'none' ? (o.trans === 'archiveMix' ? ARCHIVE_TRANSITIONS[(si - 1) % ARCHIVE_TRANSITIONS.length] : o.trans === 'mix' ? TRANSITIONS[(si - 1) % TRANSITIONS.length] : o.trans) : 'none')) : 'none';
  const tq = sc ? (t - sc.start) / TRANS_LEN : 1;

  ctx.save();
  if (tq >= 0 && tq < 1) cameraPre(ctx, tkind, tq);
  if (sc) {   // camera movement + scene exit (measured from the reference video)
    const ck = sceneCamera, xk = si < tl.scenes.length - 1 ? exitFor(o.camexit, si) : 'none';
    if (ck !== 'off' || xk !== 'none') {
      const speed = Number.isFinite(o.cameraSpeed) ? Math.max(0.5, Math.min(2, o.cameraSpeed)) : 1;
      applyCamera(ctx, cameraState(ck, xk, (t - sc.start) * speed, (sc.end - t) * speed));
    }
  }
  ctx.fillStyle = th.bg; ctx.fillRect(-W, -H, 3 * W, 3 * H);
  if (th.paper) drawPaper(ctx);
  drawDeco(ctx, th, o.deco, si, tl.scenes.length, t);

  // current picture
  let ai = -1;
  tl.events.forEach((e, i) => { if (e.t <= t) ai = i; });
  const hasImg = ai >= 0, hasIcons = !!(sc && sc.icons && sc.icons.length);
  const textCy = hasImg || hasIcons ? 1500 : 960;
  const cxOff = o.picPos === 'alt' && hasImg ? (ai % 2 ? 1 : -1) * 130 : 0;

  if (sc && sc.ghost) drawGhost(ctx, th, sc.ghost, t - sc.start, textCy);
  if (sc && sc.giant) drawGiant(ctx, th, sc.giant, t - sc.start, t, 1500);
  if (hasImg) {
    const ev = tl.events[ai], age = t - ev.t, p = Math.min(age / 0.55, 1);
    drawBackdrop(ctx, th, o.backdrop, 330 + cxOff, 720, age);
    if (ai > 0 && age < 0.25) {
      const pcx = o.picPos === 'alt' ? ((ai - 1) % 2 ? 1 : -1) * 130 : 0;
      drawPicture(ctx, tl.events[ai - 1].img, 720, { pop: 1, alpha: 1 - age / 0.25, rot: 0, kb: 1, dx: 0, dy: 0, sm: 1, sx: 1, blur: 0, pivot: false }, o.picStyle, pcx);
    }
    const kind = o.entrance === 'archiveMix' ? ARCHIVE_ENTRANCES[ai % ARCHIVE_ENTRANCES.length] : (!o.entrance || o.entrance === 'mix' ? ENTRANCES[ai % ENTRANCES.length] : o.entrance);
    drawPicture(ctx, ev.img, 720, entranceParams(kind, p, age), o.picStyle, cxOff);
  } else if (o.backdrop && o.backdrop !== 'auto' && o.backdrop !== 'none' && sc) {
    drawBackdrop(ctx, th, o.backdrop, 330, 720, t - sc.start);
  }
  if (sc && o.splash) {
    const key = sc.words.find(w => w.emph);
    if (key) drawInk(ctx, th, W / 2, textCy, t - key.t, si + 1);
  }
  if (hasIcons) drawOrbit(ctx, th, sc.icons, W / 2, 720, 380, t, t - sc.start);
  if (sc) drawText(ctx, sc, t, th, textCy, o, si);
  if (sc && sc.button) {
    const start = sc.end - Math.min(1.9, (sc.end - sc.start) * 0.65);
    drawButton(ctx, th, sc.button, hasImg || hasIcons ? 1700 : 1250, t - start);
  }
  ctx.restore();
  drawWatermark(ctx, th, o.handle, o.handleIcon);

  if (sc && tkind !== 'none') drawTransition(ctx, th, sc, t, tkind, si);
}

// o = { theme, handle, picStyle, picPos, entrance, trans, camera, camexit, textAnim, textExit, layout, fontSet,
//       deco, backdrop, splash, reflect, endStyle, wrapper }
function renderDesign(ctx, t, S, tl, o) {
  if (!tl || !tl.scenes.length) {
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.filter = 'none';
    ctx.fillStyle = themeFor(o, 0).bg; ctx.fillRect(0, 0, W, H);
    return;
  }
  if (tl.hasOutro && t >= tl.outroStart) {
    if (o.endStyle === 'dim') {
      drawScene(ctx, tl.outroStart - 0.02, S, tl, o);
      drawEndCardOverlay(ctx, t - tl.outroStart, o.handle);
    } else {
      ctx.setTransform(S, 0, 0, S, 0, 0); ctx.filter = 'none';
      drawOutro(ctx, themeFor(o, tl.scenes.length - 1), t - tl.outroStart, o.handle);
    }
    return;
  }
  drawScene(ctx, t, S, tl, o);
}

const cinematicBuffers = new WeakMap();

function drawCinematicPush(ctx, t, tl) {
  const target = ctx.canvas;
  const w = target.width, h = target.height;
  if (!w || !h || !target.ownerDocument) return false;
  let buffer = cinematicBuffers.get(target);
  if (!buffer) {
    const canvas = target.ownerDocument.createElement('canvas');
    buffer = { canvas, ctx: canvas.getContext('2d') };
    if (!buffer.ctx) return false;
    cinematicBuffers.set(target, buffer);
  }
  if (buffer.canvas.width !== w || buffer.canvas.height !== h) {
    buffer.canvas.width = w;
    buffer.canvas.height = h;
  }
  const sc = tl?.scenes?.find(scene => t >= scene.start && t < scene.end);
  const state = cinematicPushState(t, sc);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w, h);
  const x = (w - w * state.scale) / 2;
  const y = (h - h * state.scale) / 2;
  ctx.drawImage(buffer.canvas, x, y, w * state.scale, h * state.scale);

  // Soft edge vignette gives the push a cinematic lens finish without changing the theme.
  const radius = Math.max(w, h) * 0.72;
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.16, w / 2, h / 2, radius);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.64, 'rgba(0,0,0,0.045)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);

  // A short diagonal anamorphic light sweep sells the forward motion at each scene entrance.
  if (state.sweep > 0.001) {
    const progress = 1 - state.sweep ** (1 / 1.5);
    const sx = -w * 0.28 + progress * w * 1.7;
    const beam = ctx.createLinearGradient(sx - w * 0.12, 0, sx + w * 0.12, h);
    beam.addColorStop(0, 'rgba(255,255,255,0)');
    beam.addColorStop(0.48, `rgba(190,220,255,${0.14 * state.sweep})`);
    beam.addColorStop(0.52, `rgba(255,255,255,${0.20 * state.sweep})`);
    beam.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.06, 0); ctx.lineTo(sx + w * 0.06, 0);
    ctx.lineTo(sx - w * 0.20, h); ctx.lineTo(sx - w * 0.32, h);
    ctx.closePath(); ctx.fill();
  }
  // Preserve the transform expected by the editor's timeline overlays.
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  return true;
}

export function renderFrame(ctx, t, S, tl, o) {
  if (o.motionPreset !== 'cinematicPush') {
    if (o.wrapper) renderShowcase(ctx, t, S, tl, (g, s) => renderDesign(g, t, s, tl, o));
    else renderDesign(ctx, t, S, tl, o);
    return;
  }

  const target = ctx.canvas;
  const doc = target?.ownerDocument;
  if (!doc || !target.width || !target.height) {
    if (o.wrapper) renderShowcase(ctx, t, S, tl, (g, s) => renderDesign(g, t, s, tl, o));
    else renderDesign(ctx, t, S, tl, o);
    return;
  }
  let buffer = cinematicBuffers.get(target);
  if (!buffer) {
    const canvas = doc.createElement('canvas');
    buffer = { canvas, ctx: canvas.getContext('2d') };
    if (!buffer.ctx) {
      if (o.wrapper) renderShowcase(ctx, t, S, tl, (g, s) => renderDesign(g, t, s, tl, o));
      else renderDesign(ctx, t, S, tl, o);
      return;
    }
    cinematicBuffers.set(target, buffer);
  }
  if (buffer.canvas.width !== target.width || buffer.canvas.height !== target.height) {
    buffer.canvas.width = target.width;
    buffer.canvas.height = target.height;
  }
  buffer.ctx.setTransform(1, 0, 0, 1, 0, 0);
  buffer.ctx.globalAlpha = 1; buffer.ctx.filter = 'none'; buffer.ctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
  if (o.wrapper) renderShowcase(buffer.ctx, t, S, tl, (g, s) => renderDesign(g, t, s, tl, o));
  else renderDesign(buffer.ctx, t, S, tl, o);

  // The standalone effect is composited after the full existing frame, so it never rewrites
  // camera, transition, picture, typography, theme, or quick-style settings.
  if (tl?.hasOutro && t >= tl.outroStart) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(buffer.canvas, 0, 0);
    ctx.setTransform(S, 0, 0, S, 0, 0);
    return;
  }
  drawCinematicPush(ctx, t, tl);
}
