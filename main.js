import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const DECART_SDK_URL = "https://esm.sh/@decartai/sdk@0.1.17";

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const INDEX_MCP = 5;

const video = document.getElementById("video");
const lucyVid = document.getElementById("lucy");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const statusText = document.getElementById("status-text");
const hintEl = document.getElementById("hint");
const toolbar = document.getElementById("toolbar");
const livePill = document.getElementById("live-pill");
const liveText = document.getElementById("live-text");

// ---- Effects: live style prompts for Lucy 2.5 ----
// Follow Decart's template ("Change the style of the video to <description>."
// with concrete visual specifics — vague phrasing degrades output).
const EFFECTS = [
  {
    id: "movie3d",
    label: "3D Movie",
    prompt:
      `Change the style of the video to a 3D animated movie: stylized CGI
      animation, the person as an animated character with expressive big eyes,
      smooth skin, and soft cinematic lighting.`,
  },
  {
    id: "anime",
    label: "Anime",
    prompt:
      `Change the style of the video to hand-drawn anime: clean black line art,
      flat cel shading, vibrant colors, large expressive eyes, and energetic but
      clean composition.`,
  },
  {
    id: "comic",
    label: "Comic",
    prompt:
      `Change the style of the video to a comic book page: bold black ink outlines,
      flat cel colors, dynamic action lines, halftone textures, and cinematic motion
      effects.`,
  },
  {
    id: "ghibli",
    label: "Ghibli",
    prompt:
      `Change the style of the video to Studio Ghibli animation: soft watercolor
      backgrounds, gentle pastel colors, whimsical hand-drawn characters, small
      expressive eyes, flowing hair, and warm nostalgic light.`,
  },
  {
    id: "watercolor",
    label: "Watercolor",
    prompt:
      `Change the style of the video to a watercolor painting: loose brushstrokes,
      gentle color bleeds, visible paper texture, muted pastel palette, and airy
      negative space.`,
  },
  {
    id: "retro-watercolor",
    label: "Retro Watercolor",
    prompt:
      `Change the style of the video to a 1950s retro concept watercolor illustration:
      clean high-key paper background, warm cream tones, airy composition, soft dry
      brush strokes, simplified character shapes, and painterly pastel colors with
      gentle form shadows.`,
  },
  {
    id: "ink-wash",
    label: "Ink Wash",
    prompt:
      `Change the style of the video to traditional ink wash painting: black ink with
      five-valued tonal depth, dry brush, feathered edges, natural ink bleed, lots of
      negative space, subtle warm seal accent, and a calm hand-painted feel.`,
  },
  {
    id: "sketch",
    label: "Pencil Sketch",
    prompt:
      `Change the style of the video to a pencil sketch: hand-drawn graphite line art,
      soft shading, cross-hatching, light paper texture, and a loose but readable
      illustration style.`,
  },
  {
    id: "ballpoint-scribble",
    label: "Ballpoint Scribble",
    prompt:
      `Change the style of the video to a single-color ballpoint pen scribble: quick
      loose black line work, energetic crosshatching, random looping strokes, white
      paper background, and an improvised art-sketch personality.`,
  },
  {
    id: "marker-infographic",
    label: "Marker Doodle",
    prompt:
      `Change the style of the video to a black marker doodle infographic: clean
      hand-drawn panels, black outline characters, white interiors, minimal monochrome
      composition, scattered arrows, and one orange accent key detail in each panel.`,
  },
  {
    id: "family-crayon",
    label: "Crayon Family",
    prompt:
      `Change the style of the video to a family crayon postcard on bright white paper:
      ordinary adult black line art, messy childlike wax crayon scribble, large white
      gaps, wobbly outlines, uneven facial features, colorful family scene, and a
      handmade warm amateur poster feeling without polished illustration.`,
  },
  {
    id: "kid-crayon",
    label: "Kid Crayon",
    prompt:
      `Change the style of the video to a 5-year-old's bad drawing with crayons on white
      paper: wobbly outlines, clumsy proportions, mismatched facial features, bright
      primary colors, large white gaps, scribble strokes in random directions, and a
      genuinely crude childlike composition.`,
  },
  {
    id: "crayon-photo",
    label: "Crayon Photo",
    prompt:
      `Change the style of the video to a real photo of a child drawing with wax crayons
      on slightly wrinkled white printer paper: real paper texture, bright daylight,
      visible crayon strokes, sparse uneven fills, white paper showing through, bright
      primary colors, and a genuine hand-drawn amateur page feel.`,
  },
  {
    id: "ms-paint",
    label: "MS Paint Bad",
    prompt:
      `Change the style of the video to an intentionally bad MS Paint doodle: crooked
      wobbly lines, mismatched proportions, rough jagged color blocks, low-quality
      digital painterly ugliness, pure white background, and a deliberately awkward
      amateur look.`,
  },
  {
    id: "xkcd",
    label: "XKCD Explainer",
    prompt:
      `Change the style of the video to an xkcd-style black-and-white stick-figure
      explanation comic: simple line drawings, minimal figures, clean hand-drawn
      black pen outlines, white paper, grid panel layout, and a humorous educational
      comic-book structure.`,
  },
  {
    id: "pixel",
    label: "Pixel Art",
    prompt:
      `Change the style of the video to retro pixel art: low-resolution 8-bit or 16-bit
      game graphics, hard square pixels, limited palette, visible dithering, sharp
      edges, and a genuine old-school sprite aesthetic.`,
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    prompt:
      `Change the style of the video to neon cyberpunk: glowing pink and cyan lights,
      wet reflective surfaces, sleek futuristic outfit details, holographic signage,
      and a moody night-city atmosphere.`,
  },
  {
    id: "film",
    label: "Cinematic",
    prompt:
      `Change the style of the video to a blockbuster film: cinematic color grading,
      soft focus depth, subtle film grain, anamorphic lens flares, and polished
      Hollywood lighting.`,
  },
  {
    id: "vaporwave",
    label: "Vaporwave",
    prompt:
      `Change the style of the video to vaporwave: retro 80s color palette, neon pink
      and cyan gradients, chrome surfaces, palm silhouettes, soft scanlines, and a
      dreamy nostalgic synthwave mood.`,
  },
  {
    id: "clay",
    label: "Claymation",
    prompt:
      `Change the style of the video to claymation: plasticine figures with visible
      fingerprints, glossy handmade surfaces, stop-motion charm, and a tactile
      handcrafted studio feel.`,
  },
  {
    id: "noir",
    label: "Film Noir",
    prompt:
      `Change the style of the video to classic film noir: stark black-and-white contrast,
      deep shadows, venetian light streaks, foggy alley atmosphere, and moody detective
      drama.`,
  },
  {
    id: "oil",
    label: "Oil Painting",
    prompt:
      `Change the style of the video to an oil painting: thick textured impasto
      brushstrokes, rich glowing colors, visible canvas weave, and a gallery-lit
      classical finish.`,
  },
  {
    id: "lowpoly",
    label: "Low Poly",
    prompt:
      `Change the style of the video to low poly 3D art: geometric triangular facets,
      clean minimal surfaces, soft studio light, and a polished videogame aesthetic.`,
  },
  {
    id: "neon",
    label: "Neon Sign",
    prompt:
      `Change the style of the video to glowing neon sign art: bright luminous tube
      outlines, electric colors, dramatic dark background, and a vivid nightlife poster
      mood.`,
  },
  {
    id: "stainedglass",
    label: "Stained Glass",
    prompt:
      `Change the style of the video to stained glass: colorful glass panels, dark lead
      lines, glowing light passing through each piece, and a cathedral window feeling.`,
  },
  {
    id: "soft-vinyl",
    label: "Soft Vinyl",
    prompt:
      `Change the style of the video to a soft vinyl designer toy render: smooth matte
      soft-vinyl surfaces, playful exaggerated proportions, oversized nose, tiny sleepy
      eyes, streetwear outfit, and a warm pastel studio background.`,
  },
  {
    id: "nordic-paper",
    label: "Paper Folk",
    prompt:
      `Change the style of the video to a Nordic paper-craft folk artwork: layered sculpted
      paper forms, warm earthy palette, soft shadowing, rounded three-dimensional shapes,
      simple folk motifs, and a handcrafted editorial illustration mood.`,
  },
  {
    id: "nordic-storybook",
    label: "Nordic Storybook",
    prompt:
      `Change the style of the video to a modern Scandinavian picture-book illustration:
      soft gouache texture, paper grain throughout, cozy limited palette of cream, blue,
      mustard, and coral, long slim character proportions, and tender storybook charm.`,
  },
  {
    id: "gouache-spotlight",
    label: "Gouache Spotlight",
    prompt:
      `Change the style of the video to a modern animated-feature gouache concept art:
      full-color matte background, soft spotlight glow behind the character, visible
      dry-brush marks, oversized expressive eyes, simplified shapes, and premium
      painted storybook styling.`,
  },
  {
    id: "inked-storybook",
    label: "Inked Storybook",
    prompt:
      `Change the style of the video to an expressive inked storybook character: bold loose
      ink linework, clean bright digital painting underneath, soft watercolor wash
      background, large expressive eyes, and a warm hand-drawn paperback illustration
      feel.`,
  },
  {
    id: "warm-flat-storybook",
    label: "Warm Flat Storybook",
    prompt:
      `Change the style of the video to a warm flat picture-book illustration: large rounded
      geometric figures, smooth matte local colors, deep navy accents, coral and golden
      orange pops, generous white space, and a cozy modern children’s book aesthetic.`,
  },
  {
    id: "pastel-sketch",
    label: "Pastel Story Sketch",
    prompt:
      `Change the style of the video to a pastel emotional story sketch: blue ink line
      drawings, large white negative space, one vivid orange object as the focal accent,
      slightly asymmetrical faces, gentle narrative mood, and a delicate hand-painted
      illustration atmosphere.`,
  },
  {
    id: "lego",
    label: "LEGO",
    prompt:
      `Change the style of the video to a LEGO stop-motion animation: the person is a
      yellow LEGO minifigure with a cylindrical head, painted face, and claw hands,
      while the room is built in glossy plastic LEGO bricks with visible studs on
      every surface.`,
  },
  { id: "custom", label: "Custom ✨", prompt: null },
];
let effect = "movie3d";

