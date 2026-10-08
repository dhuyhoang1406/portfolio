# Dang Huy Hoang — Personal workspace

A frontend portfolio built with Vite, React, TypeScript, React Three Fiber and Drei. The original room model is preserved. Click anywhere on the room model to approach the React desktop, then open About Me, Projects, Skills, Resume or Contact. Use **Back to room** or Escape to return. Production deployment uses GitHub Actions. Commit/push changes only when explicitly requested.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. `npm run build` produces `dist/`; `npm run preview` serves that build. Opening `index.html` directly as a file does not run Vite.

```sh
npm run typecheck
npm run lint
npm run build
# With the dev server running and Chrome installed:
npm run test:browser
npm run test:scroll # Wheel + scrollbar regression in 3D and 2D
```

The browser check uses `/usr/bin/google-chrome`; override with `CHROME_PATH`. Override the server with `BASE_URL`. Screenshots are written to `/tmp/hoang-*.png`.

## Directory layout

```text
public/
  documents/resume.pdf        # CV served by the app
  models/low_poly_room.glb    # Original room model
  sounds/clickMouseSound.mp3  # Your click sound
src/
  App.tsx                    # App mode, fallback and navigation
  main.tsx                   # React entry point
  data/profile.ts            # Personal portfolio content
  features/
    desktop/                 # Desktop UI and click playback
    room/                    # 3D scene and camera configuration
  styles/global.css          # App and responsive styles
  vite-env.d.ts
tests/browser-check.mjs      # Browser integration checks
```

Root files are project configuration, entry HTML and README. `node_modules/`, `dist/` and TypeScript build caches are generated and gitignored. Assets have a single canonical copy in `public/`; no `docs/` directory is required.

## Content and controls

- Edit `src/data/profile.ts` for identity, bio, skills, project descriptions, experience and contact links. Details are based on the supplied brief and the supplied CV. LifeHelper describes confirmed backend work, not unverified AI features. Project demos and images are absent because none were supplied.
- The real CV is served as `public/documents/resume.pdf`. Replace that file to update it. Clear `profile.resume` to hide the download link.
- Icons open one instance per application. Title bars support pointer dragging and focused arrow-key movement. Close/minimize buttons and taskbar restore controls support keyboard activation. Windows are constrained to the desktop, and reclamped by ResizeObserver. Mobile uses a fixed readable window area.
- On phones (viewport ≤760px), the app opens in 2D without downloading the room or 3D module. The Skip 3D button is removed; `?mode=2d` still starts directly in 2D. Missing WebGL, failed model loads or a lost WebGL context show the same portfolio.
- Reduced motion disables camera animation. Desktop pointer presses and keyboard activations play `public/sounds/clickMouseSound.mp3` when supplied. The supplied click audio is included at that path. Playback starts only on interaction; missing audio does not block desktop actions. For WAV/OGG, change the filename in `src/features/desktop/clickSound.ts`. Drag with the left mouse button to orbit the room; the wheel adjusts distance. A drag does not enter the desktop. Camera inputs are disabled during transitions and desktop use. Rendering uses demand frames and caps device pixel ratio at 1.5.

## Desktop design and theming

The desktop is an original **Hoang OS** design: a blue orbital wallpaper, custom SVG icons, active titlebars, explorer navigation, project case studies and a system taskbar. **Appearance** in the desktop header offers Paper, Midnight and Dusk plus a custom accent color. Choices persist in `localStorage` under `hoang-workspace-appearance`; unavailable storage falls back to the default without blocking the UI. Theme changes apply in both the 3D monitor and 2D/mobile desktop.

Desktop code is split by responsibility:

- `features/desktop/apps.ts`: application names and launcher descriptions.
- `features/desktop/Desktop.tsx`: one window per application, focus/stacking, constrained movement, maximize/restore and launcher/taskbar state. Minimized windows stay mounted to retain their scroll position. Taskbar clicks minimize the focused window or restore/raise another window. Double-clicking a title bar toggles maximization; normal window placement is retained.
- `features/desktop/AppContent.tsx`: portfolio application layouts backed by `data/profile.ts`.
- `features/desktop/ScrollArea.tsx`: visible, draggable DOM scrollbar with scaled pointer capture for the transformed 3D screen. Wheel input over both content and scrollbar is handled explicitly to avoid unreliable native scrolling inside CSS 3D transforms; touch scrolling remains native; the scrollbar also supports arrows, Page Up/Down, Home and End.
- `features/desktop/AppIcon.tsx`: original SVG icon geometry; no downloaded icon pack.
- `features/desktop/themes.ts`: theme presets, accents and storage validation.
- `features/desktop/ThemePanel.tsx`: accessible appearance controls with keyboard dismissal and focus return.
- `features/desktop/desktop.css`: desktop-only styles and theme surface/text/border variables. `styles/global.css` handles the outer app and room UI.

