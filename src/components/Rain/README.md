# Rain

Canvas-based precipitation overlay, plus the rain ambience that goes with it.

Mounts when the WET or INTERMEDIATE compound is selected (F1 mode) and unmounts as soon as a dry
compound is picked, so neither the render loop nor the audio exists while it is off. Both compounds
are badged with a rain icon in the timer settings so the effect is discoverable before selecting
them.

INTERMEDIATE is the lighter of the two: fewer, shorter and slower drops, lower opacity, no vignette,
and a fixed `rain-int.mp3` loop instead of the pickable tracks. Both looks live in `RAIN_LOOKS`
in `src/constants/Rain.ts`.

`fullscreen` portals the overlay to `document.body` and pins it to the viewport, so an ancestor with
a `transform` cannot break the fixed positioning:

```tsx
<Rain fullscreen color='#6c8fd6' opacity={0.6} />
```

Without it the overlay fills its nearest positioned ancestor and inherits that element's border
radius:

```tsx
<Box position='relative' rounded='3xl'>
  <Rain color='#6c8fd6' opacity={0.6} />
</Box>
```

## Props

Every prop is optional and falls back to a per-shape preset, so `<Rain />` and `<Rain shape='snow' />`
both look right without tuning.

| Prop         | Default (rain / snow) | Description                                                    |
| ------------ | --------------------- | -------------------------------------------------------------- |
| `shape`      | `'rain'`              | `'rain'` draws angled streaks, `'snow'` draws swaying dots     |
| `color`      | `#c3dcff` / `#ffffff` | Any CSS color                                                  |
| `amount`     | `180` / `130`         | Particle count, clamped to 1200                                |
| `speed`      | `880` / `70`          | Fall speed in px per second                                    |
| `wind`       | `150` / `45`          | Horizontal drift in px/s; also sets the angle. Negative = left |
| `gust`       | `0.35` / `0.6`        | `0`–`1`, how much the wind breathes over time                  |
| `dropWidth`  | `1.4` / `5`           | Streak thickness, or flake diameter for snow                   |
| `dropLength` | `20` / `0`            | Streak length (rain only)                                      |
| `opacity`    | `0.5` / `0.85`        | Overall alpha                                                  |
| `paused`     | `false`               | Freezes the loop, leaving the last frame on screen             |
| `zIndex`     | `2`                   | Stacking order within the parent                               |

## Performance

- One `<canvas>` and one `requestAnimationFrame` loop — no per-particle DOM nodes.
- Particles are pooled and recycled on respawn, so the loop allocates nothing and does not churn GC.
- Drawing is batched into **three** calls per frame — one `stroke()` (or `fill()`) per depth layer.
  Layers also give the parallax: nearer particles are larger, faster and more opaque.
- Device pixel ratio is capped at 2, so a 3x phone does not pay for 9x the fill.
- Movement is delta-time based and the delta is clamped to 50 ms, so speed is identical at 30, 60 or
  144 Hz and there is no jump after the tab is backgrounded.
- The loop stops on `visibilitychange` and restarts on return.
- `prefers-reduced-motion: reduce` renders a single static frame instead of animating.

Measured cost per frame at the default 180 drops, well inside the 16.7 ms budget:
Chromium 0.015 ms, WebKit 0.035 ms (at DPR 2), Firefox 0.85 ms.

## Sound

`useRainSound(intensity)` streams one of the loops in `public/sounds/` from a plain
`HTMLAudioElement`, where `intensity` is `'wet'`, `'intermediate'` or `null`. It fades in and out
over 600 ms and keeps playing across session, short break and long break — it is tied to the
compound, not the timer state.

WET picks from three tracks (`rain-1.mp3`, `rain-2.mp3`, `rain-3.mp3`), listed in
`src/constants/Rain.ts`. The select labels them from a single `rainTrackLabel` message plus the
index — "Rain 1", "Rain 2", "Rain 3" — so a fourth file needs no new copy. The pick lives in
`rainTrack` in the settings store, so it persists to localStorage. INTERMEDIATE
always uses `rain-int.mp3` and hides the select. Switching track or compound tears the element down
and builds a new one, which fades in like a fresh start.

