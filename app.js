import { parseScript, buildTimeline } from './engine.js';
import { analyzeVoice, applyVoiceSync } from './sync.js';
import { renderFrame, W, H } from './draw.js';
import { setCanvasDimensions } from './util.js';
import { initTimeline, drawTimeline, drawTimelineOverlay, timelineDuration, timelineEnabled } from './timeline.js';

const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
const state = { images: [], audioBuf: null, voice: null, marks: {}, marksFor: '', tl: null, nextId: 1 };
initTimeline();
let curT = 0, playing = false, exporting = false;

$('script').value = `Tired of poor *Marketing*? {?}

People don't want *services* {icons:gear,headset,24/7,user}

They want *status* and *success*.

Let's make it *happen*. ((Book Now))`;

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const getOpts = () => ({
  theme: $('theme').value, handle: $('handle').value.trim(), handleIcon: $('handleIcon').value, picStyle: $('picstyle').value, picPos: $('picpos').value,
  entrance: $('entrance').value, trans: $('trans').value, camera: $('camera').value, cameraSpeed: +$('cameraSpeed').value / 100, camexit: $('camexit').value, textAnim: $('textanim').value, textExit: $('textexit').value,
  layout: $('layout').value, fontSet: $('fontset').value, deco: $('deco').value, backdrop: $('backdrop').value,
  splash: $('splash').checked, reflect: $('reflect').checked, endStyle: $('endstyle').value, wrapper: $('wrapper').checked
});
const draw = (t, S) => {
  // Keep the normal script scene visible. When a scene contains a year/date,
  // animate that event's timeline underneath the text while that sentence plays.
  renderFrame(ctx, t, S, state.tl, getOpts());
  if (!timelineEnabled() || !state.tl?.scenes?.length) return;
  const scene = state.tl.scenes.find(sc => !sc.timeline && t >= sc.start && t < sc.end);
  if (!scene) return;
  const dateWordIndex = scene.words.findIndex(w => /(?:\d{3,4}\s*(?:BCE|BC|CE|AD)?)/i.test(w.text));
  if (dateWordIndex < 0) return;
  const dateWord = scene.words[dateWordIndex];
  const dateMatch = dateWord.text.match(/\d{3,4}\s*(?:BCE|BC|CE|AD)?/i);
  if (!dateMatch) return;

  // Pair the date with the image matched to the same sentence. Prefer an image
  // attached to the date word, then the nearest image word in that sentence,
  // and only then the nearest image event in the script.
  const sceneIndex = state.tl.scenes.indexOf(scene);
  const sceneEvents = state.tl.events.filter(e => e.scene === sceneIndex);
  let imageEvent = sceneEvents.find(e => e.wi === dateWordIndex);
  if (!imageEvent && sceneEvents.length) {
    imageEvent = sceneEvents.reduce((best, e) =>
      Math.abs(e.wi - dateWordIndex) < Math.abs(best.wi - dateWordIndex) ? e : best
    );
  }
  if (!imageEvent && state.tl.events.length) {
    imageEvent = state.tl.events.reduce((best, e) =>
      Math.abs(e.t - dateWord.t) < Math.abs(best.t - dateWord.t) ? e : best
    );
  }
  const relatedImage = imageEvent?.img?.el || null;
  drawTimelineOverlay(ctx, Math.max(0, t - dateWord.t), S, dateMatch[0], relatedImage);
};
// when paused at the very start, show a "poster" frame (first picture + first words) instead of a blank screen
const shownT = () => {
  const tl = state.tl;
  if (curT > 0 || !tl || !tl.total) return curT;
  const first = tl.events.length ? tl.events[0].t : (tl.scenes[0] ? tl.scenes[0].start : 0);
  return Math.min(first + 1.0, tl.total);
};

function updateResolutionLabels() {
  const aspect = $('aspect').value;
  [...$('res').options].forEach(option => {
    const edge = Number(option.value);
    let width = edge, height = Math.round(edge * 16 / 9);
    if (aspect === 'landscape') { width = Math.round(edge * 16 / 9); height = edge; }
    else if (aspect === 'square') { width = edge; height = edge; }
    const name = edge === 720 ? 'HD' : edge === 1080 ? 'Full HD' : '2K / 1440p';
    option.textContent = `${name} ${width}×${height}`;
  });
}
function applyAspect() {
  setCanvasDimensions($('aspect').value);
  cv.width = Math.round(W / 2);
  cv.height = Math.round(H / 2);
  updateResolutionLabels();
}

