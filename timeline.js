import { W, H, easeOutCubic } from './util.js';

const $ = id => document.getElementById(id);
let nextId = 1;
const events = [];
let referenceImage = null;
let referenceUrl = '';


function makeEvent(data = {}) {
  return { id: nextId++, date: data.date || '', title: data.title || '', description: data.description || '', image: data.image || null, imageUrl: data.imageUrl || '' };
}
function updatePaletteFromReference() {
  if (!referenceImage || !$('timelineReferencePalette')?.checked) return;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 24;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(referenceImage, 0, 0, 24, 24);
    const data = g.getImageData(0, 0, 24, 24).data;
    let r = 0, green = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 32) continue;
      r += data[i]; green += data[i + 1]; b += data[i + 2]; n++;
    }
    if (!n) return;
    const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0');
    $('timelineLineColor').value = '#' + hex(r) + hex(green) + hex(b);
    $('timelineGlowColor').value = $('timelineLineColor').value;
    $('timelineMarkerColor').value = $('timelineLineColor').value;
  } catch (error) {
    console.warn('Could not sample reference image colours:', error);
  }
}
function renderEntries() {
  const box = $('timelineEntries');
  if (!box) return;
  box.replaceChildren();
  events.forEach((ev, index) => {
    const card = document.createElement('div');
    card.className = 'timeline-event';
    const head = document.createElement('div');
    head.className = 'timeline-event-head';
    const label = document.createElement('strong');
    label.textContent = 'Event ' + (index + 1);
    const actions = document.createElement('div');
    actions.className = 'timeline-event-actions';
    const up = document.createElement('button'); up.type = 'button'; up.textContent = '↑'; up.title = 'Move event up'; up.disabled = index === 0;
    up.onclick = () => { [events[index - 1], events[index]] = [events[index], events[index - 1]]; renderEntries(); };
    const down = document.createElement('button'); down.type = 'button'; down.textContent = '↓'; down.title = 'Move event down'; down.disabled = index === events.length - 1;
    down.onclick = () => { [events[index + 1], events[index]] = [events[index], events[index + 1]]; renderEntries(); };
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '✕'; remove.title = 'Remove event';
    remove.onclick = () => { if (ev.imageUrl) URL.revokeObjectURL(ev.imageUrl); events.splice(index, 1); if (!events.length) events.push(makeEvent()); renderEntries(); window.dispatchEvent(new Event('timelinechange')); };
    actions.append(up, down, remove);
    head.append(label, actions);
    const grid = document.createElement('div'); grid.className = 'grid timeline-event-fields';
    const field = (name, value, placeholder, multiline = false) => {
      const wrap = document.createElement('label'); wrap.textContent = name; wrap.className = name === 'Year / date' ? 'timeline-year-field' : '';
      const input = multiline ? document.createElement('textarea') : document.createElement('input');
      input.value = value; input.placeholder = placeholder;
      if (multiline) input.rows = 2;
      input.oninput = () => { ev[name === 'Year / date' ? 'date' : name === 'Title' ? 'title' : 'description'] = input.value; window.dispatchEvent(new Event('timelinechange')); };
      wrap.append(input); return wrap;
    };
    grid.append(field('Year / date', ev.date, 'Type a year, e.g. 1998'), field('Title', ev.title, 'Event title'), field('Description', ev.description, 'Optional details', true));
    const imageWrap = document.createElement('label'); imageWrap.className = 'timeline-image-field'; imageWrap.textContent = 'Event image';
    const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*';
    const status = document.createElement('span'); status.className = 'hint'; status.textContent = ev.image ? 'Image uploaded' : 'No image uploaded';
    file.onchange = async () => {
      const f = file.files?.[0]; if (!f) return;
      const url = URL.createObjectURL(f), img = new Image(); img.src = url;
      try { await img.decode(); } catch { URL.revokeObjectURL(url); status.textContent = 'Could not read image'; return; }
      if (ev.imageUrl) URL.revokeObjectURL(ev.imageUrl);
      ev.image = img; ev.imageUrl = url; status.textContent = f.name;
      renderEntries(); window.dispatchEvent(new Event('timelinechange'));
    };
    imageWrap.append(file, status);
    grid.append(imageWrap);
    if (ev.image) {
      const thumb = document.createElement('img'); thumb.className = 'timeline-thumb'; thumb.src = ev.imageUrl; thumb.alt = 'Event image preview'; grid.append(thumb);
    }
    card.append(head, grid); box.append(card);
  });
}
function readOptions() {
  const val = (id, fallback) => $(id) ? $(id).value : fallback;
  const checked = (id, fallback = false) => $(id) ? $(id).checked : fallback;
  return {
    enabled: checked('timelineEnabled'), orientation: val('timelineOrientation', 'horizontal'),
    line: val('timelineLineColor', '#ffd166'), glow: val('timelineGlowColor', '#ffb000'),
    text: val('timelineTextColor', '#ffffff'), marker: val('timelineMarkerColor', '#ffd166'),
    bg: val('timelineBgColor', '#050505'), gradientEnd: val('timelineGradientColor', '#00cfff'),
    gradient: checked('timelineGradient'), glowOn: checked('timelineGlow', true),
    lineWidth: Number(val('timelineLineWidth', 3)), glowStrength: Number(val('timelineGlowStrength', 12)),
    imageSize: Number(val('timelineImageSize', 88)), fontSize: Number(val('timelineFontSize', 42)), font: val('timelineFont', 'Inter'),
    duration: Math.max(.1, Number(val('timelineDuration', .7)) || .7),
    interval: Math.max(.2, Number(val('timelineInterval', 2.2)) || 2.2)
  };
}
export function timelineDuration() {
  const o = readOptions();
  return events.length ? Math.max(1, (events.length - 1) * o.interval + o.duration + 1.2) : 0;
}
export function timelineEnabled() { return readOptions().enabled && events.length > 0; }
export function initTimeline() {
  // Start with one editable event so the user immediately has a place to type a year.
  if (!events.length) events.push(makeEvent());
  renderEntries();
  $('timelineTheme')?.addEventListener('change', e => {
    const themes = {
      custom: null,
      gold: ['#ffd166','#ffb000','#ffffff','#ffd166','#050505','#00cfff'],
      neon: ['#00cfff','#b56bff','#ffffff','#ff5db1','#050510','#00ff9f'],
      vintage: ['#d6a96c','#a96f45','#f4e8d0','#d6a96c','#211b16','#8a9b70'],
      mono: ['#ffffff','#aaaaaa','#ffffff','#dddddd','#050505','#888888'],
      ocean: ['#00cfff','#0077ff','#ffffff','#00cfff','#061522','#67e8f9'],
      forest: ['#00d68f','#007f5f','#f1fff7','#00d68f','#071b14','#b7e4c7']
    };
    const colors = themes[e.target.value];
    if (colors) {
      ['timelineLineColor','timelineGlowColor','timelineTextColor','timelineMarkerColor','timelineBgColor','timelineGradientColor'].forEach((id, i) => { $(id).value = colors[i]; });
      window.dispatchEvent(new Event('timelinechange'));
    }
  });
  // Extract date/year mentions together with the sentence that explains each event.
  // Import automatically when the script's sequence of dates changes; keep manual event edits
  // intact while the user changes unrelated wording.
  const extractScriptEvents = () => {
    const script = $('script')?.value || '';
    const datePattern = /(?<!\d)(\d{1,4}\s*(?:BCE|BC|CE|AD)|(?:1[0-9]{3}|20[0-9]{2}|21[0-9]{2}))(?!\d)/gi;
    const found = [];
    const seen = new Set();
    const chunks = script.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
    for (const chunk of chunks) {
      for (const match of chunk.matchAll(datePattern)) {
        const rawDate = match[0].replace(/\s+/g, ' ').trim();
        const key = rawDate.toUpperCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const title = chunk
          .replace(match[0], '')
          .replace(/[{}\[\]*]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^[\s,;:—–-]+|[\s,;:—–-]+$/g, '')
          .trim();
        found.push({ date: rawDate, title: title || 'Event ' + (found.length + 1) });
      }
    }
    return found;
  };
  let lastAutoDateSignature = '';
  const importScriptEvents = (automatic = false) => {
    const extracted = extractScriptEvents();
    if (!extracted.length) {
      if (!automatic) $('timelineReferencePreview').textContent = 'No years or dates found in the script. Add years such as 1998 or 3000 BCE.';
      return;
    }
    const signature = extracted.map(ev => ev.date.toUpperCase()).join('|');
    if (automatic && signature === lastAutoDateSignature) return;
    lastAutoDateSignature = signature;
    if ($('timelineEnabled')) $('timelineEnabled').checked = true;
    events.forEach(ev => ev.imageUrl && URL.revokeObjectURL(ev.imageUrl));
    events.splice(0, events.length, ...extracted.map(ev => makeEvent(ev)));
    renderEntries(); window.dispatchEvent(new Event('timelinechange'));
    $('timelineReferencePreview').textContent = 'Detected ' + extracted.length + ' date/year event(s) from the script. Event titles were taken from the surrounding sentence; review or edit them below.';
  };
  $('timelineImportScript')?.addEventListener('click', () => importScriptEvents(false));
  $('script')?.addEventListener('input', () => importScriptEvents(true));
  $('script')?.addEventListener('change', () => importScriptEvents(true));
  $('timelineAdd')?.addEventListener('click', () => { events.push(makeEvent({ date: String(new Date().getFullYear()), title: 'New event' })); renderEntries(); window.dispatchEvent(new Event('timelinechange')); });
  $('timelineClear')?.addEventListener('click', () => { events.forEach(ev => ev.imageUrl && URL.revokeObjectURL(ev.imageUrl)); events.splice(0); events.push(makeEvent()); renderEntries(); window.dispatchEvent(new Event('timelinechange')); });
  $('timelineReference')?.addEventListener('change', async e => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f), img = new Image(); img.src = url;
    try { await img.decode(); } catch { URL.revokeObjectURL(url); $('timelineReferencePreview').textContent = 'Could not read that reference image.'; return; }
    if (referenceUrl) URL.revokeObjectURL(referenceUrl);
    referenceUrl = url; referenceImage = img;
    $('timelineReferencePreview').textContent = 'Reference loaded: ' + f.name + '. It guides the look; event content remains editable.';
    if ($('timelineReferencePalette').checked) updatePaletteFromReference();
    window.dispatchEvent(new Event('timelinechange'));
  });
  $('timelineReferencePalette')?.addEventListener('change', updatePaletteFromReference);
  ['timelineEnabled','timelineOrientation','timelineLineColor','timelineGlowColor','timelineTextColor','timelineMarkerColor','timelineBgColor','timelineGradientColor','timelineGradient','timelineGlow','timelineLineWidth','timelineGlowStrength','timelineImageSize','timelineFontSize','timelineFont','timelineDuration','timelineInterval'].forEach(id => {
    $(id)?.addEventListener('input', () => window.dispatchEvent(new Event('timelinechange')));
    $(id)?.addEventListener('change', () => window.dispatchEvent(new Event('timelinechange')));
  });
}
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
function drawGlowLine(ctx, x1, y1, x2, y2, o, progress) {
  const x = x1 + (x2 - x1) * progress, y = y1 + (y2 - y1) * progress;
  ctx.save();
  ctx.lineCap = 'round';
  if (o.glowOn && o.glowStrength > 0) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowStrength; ctx.strokeStyle = o.glow; ctx.globalAlpha = .7; ctx.lineWidth = o.lineWidth + 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke(); }
  const grad = o.gradient ? ctx.createLinearGradient(x1, y1, x2, y2) : null;
  if (grad) { grad.addColorStop(0, o.line); grad.addColorStop(1, o.gradientEnd); }
  ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.strokeStyle = grad || o.line; ctx.lineWidth = o.lineWidth;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  ctx.restore();
}
function drawCircularImage(ctx, img, x, y, size, progress, border) {
  ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, progress));
  ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.clip();
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale, h = img.height * scale;
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = border; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