It deliberately does **not** use Howler, unlike the one-shot cues in `useSounds`. Howler only wires
`loop` to Web Audio's `bufferSource`; in `html5` mode it emulates looping through the `ended` event,
which misfires on WebKit — the element never starts and fires `ended` in a tight loop instead. A
native `audio.loop = true` is handled by the browser and works everywhere. Web Audio without
`html5` is not an option either: it would decode the whole file into memory.

Muting pauses the element rather than tearing it down, so toggling never re-downloads the file and
playback resumes where it left off. If `play()` is rejected — Safari sometimes decides the gesture
has lapsed — it retries on the next pointer or key event.

The hook keeps the live element in a module-scoped reference and exports `applyRainVolume`, which
sets the element's volume without going through React or the store. There is exactly one rain
element by construction, and the controls need to move the volume on every pointer move.

`RainSoundControls` is the dock in the bottom-left corner of the viewport. It carries the track
select (WET only), a mute toggle and a volume slider, backed by `rainTrack` / `rainSoundEnabled` /
`rainVolume` in the settings store. Volume changes are applied to the live element, so dragging the
slider never restarts the loop.

These controls are independent of the global `enableSounds` / `volume` settings, which govern the
one-shot timer cues. Rain is ambience and has its own switch.

Playback starts from the click that selects the compound, which satisfies browser autoplay policies.
The selected compound is not persisted, so a reload never tries to start audio without a gesture.

### Why the slider does not lag

The slider is driven by local state, not by the store. Writing `rainVolume` on every pointer move
would re-serialise the whole settings object to localStorage and re-render every store subscriber
sixty times a second, which is what made dragging stutter.

Each move now updates local state, calls `applyRainVolume` for the audible change, and schedules a
single store write 220 ms later; `onValueChangeEnd` commits immediately and cancels the pending
timer. The commit reads the value from a ref rather than the event payload — Firefox reports the
previous value in `onValueChangeEnd` after keyboard interaction, which would otherwise persist a
stale volume.

## Placement

The overlay is fullscreen. The controls sit in a `position: fixed` dock in the bottom-left corner,
above everything else on the page.

In light mode the page background is pale enough to swallow the drops, so WET also paints a vignette
and the rain is drawn in a darker slate. INTERMEDIATE leans on opacity alone, and dark mode needs
neither.

## Transitions

Nothing about the weather pops in or out.

The overlay, the vignette and the controls dock are each a Chakra `Presence` with `lazyMount` and
`unmountOnExit`, so they exist only while it rains and still animate on the way out: the overlay and
vignette cross-fade over 500 ms, the dock fades and slides 18 px over 300 ms. Because `Presence`
unmounts the canvas rather than the whole `Rain`, the canvas is tracked as state through a callback
ref instead of a `useRef` — the render loop is bound to the node that is actually on screen, and it
keeps animating throughout the fade-out.

Switching between WET and INTERMEDIATE keeps the same canvas and eases the numbers towards the new
look instead of swapping them: drop count, speed, wind, length, width and opacity are blended each
frame at `TRANSITION_RATE` per second, frame-rate independent. `settle()` jumps straight to the
target for the first frame, for a paused overlay and for `prefers-reduced-motion`.

Inside the dock, the track row collapses with `grid-template-rows: 1fr → 0fr` when INTERMEDIATE
takes over, which animates without measuring anything. It also flips to `visibility: hidden` once
the collapse finishes, so the select stays out of the tab order and out of the accessibility tree
while it is closed.

## Browser support

Canvas 2D, `requestAnimationFrame` and `devicePixelRatio` only — all supported everywhere, including
Chrome, Edge, Firefox, Safari, Opera and Brave. `ResizeObserver` is used when present and falls back
to a window `resize` listener. No `OffscreenCanvas`, `roundRect`, `ctx.filter` or WebGL, all of which
have uneven support.