/* ---------- quick style preset ---------- */
const PRESETS = {
  archive: { theme: 'paper', trans: 'archiveMix', camera: 'pushin', camexit: 'pullout', cameraSpeed: 70, layout: 'ladder', textanim: 'mix', textexit: 'none',
    fontset: 'editorial', picstyle: 'polaroid', picpos: 'center', deco: 'archive', backdrop: 'none', entrance: 'archiveMix' },
  miracle: { theme: 'alternate', trans: 'none', camera: 'mix', camexit: 'mix', layout: 'ladder', textanim: 'mix', textexit: 'none',
    fontset: 'agency', picstyle: 'cutout', backdrop: 'circle', deco: 'min', entrance: 'mix' }
};
$('preset').onchange = e => {
  const p = PRESETS[e.target.value]; if (!p) return;
  Object.keys(p).forEach(k => { $(k).value = p[k]; });
  $('splash').checked = false; $('reflect').checked = false;
  refresh();
};

/* ---------- pictures ---------- */
$('imgs').onchange = async e => {
  const skipped = [];
  for (const f of e.target.files) {
    const url = URL.createObjectURL(f), el = new Image();
    el.src = url;
    try { await el.decode(); } catch { skipped.push(f.name); URL.revokeObjectURL(url); continue; }
    state.images.push({ id: state.nextId++, name: f.name.replace(/\.[^.]+$/, ''), el, url });
  }
  e.target.value = ''; renderList(); refresh();
  $('imgmsg').textContent = skipped.length ? `Could not read ${skipped.length} file(s): ${skipped.join(', ')}. Use JPG, PNG or WebP (iPhone HEIC photos are not supported — convert them first).` : '';
};
function renderList() {
  const box = $('imglist'); box.innerHTML = '';
  state.images.forEach((im, i) => {
    const d = document.createElement('div'); d.className = 'card';
    d.innerHTML = `<img src="${im.url}"><div><div class="num">#${i + 1}</div><input value="${esc(im.name)}" placeholder="name / trigger words"><div class="row"></div></div><div></div>`;
    d.querySelector('input').oninput = e => { im.name = e.target.value; refresh(); };
    const row = d.querySelector('.row');
    const mk = (t, fn) => { const b = document.createElement('button'); b.textContent = t; b.onclick = fn; row.appendChild(b); };
    const swap = (a, b) => { [state.images[a], state.images[b]] = [state.images[b], state.images[a]]; renderList(); refresh(); };
    mk('Insert [tag]', () => insertTag(im, i));
    mk('↑', () => { if (i > 0) swap(i - 1, i); });
    mk('↓', () => { if (i < state.images.length - 1) swap(i, i + 1); });
    mk('✕', () => { state.images.splice(i, 1); renderList(); refresh(); });
    box.appendChild(d);
  });
}
function insertTag(im, i) {
  const ta = $('script'), tag = `[${(im.name.split(',')[0] || String(i + 1)).trim()}] `;
  const p = ta.selectionStart;
  ta.value = ta.value.slice(0, p) + tag + ta.value.slice(ta.selectionEnd);
  ta.focus(); ta.selectionStart = ta.selectionEnd = p + tag.length; refresh();
}

/* ---------- voice-over ---------- */
$('aud').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const ac = new AudioContext();
  try {
    state.audioBuf = await ac.decodeAudioData(await f.arrayBuffer());
    state.voice = analyzeVoice(state.audioBuf.getChannelData(0), state.audioBuf.sampleRate);
    state.marks = {};
    const v = state.voice;
    $('audname').textContent = `${f.name} · ${state.audioBuf.duration.toFixed(1)}s · ` + (v.blocks.length ? `${v.blocks.length} speech parts, ${v.pauses.length} pauses found` : 'no clear speech found (using even stretch)');
  }
  catch { $('audname').textContent = 'Could not read that audio file.'; state.audioBuf = null; state.voice = null; }
  ac.close(); refresh();
};