let apiKey = localStorage.getItem("decart-key") || sessionStorage.getItem("decart-key") || "dct_test_XYPhckXKrnKJdClcgAskcFwAVWOFwsCOVvmBqkJyaYGPgFLNUkYebrVhbYgzQyGR";
let customPrompt = localStorage.getItem("lucy-custom") || "";
let realtimeClient = null;
let lucyLive = false;
let cameraStream = null;
let lucyModel = null; // realtime model definition (lucy-restyle-2)

// ---- Lucy lifecycle tuning ----
// The WebRTC session streams 1280x720@30fps continuously and burns tokens
// even when the AI window isn't on screen, so connect lazily (only once the
// user frames the shot) and auto-disconnect after it hides for a while.
const IDLE_DISCONNECT_MS = 5_000;
const RECONNECT_COOLDOWN_MS = 5_000;
let lastFrameShownAt = 0;
let lastConnectAttemptAt = 0;

// ---- Corners tracking state ----
// corners: smoothed quad corners; presence: confidence fade (0..1).
// frameActive: a frame is being shown — relaxes the gesture gate (hysteresis).
// lostFrames/jumpFrames feed the dropout + teleport filters below.
let corners = null;
let presence = 0;
let frameActive = false;
let lostFrames = 0;
const MAX_LOST_FRAMES = 25; // crossing/overlapping hands occlude each other
let jumpFrames = 0;
const JUMP_CONFIRM_FRAMES = 2; // a far jumped quad must persist this many frames