To add a theme, add a preset in `themes.ts` and the matching `.desktop[data-theme=...]` CSS variables in `desktop.css`. For small adjustments, edit those variables rather than rewriting every component. User-selected accents affect decorative details; action buttons use the theme's text/surface colors so a custom accent does not change their readability.

The reference review covered [Desktop.tsx](https://github.com/henryjeff/portfolio-inner-site/blob/master/src/components/os/Desktop.tsx), [Window.tsx](https://github.com/henryjeff/portfolio-inner-site/blob/master/src/components/os/Window.tsx), [Toolbar.tsx](https://github.com/henryjeff/portfolio-inner-site/blob/master/src/components/os/Toolbar.tsx), shortcut handling, shared window types and ShowcaseExplorer's application layout. Henry's application registry, shared window chrome and state-driven taskbar informed the separation of responsibilities. This implementation uses its own React state, pointer capture scaled to the 3D HTML surface, CSS variables, SVG icons, typography and portfolio layouts. No source code, branding, wallpaper, game applications, fonts or other assets from that repository were copied.

## Model and camera calibration

All placement is in `src/features/room/sceneConfig.ts`: model URL, normalization scale, room position/target, screen position/rotation/dimensions, logical desktop dimensions and FOV. Focus distance is computed from the screen dimensions and viewport aspect ratio. Entry and exit interpolate camera position and target over `transitionSeconds` (2.4 seconds), with smooth easing and exact final poses. `?debug` shows room axes/grid; normal mode has neither.

The GLB hierarchy was inspected with Three.js and its JSON/binary accessors:

```text
Sketchfab_model
└─ 691a46a2b6fb49679e2f859d0dbcfcde.fbx
   └─ RootNode
      └─ Cube.002
         ├─ Cube.002_UberTexture_0  (merged room + monitor)
         ├─ Cube.002_PC_Glass_0    (computer tower glass, NOT monitor)
         └─ Cube.002_Floor_0
```

Three.js sanitizes dots in object names. Materials are UberTexture, PC_Glass and Floor; one PNG is embedded. No compression extension is required. Normalized room bounds are approximately `[-4.299, 0, -5]` to `[4.299, 6.986, 5]`. The scale is `10 / 372.1778`; the root is translated to center X/Z and place its lowest point at Y=0. Meshes, materials and textures are unmodified.

The real monitor is inside the merged UberTexture geometry. Its inner plane is approximately X=-3.296612, Y=2.834714…3.864956, Z=-2.346511…-0.513332, facing +X. The React surface is slightly forward at X=-3.272 after its local offset, with Y rotation π/2. It uses `Html transform`, explicit distance factor and raycast occlusion against the original room. Its click plane shares the same configured position and dimensions. Hover outlines the screen. HTML pointer events are disabled in room mode so monitor clicks reach the 3D plane; interactive HTML is enabled after entry.

Loading covers the viewport with a black terminal-style screen while the renderer module, model and textures prepare. `features/room/LoadingScreen.tsx` provides shared boot UI; asset percentages come from Drei loading progress.

To replace the model, put the new GLB in `public/models/`, update the model URL, inspect its bounds and monitor plane, then recalibrate `scale`, `screen` and `room`. The old screen coordinates apply only to the supplied model. Match logical desktop aspect ratio to the actual screen and recheck bezel alignment, occlusion and camera focus at several viewport sizes. No Blender step is needed.

## References and asset rights

- Interaction reference: [Henry Heffernan](https://henryheffernan.com/), [3D source](https://github.com/henryjeff/portfolio-website), [desktop source](https://github.com/henryjeff/portfolio-inner-site). Cloned outside this project into `/tmp/henry-portfolio-reference` and `/tmp/henry-desktop-reference`. Read the 3D README, MIT license, Camera/CameraKeyframes, MonitorScreen/Hitboxes and desktop window state management. The inner repository README is empty and no separate license file was found. No Henry code, models, textures, sounds, fonts or desktop applications were copied.
- Chrome inspection reached the reference boot screen, distant desk, front desk camera and embedded OS. Moving over its screen triggers closer framing; source inspection confirms leaving the screen triggers departure. The new portfolio uses explicit click entry and a persistent Back button as requested. Exhaustive interactions with every reference application were not tested.
- **[Low Poly Room](https://sketchfab.com/3d-models/low-poly-room-a6bf7976f3ac401e96907aa5b8a0c1c1)** by **[IsaacTheMaverick](https://sketchfab.com/IsaacTheMaverick)**, **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**. Author, URL and license come from the supplied GLB's `asset.extras`. Attribution is also visible in About Me. Only runtime scale/translation and a separate React overlay were added; model geometry and embedded texture are preserved. Sketchfab returned HTTP 403 during independent page verification. No separate texture license is present in the supplied file; embedded artwork rights beyond the declared model license have not been independently verified.
- Fonts are system Arial/Helvetica/Georgia; icons are original SVG geometry and wallpaper is CSS. No external font or texture is fetched. Click audio is user supplied at `public/sounds/clickMouseSound.mp3`; the supplied MP3 is included. CV and personal content are user supplied. Unused legacy HTML assets have been removed.

## Verification and remaining limits

Completed A: actual model inspection, monitor placement, camera entry/exit and interactive React surface; checked in Chrome screenshots before final calibration was retained.

Completed B: five portfolio applications, constrained drag, focus ordering, minimize/restore/close, one instance per app and a working CV download.

Completed C: mobile 2D, model-error/WebGL fallback, lazy 3D loading, reduced motion, keyboard controls and responsive camera distance. Build, TypeScript and lint pass. Chrome automation covers room-wall click → Projects → scaled drag → minimize → restore → duplicate prevention → close → room return; Contact/Skills/Resume; resize; keyboard movement; Escape; reduced motion; aborted GLB; missing WebGL; and mobile avoiding GLB download. Additional checks cover orbit drag without entry, entry/exit duration, intermediate motion screenshots, absence of the Skip 3D button, audio playback requests without autoplay (using the supplied MP3), window scroll preservation, launcher, taskbar toggle, maximize/restore, all three themes, custom accent persistence mobile appearance controls, direct scrollbar dragging inside the 3D screen, actual wheel input over content and scrollbar across applications at 1860×931 in 3D/2D, scrollbar keyboard navigation and terminal loading. No uncaught errors were reported in the main interaction flow.

Visually inspected desktop room, focused monitor, full-screen 2D and a 390×844 mobile layout using headless Chrome with software WebGL. Firefox, Safari, real phone GPUs, screen readers and slow-device performance have not been tested. Vite reports a >500 kB 3D chunk (about 274 kB gzip); it is lazy loaded and absent from the initial 2D route. The monitor preserves the supplied room's bright pink wall and existing artwork. GitHub Pages builds and deploys the production bundle through GitHub Actions.

## GitHub Pages deployment

Pushes to `gh-pages` run `.github/workflows/deploy.yml`: install locked dependencies, lint, build, and deploy `dist`. Repository Settings → Pages → Source must be **GitHub Actions**. The production base is `/portfolio/`; local development stays at `/`. Source `index.html` requires Vite and must not be served directly by Pages.

To check the production build locally, run `npm run build` and `npm run preview`, then open `http://localhost:4173/portfolio/`. Browser checks accept `BASE_URL=http://localhost:4173/portfolio`.

## Workspace apps and content

Portfolio copy is grounded in the supplied CV and original profile: internship responsibilities, project contributions, education, scholarships and TOEIC. `src/data/profile.ts` owns the content; no unverified demos or project screenshots are shown. Project artwork is original CSS illustration.

`Music.tsx` plays the user-supplied MP3 collection in `public/music/`. The two synthesized loops have been removed. Titles and filenames are registered in `src/data/music.ts`. Playback requires a user click, supports seek/volume/track selection and local audio files, continues while minimized, and stops on window close. Local files use temporary browser object URLs and are never uploaded. Audio is fetched only when Music is opened. To add tracks, put audio files in `public/music/` and update `src/data/music.ts`.

`Arcade.tsx` embeds [Celeste Classic](https://maddymakesgamesinc.itch.io/celesteclassic), created by Maddy Thorson and Noel Berry, through its official itch.io embed-upload endpoint. No game source or assets are redistributed. Play creates the iframe, Restart reloads it, and Stop/close removes it. The 580×620 official embed wrapper is scaled to the window with ResizeObserver, including on mobile and the transformed monitor. The game needs internet and a keyboard; if the host fails, use the visible link to its official page. Cross-origin iframe load events cannot prove that every game asset loaded. `src/data/games.ts` owns the URL, native frame dimensions, controls and credits. To use your own game later, replace `embedUrl` with a hosted URL or a BASE_URL-prefixed path under `public/games/`, and update dimensions/metadata. Record animation and hover movement respect reduced-motion preferences.

Run `node tests/leisure-check.mjs` (optional `BASE_URL`) to verify manual music playback, minimized playback, track switching, local audio, window-close cleanup, external game lazy loading, restart/stop, Start search, Show desktop, richer content and mobile controls. Existing browser and scrollbar regression scripts still cover the 3D screen.

`os-shell.css` defines the current operating-system chrome: active titlebars, explorer menu/address bars, portfolio sidebar, searchable Start menu, taskbar clock and Show desktop. Windows support a scaled pointer resize handle and arrow-key resizing, with mobile using a fixed readable layout. Henry’s `Window`, `Toolbar`, `ShowcaseExplorer` and `MusicPlayer` were reviewed again for conventions; no source, branded icons or audio were copied.

Arcade’s **Fullscreen game** button requests fullscreen for the local viewport, centers the fixed-size external embed and scales it to fit both viewport dimensions. The embedded host’s fullscreen permission is disabled because its legacy layout does not center itself. Exit with the overlay button or Escape. The external PICO-8 player only offers its own Sound mute/unmute button; there is no supported cross-origin volume API, so the portfolio does not present a nonfunctional volume slider for the game.