/* ---------- timeline ---------- */
function enforceTimelineDurations(tl) {
  if (!tl?.scenes?.length || !timelineEnabled()) return;
  const wanted = timelineDuration();
  tl.scenes.forEach((scene, index) => {
    if (!scene.timeline) return;
    const delta = wanted - (scene.end - scene.start);
    scene.end = scene.start + wanted;
    if (scene.words[0]) scene.words[0].dur = wanted;
    scene.phrases.forEach(p => { p.start = scene.start; p.end = scene.end; });
    if (Math.abs(delta) < 0.001) return;
    tl.scenes.slice(index + 1).forEach(next => {
      next.start += delta; next.end += delta;
      next.words.forEach(w => { w.t += delta; });
      next.phrases.forEach(p => { p.start += delta; p.end += delta; });
    });
    tl.events.forEach(e => { if (e.scene > index) e.t += delta; });
    tl.total += delta;
    if (tl.outroStart !== undefined) tl.outroStart += delta;
  });
}
function refresh() {
  $('wpmv').textContent = $('wpm').value + ' wpm';
  $('cameraSpeedValue').textContent = (+$('cameraSpeed').value / 100).toFixed(1) + '×';
  const aDur = state.audioBuf ? state.audioBuf.duration : 0, smart = $('syncmode').value === 'smart' && state.voice;
  const bo = { wpm: +$('wpm').value, autoFill: $('autofill').checked, outro: $('outro').checked };
  $('syncoffv').textContent = (+$('syncoff').value / 1000).toFixed(2) + ' s';
  if (state.marksFor !== $('script').value) state.marks = {};   // taps belong to one exact script
  state.tl = buildTimeline(parseScript($('script').value), state.images, { ...bo, audioDur: smart ? 0 : aDur, timelineDuration: timelineEnabled() ? timelineDuration() : 4 });
  if (smart) {
    const ok = applyVoiceSync(state.tl, state.voice, { offset: +$('syncoff').value / 1000, marks: state.marks, audioDur: aDur });
    if (!ok) state.tl = buildTimeline(parseScript($('script').value), state.images, { ...bo, audioDur: aDur, timelineDuration: timelineEnabled() ? timelineDuration() : 4 });
  }
  enforceTimelineDurations(state.tl);
  curT = Math.min(curT, state.tl.total);
  const tl = $('tl'); tl.innerHTML = '';
  state.tl.scenes.forEach((sc, i) => {
    const evs = state.tl.events.filter(e => e.scene === i);
    const d = document.createElement('div'); d.className = 'sc';
    d.innerHTML = `<b>Scene ${i + 1}</b>${state.marks[i] !== undefined ? ' 📍' : ''} · ${fmt(sc.start)}–${fmt(sc.end)}<br>${esc(sc.words.map(w => w.text).join(' '))}` +
      (evs.length ? '<br>' + evs.map(e => `<span class="ev">🖼 ${esc(e.img.name || '#')} @ “${esc(sc.words[e.wi].text)}”</span>`).join(' · ') : '<br><span>no picture</span>');
    tl.appendChild(d);
  });
  draw(shownT(), cv.width / W); updateTime();
}
window.addEventListener('timelinechange', refresh);
['script', 'wpm', 'autofill', 'outro', 'theme', 'handle', 'handleIcon', 'picstyle', 'picpos', 'entrance', 'trans', 'textanim', 'textexit', 'layout', 'fontset', 'deco', 'backdrop', 'splash', 'reflect', 'endstyle', 'wrapper', 'sfx', 'syncmode', 'syncoff', 'camera', 'cameraSpeed', 'camexit'].forEach(id => {
  $(id).addEventListener('input', refresh); $(id).addEventListener('change', refresh);
});
$('aspect').addEventListener('change', () => { applyAspect(); refresh(); });
$('format').addEventListener('change', () => {
  $('export').textContent = $('format').value === 'mp4' ? '⬇ Export MP4' : '⬇ Export WebM';
});

/* ---------- audio: voice-over + whoosh sound effects ---------- */
let pactx = null, srcNode = null, sfxNodes = [];
function stopAudio() {
  try { srcNode && srcNode.stop(); } catch { }
  sfxNodes.forEach(n => { try { n.stop(); } catch { } });
  srcNode = null; sfxNodes = [];
}
function startVoice(actx, dest, offset, when) {
  if (!state.audioBuf || offset >= state.audioBuf.duration) return null;
  const s = actx.createBufferSource(); s.buffer = state.audioBuf; s.connect(dest); s.start(when, offset); return s;
}
function whoosh(actx, dest, when, vol) {
  const len = Math.floor(actx.sampleRate * 0.45), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) { const x = i / len; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.min(1, x * 1.2)) * (1 - x); }
  const src = actx.createBufferSource(); src.buffer = buf;
  const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(500, when); f.frequency.exponentialRampToValueAtTime(3500, when + 0.4);
  const g = actx.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(dest); src.start(when); return src;
}
function startSfx(actx, dest, fromT, baseTime) {
  if (!$('sfx').checked || !state.tl) return [];
  const times = [...state.tl.events.map(e => e.t), ...state.tl.scenes.slice(1).map(s => s.start)];
  return times.filter(t => t >= fromT).map(t => whoosh(actx, dest, Math.max(baseTime, baseTime + (t - fromT) - 0.05), 0.35));
}