/**
 * Draw a compact, transparent timeline overlay below the active script sentence.
 * Unlike drawTimeline(), this never clears the canvas, so the script and picture remain visible.
 */
export function drawTimelineOverlay(ctx, t, S, dateText) {
  if (!timelineEnabled()) return false;
  const o = readOptions();
  const normalise = value => String(value || '').replace(/\s+/g, '').toUpperCase();
  const ev = events.find(item => normalise(item.date) === normalise(dateText))
    || events.find(item => normalise(item.date).startsWith(normalise(dateText)))
    || events.find(item => normalise(dateText).startsWith(normalise(item.date)));
  if (!ev) return false;
  ctx.save();
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = 'none';
  const panelY = H * .70, panelH = H * .27;
  const p = easeOutCubic(Math.max(0, Math.min(1, t / Math.max(.1, o.duration))));
  // Semi-transparent panel keeps the original scene visible behind the overlay.
  ctx.fillStyle = 'rgba(0,0,0,0.76)';
  ctx.beginPath(); ctx.roundRect(W * .06, panelY, W * .88, panelH, 28); ctx.fill();
  const x1 = W * .13, x2 = W * .87, y = panelY + panelH * .37;
  drawGlowLine(ctx, x1, y, x1 + (x2 - x1) * p, y, o, p);
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = o.text;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowOn ? 6 : 0;
  ctx.font = '700 ' + Math.min(o.fontSize, 48) + 'px ' + JSON.stringify(o.font) + ', Arial, sans-serif';
  ctx.fillText(ev.date || dateText, W / 2, panelY + panelH * .18, W * .78);
  ctx.shadowBlur = 0;
  ctx.font = '600 ' + Math.max(18, Math.min(o.fontSize * .52, 28)) + 'px ' + JSON.stringify(o.font) + ', Arial, sans-serif';
  ctx.fillText(ev.title || '', W / 2, panelY + panelH * .60, W * .78);
  if (ev.description) {
    ctx.font = '400 18px ' + JSON.stringify(o.font) + ', Arial, sans-serif';
    ctx.fillText(ev.description, W / 2, panelY + panelH * .79, W * .78);
  }
  ctx.restore();
  ctx.restore();
  return true;
}