// ---- Vision (mediapipe) state ----
let landmarker = null;
let lastVideoTime = -1;
let lastResults = null;

// ============================================================
// 组2 · MediaPipe 手势检测 (vision*)
// ============================================================
async function visionInit() {
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
  });
}

// Detect hands only on a new video frame (idempotent within a frame).
function visionDetect() {
  if (video.currentTime === lastVideoTime) return lastResults;
  lastVideoTime = video.currentTime;
  lastResults = landmarker.detectForVideo(video, performance.now());
  return lastResults;
}

// ============================================================
// 几何工具 (geom*) — shared by quad & corners
// ============================================================

// Normalized landmark → canvas pixel, mirroring x to match the canvas.
function geomPixel(lm) {
  return { x: (1 - lm.x) * canvas.width, y: lm.y * canvas.height };
}

function geomDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function geomLerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// ============================================================
// 组3 · targetQuad 取景框算法 (quad*)
// ============================================================

// From two hands, return the frame corners in ANATOMICAL order
// [left.index, right.index, right.thumb, left.thumb]. Each corner is a real
// finger, so the edge cycle is honest geometry: two upright "L"s trace a
// rectangle; flipping one hand makes the edges cross into a bowtie — and
// uncrossing recovers by itself since nothing here is stateful.
function quadCompute(hands) {
  const info = hands.map((lm) => ({
    index: geomPixel(lm[INDEX_TIP]),
    thumb: geomPixel(lm[THUMB_TIP]),
    wristX: geomPixel(lm[WRIST]).x,
    // Hand size from wrist → middle knuckle is stable regardless of finger
    // orientation (finger-based measures foreshorten).
    scale: geomDist(geomPixel(lm[WRIST]), geomPixel(lm[MIDDLE_MCP])) + 1,
  }));

  // Thumb & index must spread apart (an open "L"). Hysteresis: easier to
  // keep once active, so rotating/foreshortening fingers don't drop it.
  const needed = frameActive ? 0.2 : 0.75;
  for (const hd of info) if (geomDist(hd.thumb, hd.index) < hd.scale * needed) return null;

  info.sort((a, b) => a.wristX - b.wristX);
  const [A, B] = info;
  const pts = [A.index, B.index, B.thumb, A.thumb];

  // Degenerate-frame gate: the traced area is ~0 for a legitimately crossed
  // (bowtie) frame, so require a minimum span before accepting.
  const cx = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
  const cy = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;
  const hull = [...pts].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  );
  const minArea = frameActive ? 0.0005 : 0.005;
  if (quadArea(hull) < canvas.width * canvas.height * minArea) return null;
  return pts;
}

function quadArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a / 2);
}

// ============================================================
// 组4 · corners 跟踪算法 (corners*)
// State machine built from three cooperating strategies:
//   · Velocity-Adaptive Smoothing          — damp jitter, track motion
//   · Jump & Teleport Filtering            — reject far jumps as mis-detects
//   · Presence & Dropout Hold              — hold through dropouts, fade otherwise
// ============================================================

function cornersStep(target) {
  if (target) corners ? cornersUpdate(target) : cornersAcquire(target);
  else cornersDropout();
}

// First sighting: lock the quad instantly and start raising confidence.
function cornersAcquire(q) {
  lostFrames = 0;
  frameActive = true;
  jumpFrames = 0;
  corners = q;
  presence = Math.min(1, presence + 0.12);
}

// Ongoing quad: reject teleports, else smooth toward the new one.
function cornersUpdate(q) {
  const moved = cornersMotion(q);
  if (cornersJumpFilter(moved)) return;
  lostFrames = 0;
  frameActive = true;
  jumpFrames = 0;

  const alpha = cornersSmoothAlpha(moved);
  corners = corners.map((c, i) => geomLerp(c, q[i], alpha));
  presence = Math.min(1, presence + 0.12);
}

// Average pixel displacement between current and target corners.
function cornersMotion(q) {
  return q.reduce((s, p, i) => s + geomDist(p, corners[i]), 0) / 4;
}