/* ---------- tap-to-sync: press at the start of every scene while the voice plays ---------- */
let tap = null;
function showTapInfo() {
  const n = state.tl.scenes.length, sc = state.tl.scenes[tap.idx];
  $('tapinfo').textContent = `Scene ${tap.idx + 1} of ${n}: press when the voice says “${sc.words.slice(0, 4).map(w => w.text).join(' ')}…”`;
}
function doTap() {
  if (!tap) return;
  tap.marks[tap.idx] = Math.max(0, tap.actx.currentTime - tap.startAt - 0.15);   // 0.15 s = human reaction time
  tap.idx++;
  if (tap.idx >= state.tl.scenes.length) finishTap(); else showTapInfo();
}
function finishTap() {
  if (!tap) return;
  state.marks = { ...tap.marks }; state.marksFor = $('script').value;
  try { tap.src && tap.src.stop(); } catch { }
  tap.actx.close(); tap = null; $('tapbox').hidden = true; $('tapstart').disabled = false;
  $('syncmode').value = 'smart'; refresh();
}
$('tapstart').onclick = () => {
  if (!state.audioBuf) { $('audname').textContent = 'Add a voice-over first.'; return; }
  if (tap || exporting) return;
  pause();
  const actx = new AudioContext(); actx.resume();
  const startAt = actx.currentTime + 0.1;
  tap = { actx, startAt, idx: 0, marks: {}, src: startVoice(actx, actx.destination, 0, startAt) };
  $('tapbox').hidden = false; $('tapstart').disabled = true; showTapInfo();
};
$('tapnext').onclick = doTap;
$('tapdone').onclick = finishTap;
$('tapclear').onclick = () => { state.marks = {}; refresh(); };
document.addEventListener('keydown', e => {
  if (tap && e.code === 'Space') { e.preventDefault(); doTap(); }
});

/* ---------- playback ---------- */
let raf = 0;
function updateTime() {
  const tot = state.tl ? state.tl.total : 0;
  $('time').textContent = `${fmt(curT)} / ${fmt(tot)}`;
  $('seek').value = tot ? curT / tot * 1000 : 0;
}
function play() {
  if (exporting || tap || !state.tl.total) return;
  if (curT >= state.tl.total - 0.05) curT = 0;
  playing = true; $('play').textContent = '❚❚ Pause';
  pactx = pactx || new AudioContext(); pactx.resume();
  const now = pactx.currentTime + 0.05;
  srcNode = startVoice(pactx, pactx.destination, curT, now);
  sfxNodes = startSfx(pactx, pactx.destination, curT, now);
  const base = performance.now() - curT * 1000;
  const loop = () => {
    if (!playing) return;
    curT = (performance.now() - base) / 1000;
    if (curT >= state.tl.total) { curT = state.tl.total; pause(); }
    draw(curT, cv.width / W); updateTime();
    if (playing) raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}
function pause() { playing = false; cancelAnimationFrame(raf); stopAudio(); $('play').textContent = '▶ Play'; }
$('play').onclick = () => playing ? pause() : play();
$('seek').oninput = e => {
  const was = playing; if (was) pause();
  curT = e.target.value / 1000 * state.tl.total; draw(shownT(), cv.width / W); updateTime();
  if (was) play();
};

/* ---------- MP4 / WebM export via Mediabunny ---------- */
async function renderAudioForExport(total) {
  const withSfx = $('sfx').checked && state.tl;
  if (!state.audioBuf && !withSfx) return null;
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineCtx) throw new Error('Offline audio rendering is unavailable in this browser.');
  const sampleRate = state.audioBuf?.sampleRate || 48000;
  const frameCount = Math.max(1, Math.ceil(total * sampleRate));
  const offline = new OfflineCtx(2, frameCount, sampleRate);
  if (state.audioBuf) {
    const voice = offline.createBufferSource();
    voice.buffer = state.audioBuf;
    voice.connect(offline.destination);
    voice.start(0);
  }
  if (withSfx) {
    const times = [...state.tl.events.map(e => e.t), ...state.tl.scenes.slice(1).map(s => s.start)];
    times.filter(t => t >= 0 && t < total).forEach(t => whoosh(offline, offline.destination, Math.max(0, t - 0.05), 0.35));
  }
  return offline.startRendering();
}