export function drawTimeline(ctx, t, S) {
  if (!timelineEnabled()) return false;
  const o = readOptions(), total = timelineDuration();
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = o.bg; ctx.fillRect(0, 0, W, H);
  const horizontal = o.orientation === 'horizontal';
  const pad = Math.max(70, o.imageSize / 2 + 24);
  const lineX1 = horizontal ? pad : W / 2, lineY1 = horizontal ? H * .53 : pad;
  const lineX2 = horizontal ? W - pad : W / 2, lineY2 = horizontal ? H * .53 : H - pad;
  const count = events.length;
  const lineP = easeOutCubic(Math.max(0, Math.min(1, t / Math.max(.1, total - .8))));
  drawGlowLine(ctx, lineX1, lineY1, lineX2, lineY2, o, lineP);
  events.forEach((ev, i) => {
    const start = i * o.interval, age = t - start;
    if (age < 0) return;
    const p = easeOutCubic(Math.max(0, Math.min(1, age / o.duration)));
    const x = horizontal ? lineX1 + (lineX2 - lineX1) * (count <= 1 ? .5 : i / (count - 1)) : W / 2;
    const y = horizontal ? H * .53 : lineY1 + (lineY2 - lineY1) * (count <= 1 ? .5 : i / (count - 1));
    const size = o.imageSize * p;
    ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = o.marker; ctx.lineWidth = 2.5;
    if (o.glowOn) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowStrength * .65; }
    ctx.fillStyle = o.bg; ctx.beginPath(); ctx.arc(x, y, Math.max(3, 7 * p), 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    const labelY = horizontal ? y - Math.max(45, o.imageSize * .65) : y - 18;
    const labelX = horizontal ? x : x + 42;
    ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = o.text; ctx.textAlign = horizontal ? 'center' : 'left'; ctx.textBaseline = 'middle';
    ctx.font = '700 ' + o.fontSize + 'px ' + JSON.stringify(o.font) + ', Arial, sans-serif';
    ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowOn ? 5 : 0;
    ctx.fillText(ev.date || 'Year', labelX, labelY, horizontal ? Math.max(80, (W - 2 * pad) / count) : W * .42);
    ctx.shadowBlur = 0; ctx.font = '600 ' + Math.max(18, o.fontSize * .52) + 'px ' + JSON.stringify(o.font) + ', Arial, sans-serif';
    ctx.fillText(ev.title || '', labelX, labelY + o.fontSize * .82, horizontal ? Math.max(80, (W - 2 * pad) / count) : W * .42);
    if (ev.description) { ctx.font = '400 ' + Math.max(14, o.fontSize * .32) + 'px ' + JSON.stringify(o.font) + ', Arial, sans-serif'; ctx.fillText(ev.description, labelX, labelY + o.fontSize * 1.42, horizontal ? Math.max(80, (W - 2 * pad) / count) : W * .42); }
    ctx.restore();
    if (ev.image && size > 1) {
      const ix = horizontal ? x : x - size * .7 - 18, iy = horizontal ? y + size * .72 + 20 : y;
      drawCircularImage(ctx, ev.image, ix, iy, size, p, o.marker);
    }
  });
  if (t >= total - .4) {
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, (total - t) / .4));
    ctx.fillStyle = o.text; ctx.font = '500 16px Inter, Arial, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('TIMELINE', W - 32, H - 28); ctx.restore();
  }
  ctx.restore();
  return true;
}