// Jump & Teleport Filtering: only quads that genuinely teleport (≥30% of the
// screen in one frame, beyond real hand motion) are treated as suspect
// mis-detections; they must persist JUMP_CONFIRM_FRAMES to be accepted.
function cornersJumpFilter(moved) {
  if (moved > canvas.width * 0.3 && ++jumpFrames < JUMP_CONFIRM_FRAMES) {
    if (++lostFrames > MAX_LOST_FRAMES) presence = Math.max(0, presence - 0.05);
    return true;
  }
  return false;
}

// Velocity-Adaptive Smoothing gain: strong damping when nearly still, fast
// follow the moment the hands genuinely move.
function cornersSmoothAlpha(moved) {
  return Math.min(0.85, Math.max(0.35, moved / (canvas.width * 0.05)));
}

// Presence & Dropout Hold: brief detection dropout holds the last quad
// (hands crossing/overlapping); extended loss fades presence out and resets.
function cornersDropout() {
  if (corners && ++lostFrames <= MAX_LOST_FRAMES) {
    presence = Math.min(1, presence + 0.12);
    return;
  }
  presence = Math.max(0, presence - 0.05);
  if (presence === 0) {
    corners = null;
    frameActive = false;
    jumpFrames = 0;
  }
}

// ============================================================
// 组1 · canvas 绘画 (draw*)
// ============================================================

// Draw a (mirrored) source onto any 2d context, filling w x h.
function drawMirrored(c, w, h, src = video) {
  c.save();
  c.translate(w, 0);
  c.scale(-1, 1);
  c.drawImage(src, 0, 0, w, h);
  c.restore();
}