$('export').onclick = async () => {
  if (exporting || !state.tl?.total) return;
  pause();
  exporting = true;
  $('export').disabled = true;
  let output = null, videoSource = null, audioSource = null;
  const originalAspect = $('aspect').value;
  try {
    await Promise.all([
      '800 40px Inter', '300 40px Inter', '500 40px Inter',
      'italic 500 40px "Playfair Display"', '500 40px "Playfair Display"',
      '400 40px Anton', '700 40px "Dancing Script"', '700 40px Caveat',
      '400 40px "Space Mono"', '700 40px "Space Mono"'
    ].map(f => document.fonts.load(f).catch(() => {})));

    $('expstat').textContent = 'Loading browser video encoder…';
    const {
      Output, Mp4OutputFormat, WebMOutputFormat, BufferTarget,
      CanvasSource, AudioBufferSource, Quality
    } = await import('https://esm.sh/mediabunny@1.61.3');

    const aspect = $('aspect').value;
    const edge = Number($('res').value);
    const fps = Number($('fps').value);
    let outW = edge, outH = Math.round(edge * 16 / 9);
    if (aspect === 'landscape') { outW = Math.round(edge * 16 / 9); outH = edge; }
    else if (aspect === 'square') { outW = edge; outH = edge; }

    setCanvasDimensions(aspect);
    cv.width = outW;
    cv.height = outH;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const S = outW / W;
    const format = $('format').value;
    const isMp4 = format === 'mp4';
    const bitrate = edge >= 1440 ? 32e6 : edge >= 1080 ? 20e6 : 10e6;
    const audioBuffer = await renderAudioForExport(state.tl.total);
    const target = new BufferTarget();
    output = new Output({
      format: isMp4 ? new Mp4OutputFormat() : new WebMOutputFormat(),
      target
    });
    videoSource = new CanvasSource(cv, {
      codec: isMp4 ? 'avc' : 'vp9',
      quality: new Quality({ bitrate })
    });
    output.addVideoTrack(videoSource, { frameRate: fps });

    if (audioBuffer) {
      audioSource = new AudioBufferSource({
        codec: isMp4 ? 'aac' : 'opus',
        quality: new Quality({ bitrate: 192000 })
      });
      output.addAudioTrack(audioSource);
    }

    await output.start();
    if (audioSource && audioBuffer) {
      $('expstat').textContent = 'Encoding audio…';
      await audioSource.add(audioBuffer);
      audioSource.close();
    }

    const total = state.tl.total;
    const frameCount = Math.ceil(total * fps);
    const frameDuration = 1 / fps;
    for (let i = 0; i < frameCount; i++) {
      const t = i / fps;
      draw(t, S);
      await videoSource.add(t, Math.min(frameDuration, total - t));
      if (i % Math.max(1, Math.floor(fps / 2)) === 0 || i === frameCount - 1) {
        $('expstat').textContent = `Rendering ${Math.min(99, Math.round((i + 1) / frameCount * 100))}% · ${outW}×${outH} · ${fps} FPS`;
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    }
    videoSource.close();
    await output.finalize();
    const buffer = target.buffer;
    if (!buffer) throw new Error('The encoder did not produce an output file.');
    const mime = isMp4 ? 'video/mp4' : 'video/webm';
    const ext = isMp4 ? 'mp4' : 'webm';
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([buffer], { type: mime }));
    a.href = url;
    a.download = `script-video-${outW}x${outH}-${fps}fps.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('expstat').textContent = `Done — saved ${a.download}${audioBuffer ? ' with audio' : ' without an audio track'}.`;
  } catch (error) {
    try { if (output && typeof output.cancel === 'function') await output.cancel(); } catch {}
    console.error('Video export failed:', error);
    $('expstat').textContent = `Export failed: ${error?.message || error}. Try a supported browser/codec or lower the resolution.`;
  } finally {
    try { videoSource?.close(); } catch {}
    try { audioSource?.close(); } catch {}
    setCanvasDimensions(originalAspect);
    cv.width = Math.round(W / 2);
    cv.height = Math.round(H / 2);
    exporting = false;
    $('export').disabled = false;
    $('export').textContent = $('format').value === 'mp4' ? '⬇ Export MP4' : '⬇ Export WebM';
    refresh();
  }
};

applyAspect();
document.fonts.ready.then(refresh); refresh();
