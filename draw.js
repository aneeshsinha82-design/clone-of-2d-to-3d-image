import { W, H, clamp01, easeOutCubic } from './util.js';
import { THEMES, ALTERNATE } from './themes.js';
import { ENTRANCES, ARCHIVE_ENTRANCES, entranceParams, drawPicture } from './pictures.js';
import { TRANSITIONS, TRANS_LEN, cameraPre, drawTransition, drawDeco, drawGhost, drawGiant, drawInk, drawBackdrop } from './fx.js';
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
    riseup: 'matchBands', settle: 'matchIris', slidein: 'matchPanLeft', pushin: 'matchZoom', pullout: 'matchPullout',
    panleft: 'matchPanLeft', panright: 'matchPanRight', handheld: 'matchGlitch', orbit: 'matchIris'
  })[camera] || 'none';
}


let linkedBuffers = null;
function getLinkedBuffers(ctx) {
  const source = ctx.canvas;
  const doc = source.ownerDocument || (typeof document !== 'undefined' ? document : null);
  if (!doc) return null;
  if (!linkedBuffers || linkedBuffers.a.width !== source.width || linkedBuffers.a.height !== source.height) {
    const a = doc.createElement('canvas'), b = doc.createElement('canvas');
    a.width = b.width = source.width; a.height = b.height = source.height;
    linkedBuffers = { a, b, ac: a.getContext('2d'), bc: b.getContext('2d') };
  }
  return linkedBuffers;
}
const easeLink = p => { p = Math.max(0, Math.min(1, p)); return p * p * (3 - 2 * p); };
function paintScaled(ctx, image, scale, focusX, focusY, alpha = 1) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.translate(focusX, focusY); ctx.scale(scale, scale); ctx.translate(-focusX, -focusY);
  ctx.drawImage(image, 0, 0, cw, ch); ctx.restore();
}
function drawLinkedTransition(ctx, t, S, tl, o, si) {
  const buffers = getLinkedBuffers(ctx);
  if (!buffers) { drawScene(ctx, t, S, tl, { ...o, linkMotionTransition: false, trans: 'none' }); return; }
  const sc = tl.scenes[si], prev = tl.scenes[si - 1];
  const q = easeLink((t - sc.start) / TRANS_LEN);
  const plainOpts = { ...o, linkMotionTransition: false, trans: 'none' };
  drawScene(buffers.ac, Math.max(prev.start, prev.end - 0.001), S, tl, plainOpts);
  drawScene(buffers.bc, t, S, tl, plainOpts);
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const fx = cw * 0.5, fy = Math.min(ch * 0.48, 720 * S);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, cw, ch);
  const kind = linkedTransitionFor(cameraFor(o.camera, si));
  if (kind === 'matchZoom') {
    paintScaled(ctx, buffers.a, 1 + 0.42 * q, fx, fy, 1);
    const blend = easeLink(Math.max(0, (q - 0.16) / 0.84));
    paintScaled(ctx, buffers.b, 1.42 - 0.42 * q, fx, fy, blend);
  } else if (kind === 'matchPullout') {
    paintScaled(ctx, buffers.a, 1 - 0.20 * q, fx, fy, 1);
    const blend = easeLink(Math.max(0, (q - 0.12) / 0.88));
    paintScaled(ctx, buffers.b, 0.80 + 0.20 * q, fx, fy, blend);
  } else if (kind === 'matchPanLeft' || kind === 'matchPanRight') {
    const dir = kind === 'matchPanLeft' ? -1 : 1;
    ctx.drawImage(buffers.a, -dir * cw * q, 0, cw, ch);
    ctx.drawImage(buffers.b, dir * cw * (1 - q), 0, cw, ch);
    ctx.globalAlpha = 0.12 * Math.sin(Math.PI * q);
    const grad = ctx.createLinearGradient(0, 0, cw, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1;
  } else if (kind === 'matchBands') {
    ctx.drawImage(buffers.a, 0, 0);
    const n = 8, bandH = ch / n;
    for (let i = 0; i < n; i++) {
      const delay = Math.abs(i - (n - 1) / 2) / n * 0.22;
      const p = easeLink((q - delay) / Math.max(0.01, 1 - delay));
      ctx.save(); ctx.beginPath(); ctx.rect(0, i * bandH, cw * p, bandH + 1); ctx.clip();
      ctx.drawImage(buffers.b, 0, 0); ctx.restore();
    }
  } else if (kind === 'matchIris') {
    ctx.drawImage(buffers.a, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, Math.hypot(cw, ch) * q, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(buffers.b, 0, 0); ctx.restore();
  } else if (kind === 'matchGlitch') {
    const blend = easeLink((q - 0.08) / 0.92);
    ctx.drawImage(buffers.a, 0, 0);
    ctx.globalAlpha = blend;
    ctx.drawImage(buffers.b, -(1 - q) * cw * 0.012, 0, cw, ch);
    ctx.globalAlpha = 1;
    if (q < 0.72) {
      ctx.globalAlpha = (1 - q) * 0.22; ctx.fillStyle = '#e8f4ff';
      for (let i = 0; i < 5; i++) ctx.fillRect(0, ((i * 0.173 + q * 0.71) % 1) * ch, cw, Math.max(1, ch * 0.006));
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.drawImage(buffers.a, 0, 0); ctx.globalAlpha = q; ctx.drawImage(buffers.b, 0, 0); ctx.globalAlpha = 1;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
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
  const si = sceneIndex(tl, t), sc = si >= 0 ? tl.scenes[si] : null;
  if (o.linkMotionTransition && sc && si > 0 && t >= sc.start && t < sc.start + TRANS_LEN) {
    drawLinkedTransition(ctx, t, S, tl, o, si);
    return;
  }
  drawScene(ctx, t, S, tl, o);
}

export function renderFrame(ctx, t, S, tl, o) {
  if (o.wrapper) renderShowcase(ctx, t, S, tl, (g, s) => renderDesign(g, t, s, tl, o));
  else renderDesign(ctx, t, S, tl, o);
}