// Paint the AI / filtered world inside the finger frame.
function drawEffect(q) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.save();
  quadPath(ctx, q);
  ctx.clip();
  ctx.globalAlpha = presence;

  if (lucyLive && lucyVid.readyState >= 2) {
    // Live AI stream is a full-frame transform of the camera — draw it
    // mirrored so the frame is a window into the AI world, staying
    // registered as the hands move.
    drawMirrored(ctx, w, h, lucyVid);
  } else {
    // Keyless fallback: local color shift so the window still does something.
    ctx.filter = "hue-rotate(140deg) saturate(1.6) contrast(1.1)";
    drawMirrored(ctx, w, h);
    ctx.filter = "none";
    if (!apiKey) {
      const cx = (q[0].x + q[1].x + q[2].x + q[3].x) / 4;
      const cy = (q[0].y + q[1].y + q[2].y + q[3].y) / 4;
      ctx.font = `600 ${Math.round(w / 55)}px -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillText("🔑 Add your Decart key for the live AI world", cx, cy);
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// Draw a traced quad outline (used as the frame) and one path helper.
function drawFrameOutline(q) {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.globalAlpha = presence;

  quadPath(ctx, q);
  ctx.setLineDash([10, 8]);
  // Marching ants: slide the dash pattern along the outline.
  ctx.lineDashOffset = -t * 40;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.shadowBlur = 0;

  q.forEach((p, i) => {
    const r = 7 + Math.sin(t * 3 + i * 1.5) * 1.5;
    // Soft expanding halo behind each corner dot.
    const halo = (t * 0.8 + i * 0.25) % 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + halo * 14, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - halo) * presence})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  ctx.restore();
}

// Build a closed path from quad corners (shared by drawEffect/drawFrameOutline).
function quadPath(c, q) {
  c.beginPath();
  c.moveTo(q[0].x, q[0].y);
  for (let i = 1; i < 4; i++) c.lineTo(q[i].x, q[i].y);
  c.closePath();
}

// ============================================================
// Decart Lucy 2.5 — realtime video-to-video over WebRTC (lucy*)
// ============================================================
function lucySetPill(state, text) {
  livePill.className = state ? `on ${state}` : "";
  if (state) livePill.classList.add("on");
  liveText.textContent = text;
}

async function lucyConnect() {
  if (!apiKey || !cameraStream) return;
  try {
    lucySetPill("connecting", "CONNECTING…");
    const { createDecartClient, models } = await import(DECART_SDK_URL);
    const model = models.realtime("lucy-2.5");
    const client = createDecartClient({ apiKey });
    realtimeClient = await client.realtime.connect(cameraStream, {
      model,
      initialState: { prompt: { text: currentPrompt(), enhance: true } },
      onRemoteStream: (stream) => {
        lucyVid.srcObject = stream;
        lucyVid.play().catch(() => {});
        lucyLive = true;
        lucySetPill("", "LIVE");
      },
    });
    console.log("Lucy connected", realtimeClient);
  } catch (err) {
    console.error("Lucy connect failed:", err);
    lucyLive = false;
    lucySetPill("error", "AI OFFLINE — " + (err.message || "connect failed").slice(0, 60));
  }
}

async function lucyDisconnect() {
  lucyLive = false;
  lucySetPill(null, "");
  try {
    await realtimeClient?.disconnect?.();
    realtimeClient?.close?.();
  } catch {}
  realtimeClient = null;
  lucyVid.srcObject = null;
}

// Style switch needs no reconnect — just push the new prompt.
async function lucyPushPrompt() {
  if (!realtimeClient || !lucyLive) return;
  const text = currentPrompt();
  try {
    // SDK versions differ on the exact shape — try the documented forms.
    try {
      await realtimeClient.set({ prompt: text, enhance: true });
    } catch {
      await realtimeClient.set({ prompt: { text }, enhance: true });
    }
  } catch (err) {
    console.error("prompt update failed:", err);
  }
}

// Token-saving: spin up the expensive AI session only once the user frames
// the shot (and never during a reconnect cooldown).
function lucyLazyConnect() {
  if (
    !lucyLive &&
    apiKey &&
    performance.now() - lastConnectAttemptAt > RECONNECT_COOLDOWN_MS
  ) {
    lastConnectAttemptAt = performance.now();
    lucyConnect();
  }
}

// Frame hidden for a while — stop the stream instead of burning tokens.
function lucyIdleDisconnect() {
  if (lucyLive && performance.now() - lastFrameShownAt > IDLE_DISCONNECT_MS) {
    lucyDisconnect();
  }
}

// ============================================================
// UI — toolbar & API-key panel
// ============================================================
function currentPrompt() {
  const e = EFFECTS.find((x) => x.id === effect);
  if (e?.prompt) return e.prompt;
  return (
    customPrompt.trim() ||
    "Transform the person into a 3D animated movie character."
  );
}

// Shortcut key for the i-th effect: 1-9 for the first nine, then A, B, C…
function effectKey(i) {
  return i < 9 ? `${i + 1}` : String.fromCharCode(65 + (i - 9));
}

function buildToolbar() {
  EFFECTS.forEach((e, i) => {
    const btn = document.createElement("button");
    btn.textContent = e.label;
    btn.title = `Press ${effectKey(i)} for ${e.label}`;
    btn.dataset.id = e.id;
    if (e.id === effect) btn.classList.add("active");
    btn.addEventListener("click", () => setEffect(e.id));
    toolbar.appendChild(btn);
  });
  window.addEventListener("keydown", (ev) => {
    if (ev.target.matches("input, textarea")) return;
    const key = ev.key.toUpperCase();
    let idx = -1;
    if (key >= "1" && key <= "9") idx = parseInt(key, 10) - 1;
    else if (key >= "A" && key <= "Z") idx = 9 + key.charCodeAt(0) - 65;
    if (idx >= 0 && idx < EFFECTS.length) setEffect(EFFECTS[idx].id);
  });
}

function setEffect(id) {
  effect = id;
  toolbar.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.id === id);
  });
  if (id === "custom" && !customPrompt.trim()) {
    document.getElementById("key-panel").classList.remove("hidden");
  }
  lucyPushPrompt();
}

function setupKeyPanel() {
  const btn = document.getElementById("key-btn");
  const panel = document.getElementById("key-panel");
  const input = document.getElementById("key-input");
  const remember = document.getElementById("key-remember");
  const custom = document.getElementById("style-custom");

  input.value = apiKey;
  remember.checked = !!localStorage.getItem("decart-key");
  custom.value = customPrompt;

  btn.addEventListener("click", () => panel.classList.toggle("hidden"));
  document.getElementById("key-save").addEventListener("click", async () => {
    apiKey = input.value.trim();
    localStorage.removeItem("decart-key");
    sessionStorage.removeItem("decart-key");
    if (apiKey) {
      (remember.checked ? localStorage : sessionStorage).setItem("decart-key", apiKey);
    }
    customPrompt = custom.value;
    localStorage.setItem("lucy-custom", customPrompt);
    panel.classList.add("hidden");
    await lucyDisconnect();
    if (apiKey) lucyConnect();
    else lucyPushPrompt();
  });
  document.getElementById("key-clear").addEventListener("click", async () => {
    apiKey = "";
    input.value = "";
    localStorage.removeItem("decart-key");
    sessionStorage.removeItem("decart-key");
    await lucyDisconnect();
  });
}

// ============================================================
// 入口 — 初始化 与 主渲染循环 (loop)
// ============================================================
async function init() {
  buildToolbar();
  setupKeyPanel();

  statusText.textContent = "Loading hand tracker…";
  landmarker = await visionInit();

  statusText.textContent = "Requesting camera…";
  // Lucy 2.5 expects 1280x720 landscape input; 15fps halves token burn at a
  // modest smoothness cost.
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Camera API unavailable — this page needs a secure (https:// or localhost) context with camera access."
    );
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
      facingMode: "user",
    },
    audio: false,
  });
  cameraStream = stream;
  video.srcObject = stream;
  await new Promise((res) => (video.onloadedmetadata = res));
  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  statusEl.classList.add("hidden");
  // No eager connect: the live session starts lazily in the loop the first
  // time the user frames the shot, and auto-disconnects when idle.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && lucyLive) lucyDisconnect();
  });

  requestAnimationFrame(loop);
}

function loop() {
  const w = canvas.width;
  const h = canvas.height;

  // 1. Base layer: mirrored camera feed.
  drawMirrored(ctx, w, h);

  // 2. Detect hands (once per video frame) and derive the target quad.
  const det = visionDetect();
  const target = det?.landmarks?.length === 2 ? quadCompute(det.landmarks) : null;

  // 3. Update smoothed corners: acquire / smooth / filter / fade.
  cornersStep(target);

  // 4. Frame visible → paint effect + hint, lazily connect Lucy.
  if (corners && presence > 0.01) {
    drawEffect(corners);
    drawFrameOutline(corners);
    lastFrameShownAt = performance.now();
    lucyLazyConnect();
  } else {
    lucyIdleDisconnect();
  }

  hintEl.classList.toggle("hidden", presence > 0.5);

  requestAnimationFrame(loop);
}

init().catch((err) => {
  console.error(err);
  statusEl.classList.remove("hidden");
  statusEl.querySelector(".spinner")?.remove();
  statusText.textContent =
    err.name === "NotAllowedError"
      ? "Camera permission was denied. Allow camera access and reload."
      : `Failed to start: ${err.message}`;
});
