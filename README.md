[en](/README.md) [简体中文](/README_zh.md)

# Finger Frame RealTime Live AI 🎬⚡

**Try it: https://jinwyp.github.io/finger-frame-effect/**

Hold up both hands and frame a box with your fingers — and see a **live,
real-time AI world inside the frame**, generated at 30fps by
[Decart Lucy 2.5](https://docs.platform.decart.ai/models/realtime/lucy-2.5)
(realtime video-to-video over WebRTC). Unlike offline generation, the AI
version moves *with* you: blink and it blinks, wave and it waves — with tens
of milliseconds of model latency.

## The finger-frame family

| App | Generation | Latency |
|---|---|---|
| [finger-frame-effect](https://sophiamyang.github.io/finger-frame-effect/) ([repo](https://github.com/sophiamyang/finger-frame-effect)) — live camera, local effects | Canvas 2D (Van Gogh, toon, glitch, …) | none |
| [finger-frame-effect-ai](https://sophiamyang.github.io/finger-frame-effect-ai/) ([repo](https://github.com/sophiamyang/finger-frame-effect-ai)) — recorded video, AI restyle | Gemini Omni Flash (offline video edit) | minutes |
| **this app** — live camera, live AI | Decart Lucy 2.5 (realtime video-to-video) | ~real time |

![Example: live AI world inside the finger frame](examples/lucy.gif)

*Live capture — the AI world inside the frame moves in real time with the
camera ([full-quality mp4](examples/lucy.mp4)).*

## How it works

- The webcam feed (1280×720@30) is mirrored to a full-screen canvas, and
  MediaPipe Hand Landmarker tracks the finger-frame quad with the pipeline
  from the original app (anatomical corner ordering, gesture hysteresis,
  teleport rejection, velocity-adaptive smoothing, dropout hold).
- The same camera stream is sent to Lucy 2.5 over WebRTC; the transformed
  stream comes back live and is drawn screen-aligned inside the quad — the
  finger frame is a window into the AI world.
- Effects (keys 1–6) are **live style prompts**: switching sends the new
  prompt into the running session with no reconnect. Custom ✨ uses your own
  prompt from the 🔑 panel.

## Bring your own key

Get a key at [platform.decart.ai](https://platform.decart.ai/), paste it in
the 🔑 panel. Free user will get 1000 credits for the first time. It stays in your browser and is used only for the WebRTC
session with Decart. Without a key, the window falls back to a local color
filter so the tracking is still demoable.

## Run locally

```bash
python3 -m http.server 3001
```
OR
```bash
npx serve -l 3001
```
OR
```bash
npx http-server -p 3001
```


Open http://localhost:3001 and allow camera access. 

Note: To use the camera in a non-localhost environment, HTTPS must be enabled. This is due to Chrome's security restrictions.
