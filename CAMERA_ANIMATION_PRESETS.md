# Camera Animation Presets (100)

The editor includes 25 motion families with four strength profiles each: **Subtle**, **Classic**, **Cinematic**, and **Bold**. Choose a preset in **Style → Camera & reference style → Camera movement**. **Mix** cycles through the 100 preset IDs from scene to scene.

The implementation uses deterministic Canvas transforms and easing so preview and export use the same motion. These are original implementations inspired by broad, common camera concepts—not copied code. The camera option **“Slide in + constant drift”** is intentionally not included.

## Preset catalogue

### Dolly In · Dolly & Zoom
- Dolly In — Subtle
- Dolly In — Classic
- Dolly In — Cinematic
- Dolly In — Bold

### Dolly Out · Dolly & Zoom
- Dolly Out — Subtle
- Dolly Out — Classic
- Dolly Out — Cinematic
- Dolly Out — Bold

### Pan Left · Pan & Tilt
- Pan Left — Subtle
- Pan Left — Classic
- Pan Left — Cinematic
- Pan Left — Bold

### Pan Right · Pan & Tilt
- Pan Right — Subtle
- Pan Right — Classic
- Pan Right — Cinematic
- Pan Right — Bold

### Tilt Up · Pan & Tilt
- Tilt Up — Subtle
- Tilt Up — Classic
- Tilt Up — Cinematic
- Tilt Up — Bold

### Tilt Down · Pan & Tilt
- Tilt Down — Subtle
- Tilt Down — Classic
- Tilt Down — Cinematic
- Tilt Down — Bold

### Truck Left · Truck & Pedestal
- Truck Left — Subtle
- Truck Left — Classic
- Truck Left — Cinematic
- Truck Left — Bold

### Truck Right · Truck & Pedestal
- Truck Right — Subtle
- Truck Right — Classic
- Truck Right — Cinematic
- Truck Right — Bold

### Pedestal Up · Truck & Pedestal
- Pedestal Up — Subtle
- Pedestal Up — Classic
- Pedestal Up — Cinematic
- Pedestal Up — Bold

### Pedestal Down · Truck & Pedestal
- Pedestal Down — Subtle
- Pedestal Down — Classic
- Pedestal Down — Cinematic
- Pedestal Down — Bold

### Diagonal Push In · Left · Dolly & Zoom
- Diagonal Push In · Left — Subtle
- Diagonal Push In · Left — Classic
- Diagonal Push In · Left — Cinematic
- Diagonal Push In · Left — Bold

### Diagonal Push In · Right · Dolly & Zoom
- Diagonal Push In · Right — Subtle
- Diagonal Push In · Right — Classic
- Diagonal Push In · Right — Cinematic
- Diagonal Push In · Right — Bold

### Diagonal Pull Out · Left · Dolly & Zoom
- Diagonal Pull Out · Left — Subtle
- Diagonal Pull Out · Left — Classic
- Diagonal Pull Out · Left — Cinematic
- Diagonal Pull Out · Left — Bold

### Diagonal Pull Out · Right · Dolly & Zoom
- Diagonal Pull Out · Right — Subtle
- Diagonal Pull Out · Right — Classic
- Diagonal Pull Out · Right — Cinematic
- Diagonal Pull Out · Right — Bold

### Orbit Left · Orbit & Arc
- Orbit Left — Subtle
- Orbit Left — Classic
- Orbit Left — Cinematic
- Orbit Left — Bold

### Orbit Right · Orbit & Arc
- Orbit Right — Subtle
- Orbit Right — Classic
- Orbit Right — Cinematic
- Orbit Right — Bold

### Arc Up · Orbit & Arc
- Arc Up — Subtle
- Arc Up — Classic
- Arc Up — Cinematic
- Arc Up — Bold

### Arc Down · Orbit & Arc
- Arc Down — Subtle
- Arc Down — Classic
- Arc Down — Cinematic
- Arc Down — Bold

### Roll Clockwise · Roll & Organic
- Roll Clockwise — Subtle
- Roll Clockwise — Classic
- Roll Clockwise — Cinematic
- Roll Clockwise — Bold

### Roll Counterclockwise · Roll & Organic
- Roll Counterclockwise — Subtle
- Roll Counterclockwise — Classic
- Roll Counterclockwise — Cinematic
- Roll Counterclockwise — Bold

### Handheld Documentary · Roll & Organic
- Handheld Documentary — Subtle
- Handheld Documentary — Classic
- Handheld Documentary — Cinematic
- Handheld Documentary — Bold

### Gentle Floating Camera · Roll & Organic
- Gentle Floating Camera — Subtle
- Gentle Floating Camera — Classic
- Gentle Floating Camera — Cinematic
- Gentle Floating Camera — Bold

### Dolly Zoom In · Dolly & Zoom
- Dolly Zoom In — Subtle
- Dolly Zoom In — Classic
- Dolly Zoom In — Cinematic
- Dolly Zoom In — Bold

### Dolly Zoom Out · Dolly & Zoom
- Dolly Zoom Out — Subtle
- Dolly Zoom Out — Classic
- Dolly Zoom Out — Cinematic
- Dolly Zoom Out — Bold

### Snap Zoom + Settle · Dolly & Zoom
- Snap Zoom + Settle — Subtle
- Snap Zoom + Settle — Classic
- Snap Zoom + Settle — Cinematic
- Snap Zoom + Settle — Bold

## Open-source references studied

- [Amarel-Taylor-Scott/kenburns](https://github.com/Amarel-Taylor-Scott/kenburns) — deterministic pan/zoom paths and easing.
- [alikonfilms/comfyui_alikonfilms](https://github.com/alikonfilms/comfyui_alikonfilms) — camera-movement vocabulary such as dolly, pan, tilt, orbit, roll, handheld, and drone-style moves.
- [Vanilagy/mediabunny](https://github.com/Vanilagy/mediabunny) — browser-based media encoding used by the existing MP4/WebM export workflow.

These projects are references for concepts and workflows. Check each repository's license before reusing its code or assets.
