# Open-Source Motion Learning Guide — 100 GitHub Repositories

A curated study list for improving **camera animation, kinetic typography, text styling, transitions, and rendering** in this project.

- Target project: [clone-of-2d-to-3d-image](https://github.com/aneeshsinha82-design/clone-of-2d-to-3d-image)
- Original source repository is intentionally excluded from edits: [2d-image-to-3d](https://github.com/aneeshsinha82-design/2d-image-to-3d)
- These are learning references, not a claim that code from every project has been copied into this app.
- **Before reusing code or assets:** inspect each repository's current license, attribution requirements, dependencies, and compatibility. Publicly viewable does not automatically mean unrestricted reuse.

## Suggested learning order

1. **Camera and scene motion:** easing curves, camera orbit/pan/zoom, time-based animation, and motion continuity.
2. **Text animation:** character/word staggering, masks, kinetic layout, glitch, blur, wave, and typewriter effects.
3. **Transitions:** pixel reveals, wipes, circles, shader transitions, and exit/entrance choreography.
4. **Rendering:** deterministic frame output, Canvas/WebGL effects, post-processing, and performance.
5. **Quality:** preserve existing controls, test preview/export parity, and add automated tests for each new mode.

## 100 public repositories to study

### Camera movement, 3D scenes, and motion graphics

1. **[motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas)** — *Motion graphics*: Frame-based scene and camera choreography.
2. **[motion-canvas/examples](https://github.com/motion-canvas/examples)** — *Motion graphics*: Practical motion-graphics examples.
3. **[remotion-dev/remotion](https://github.com/remotion-dev/remotion)** — *Programmatic video*: Frame-accurate rendering and reusable video compositions.
4. **[alyssaxuu/motionity](https://github.com/alyssaxuu/motionity)** — *Motion editor*: Keyframes, layers, masks, text and filters.
5. **[mojs/mojs](https://github.com/mojs/mojs)** — *Motion graphics*: Burst, shape, and kinetic effects.
6. **[pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber)** — *3D animation*: Three.js scenes in React.
7. **[pmndrs/drei](https://github.com/pmndrs/drei)** — *3D helpers*: Camera and scene helper patterns.
8. **[mrdoob/three.js](https://github.com/mrdoob/three.js)** — *3D graphics*: Camera controls, geometry, and shaders.
9. **[14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig)** — *3D and scroll*: Scroll-linked 3D movement.
10. **[pmndrs/three-stdlib](https://github.com/pmndrs/three-stdlib)** — *3D helpers*: Reusable Three.js controls.
11. **[pmndrs/lamina](https://github.com/pmndrs/lamina)** — *3D materials*: Layered shader materials.
12. **[pmndrs/cannon-es](https://github.com/pmndrs/cannon-es)** — *3D physics*: Physics-driven object movement.
13. **[pmndrs/ecctrl](https://github.com/pmndrs/ecctrl)** — *3D camera control*: Third-person camera control patterns.
14. **[pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx)** — *3D assets*: Integrating GLTF models.
15. **[donmccurdy/three-gltf-viewer](https://github.com/donmccurdy/three-gltf-viewer)** — *3D viewer*: Model viewer camera patterns.
16. **[spite/THREE.MeshLine](https://github.com/spite/THREE.MeshLine)** — *3D lines*: Line and trail rendering.
17. **[mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D)** — *3D rendering*: Camera and point-cloud rendering.
18. **[google/model-viewer](https://github.com/google/model-viewer)** — *3D viewer*: Orbit camera and interaction controls.
19. **[BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js)** — *3D engine*: Camera and animation systems.
20. **[playcanvas/engine](https://github.com/playcanvas/engine)** — *3D engine*: Realtime camera and rendering patterns.
21. **[gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)** — *3D optimization*: Efficient 3D scene queries.
22. **[pmndrs/meshline](https://github.com/pmndrs/meshline)** — *3D lines*: Smooth 3D line and trail rendering.
23. **[davidfig/pixi-viewport](https://github.com/davidfig/pixi-viewport)** — *2D camera*: Viewport movement, zoom, and camera controls.

### Text styles and kinetic typography

24. **[animate-css/animate.css](https://github.com/animate-css/animate.css)** — *CSS animation*: Entrance, exit, and attention effects.
25. **[yesiamrocks/cssanimation](https://github.com/yesiamrocks/cssanimation)** — *CSS animation*: Letter, word, and line animations.
26. **[ingram-projects/animxyz](https://github.com/ingram-projects/animxyz)** — *CSS animation*: Composable motion presets.
27. **[miniMAC/magic](https://github.com/miniMAC/magic)** — *CSS animation*: Special-effect animation patterns.
28. **[Martz90/vivify](https://github.com/Martz90/vivify)** — *CSS animation*: Lightweight preset animations.
29. **[phuocng/css-animation](https://github.com/phuocng/css-animation)** — *CSS animation*: Small CSS motion experiments.
30. **[YananLee/ae-text-animator](https://github.com/YananLee/ae-text-animator)** — *Text animation*: After Effects-style text presets.
31. **[pablostanley/typexperiments](https://github.com/pablostanley/typexperiments)** — *Text animation*: Per-glyph canvas animation.
32. **[hubertlim/GlyphFlow](https://github.com/hubertlim/GlyphFlow)** — *Text animation*: Animated glyph layout and flowing text.
33. **[Ashborn-047/kinetic-typography](https://github.com/Ashborn-047/kinetic-typography)** — *Text animation*: Glitch, wave, pixel, and 3D text effects.
34. **[chenglou/pretext](https://github.com/chenglou/pretext)** — *Text layout*: Fast text measurement and line layout.
35. **[lexxakaatune/Css-animations](https://github.com/lexxakaatune/Css-animations)** — *CSS animation*: Text and page-transition patterns.
36. **[UstymUkhman/Dynamic.css](https://github.com/UstymUkhman/Dynamic.css)** — *CSS animation*: CSS animation presets.
37. **[midudev/tailwind-animations](https://github.com/midudev/tailwind-animations)** — *CSS animation*: Utility-based animation presets.

### Transitions, wipes, and visual effects

38. **[argyleink/transition.css](https://github.com/argyleink/transition.css)** — *Transitions*: Composable wipes, circles, and shape transitions.
39. **[7PH/powerglitch](https://github.com/7PH/powerglitch)** — *Glitch effects*: Digital glitch distortion.
40. **[codrops/PixelTransition](https://github.com/codrops/PixelTransition)** — *Transitions*: Pixel-grid image reveal concepts.
41. **[pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)** — *Post-processing*: Glow, blur, and cinematic effects.
42. **[pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing)** — *Post-processing*: Composing visual effects.
43. **[glslify/glsl-transition](https://github.com/glslify/glsl-transition)** — *Transitions*: Shader-based transition effects.
44. **[reactjs/react-transition-group](https://github.com/reactjs/react-transition-group)** — *Transitions*: Enter/exit lifecycle patterns.
45. **[jquery/jquery.transit](https://github.com/jquery/jquery.transit)** — *Transitions*: CSS transform transitions.
46. **[simeydotme/pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css)** — *CSS effects*: Layered shine and parallax effects.
47. **[webkul/micron](https://github.com/webkul/micron)** — *Micro-interactions*: Small interaction animations.
48. **[barbajs/barba](https://github.com/barbajs/barba)** — *Page transitions*: Page-change choreography.
49. **[swup/swup](https://github.com/swup/swup)** — *Page transitions*: Transition lifecycle and plugins.
50. **[pixijs/filters](https://github.com/pixijs/filters)** — *2D effects*: Glow, blur, and color filters.
51. **[svgdotjs/svg.filter.js](https://github.com/svgdotjs/svg.filter.js)** — *SVG effects*: SVG filter effects.

### Animation engines and reusable motion systems

52. **[greensock/GSAP](https://github.com/greensock/GSAP)** — *Animation engine*: Timeline sequencing, easing, and smooth camera moves.
53. **[animejs/anime](https://github.com/animejs/anime)** — *Animation engine*: Staggered motion and per-character effects.
54. **[motiondivision/motion](https://github.com/motiondivision/motion)** — *Animation engine*: Declarative animation and layout transitions.
55. **[popmotion/popmotion](https://github.com/popmotion/popmotion)** — *Animation engine*: Physics, tweening, and interpolation.
56. **[tweenjs/tween.js](https://github.com/tweenjs/tween.js)** — *Animation engine*: Reusable tween timing.
57. **[velocity/velocity](https://github.com/velocity/velocity)** — *Animation engine*: Timed transforms and UI motion.
58. **[triggerjs/trigger](https://github.com/triggerjs/trigger)** — *Scroll animation*: Attribute-driven motion triggers.
59. **[theatre-js/theatre](https://github.com/theatre-js/theatre)** — *Motion design*: Visual sequencing and keyframe controls.
60. **[pmndrs/react-spring](https://github.com/pmndrs/react-spring)** — *Physics animation*: Spring-driven movement.
61. **[pmndrs/maath](https://github.com/pmndrs/maath)** — *Motion utilities*: Easing and math utilities.
62. **[darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)** — *Scroll motion*: Smooth scroll timing.
63. **[locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll)** — *Scroll motion*: Scroll-triggered scenes.
64. **[scrollreveal/scrollreveal](https://github.com/scrollreveal/scrollreveal)** — *Scroll motion*: Reveal timing and stagger.
65. **[dixonandmoe/rellax](https://github.com/dixonandmoe/rellax)** — *Parallax*: Depth-like parallax movement.
66. **[joshwcomeau/react-flip-move](https://github.com/joshwcomeau/react-flip-move)** — *Layout animation*: FLIP transitions.
67. **[formkit/auto-animate](https://github.com/formkit/auto-animate)** — *Layout animation*: Automatic layout changes.
68. **[motionone/motion](https://github.com/motionone/motion)** — *Animation engine*: Web Animations API techniques.
69. **[vueuse/motion](https://github.com/vueuse/motion)** — *Framework motion*: Vue animation patterns.
70. **[alexfoxy/lax.js](https://github.com/alexfoxy/lax.js)** — *Scroll animation*: Scroll-linked transforms.
71. **[janpaepke/ScrollMagic](https://github.com/janpaepke/ScrollMagic)** — *Scroll animation*: Scroll scenes and trigger timing.
72. **[michalsnik/aos](https://github.com/michalsnik/aos)** — *Scroll animation*: Scroll-reveal presets.
73. **[lukehaas/Scrollify](https://github.com/lukehaas/Scrollify)** — *Scroll interaction*: Section-based scrolling.

### Canvas, SVG, shaders, audio, and rendering

74. **[airbnb/lottie-web](https://github.com/airbnb/lottie-web)** — *Vector animation*: Lottie animation playback.
75. **[lottie-react-native/lottie-react-native](https://github.com/lottie-react-native/lottie-react-native)** — *Vector animation*: Lottie runtime and playback patterns.
76. **[pixijs/pixijs](https://github.com/pixijs/pixijs)** — *2D rendering*: GPU-accelerated canvas-like rendering.
77. **[processing/p5.js](https://github.com/processing/p5.js)** — *Creative coding*: Procedural animation and visual experiments.
78. **[paperjs/paper.js](https://github.com/paperjs/paper.js)** — *Vector graphics*: Vector paths and geometry animation.
79. **[konvajs/konva](https://github.com/konvajs/konva)** — *Canvas graphics*: Canvas layers and object transforms.
80. **[fabricjs/fabric.js](https://github.com/fabricjs/fabric.js)** — *Canvas graphics*: Text and image manipulation.
81. **[regl-project/regl](https://github.com/regl-project/regl)** — *WebGL*: GPU rendering patterns.
82. **[glslify/glslify](https://github.com/glslify/glslify)** — *Shaders*: Reusable GLSL shader modules.
83. **[glslify/glsl-noise](https://github.com/glslify/glsl-noise)** — *Shaders*: Procedural noise.
84. **[svgdotjs/svg.js](https://github.com/svgdotjs/svg.js)** — *SVG graphics*: SVG drawing and transforms.
85. **[pixijs/sound](https://github.com/pixijs/sound)** — *Audio*: Audio playback and synchronization.
86. **[javierbyte/react-lottie-player](https://github.com/javierbyte/react-lottie-player)** — *Vector animation*: Lottie playback controls.
87. **[dotlottie/player-component](https://github.com/dotlottie/player-component)** — *Vector animation*: Web animation player controls.
88. **[d3/d3](https://github.com/d3/d3)** — *Data visualization*: Scales, interpolation, and transitions.
89. **[observablehq/plot](https://github.com/observablehq/plot)** — *Visualization*: Visual storytelling and chart design.
90. **[mattdesl/canvas-sketch](https://github.com/mattdesl/canvas-sketch)** — *Creative coding*: Canvas-based generative motion.
91. **[webgpu/webgpu-samples](https://github.com/webgpu/webgpu-samples)** — *GPU graphics*: Modern GPU animation techniques.
92. **[mattdesl/glslify](https://github.com/mattdesl/glslify)** — *Shader tools*: Shader tooling and effects.
93. **[sergey-pimenov/awesome-web-animation](https://github.com/sergey-pimenov/awesome-web-animation)** — *Reference list*: More animation libraries and learning links.

### Additional motion and frontend references

94. **[d3/d3-transition](https://github.com/d3/d3-transition)** — *Data animation*: Interpolation and transitions.
95. **[maxwellito/vivus](https://github.com/maxwellito/vivus)** — *SVG animation*: SVG stroke-drawing animation.
96. **[DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)** — *UI animation*: Interactive animated components.
97. **[codse/animata](https://github.com/codse/animata)** — *UI animation*: Reusable visual component effects.
98. **[pmndrs/use-gesture](https://github.com/pmndrs/use-gesture)** — *Gesture interaction*: Pointer, drag, and gesture controls.
99. **[cocos/cocos-engine](https://github.com/cocos/cocos-engine)** — *Game engine*: Animation and transition systems.
100. **[visgl/deck.gl](https://github.com/visgl/deck.gl)** — *GPU visualization*: Camera transitions and scene layers.

## Integration checklist

- Add new camera modes behind explicit options; preserve existing modes and keep **“Slide in + constant drift”** absent.
- Keep timing deterministic so the same timestamp renders the same frame in preview and export.
- Add new text presets without changing the default text style unexpectedly.
- Keep transitions opt-in and avoid adding third-party runtime dependencies unless needed.
- Add tests for new modes, invalid inputs, scene boundaries, and export timing.
- Check upstream licenses before adapting implementations and credit authors when required.
