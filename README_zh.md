[en](/README.md) [简体中文](/README_zh.md)


# Finger Frame RealTime Live AI 实时直播AI风格转绘

**立刻体验: https://jinwyp.github.io/finger-frame-effect/**

面对摄像头举起双手，用手指框住一个方框. 即可看到**实时AI世界在框内**，由30fps生成，使用
[Decart Lucy 2.5](https://docs.platform.decart.ai/models/realtime/lucy-2.5)
(realtime video-to-video over WebRTC)。会跟随你：眨眼它也眨眼，挥手它也挥手.模型延迟仅为几十毫秒。


![Example: live AI world inside the finger frame](examples/lucy.gif)

*实时捕捉手指框内的图像, 并用AI风格转绘. 会实时跟随摄像头移动（[高清mp4](examples/lucy.mp4)）。*

## 工作原理

- 通过摄像头获取的视频流（1280×720@30）会镜像到全屏画布上，通过手势框架 MediaPipe Hand Landmarker 使用的管线跟踪手指框四边形（解剖学角点排序、手势滞后、瞬移拒绝、速度自适应平滑、丢帧保持）。
- 同一摄像头流通过 WebRTC 发送到 Lucy 2.5；变换后的流实时返回，并在四边形内屏幕对齐绘制AI生成的风格转绘视频。
- 效果（按键 1–9）是**实时风格提示**：切换会将新提示发送到正在运行的会话中，无需重新连接。自定义 ✨ 使用你在 🔑 面板中的提示。

## 自备密钥

在 [platform.decart.ai](https://platform.decart.ai/) 获取密钥，并粘贴到 🔑 面板中。首次使用的免费用户将获得 1000 积分。密钥保存在浏览器中，仅用于与 Decart 的 WebRTC 会话。没有密钥时，窗口会回退到本地颜色滤镜，因此跟踪仍然可演示。

## 本地运行

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

浏览器打开 http://localhost:3001 并允许摄像头访问。

注意：在非本地 localhost 主机环境中使用摄像头时，必须启用 HTTPS。这是由于 Chrome 的安全限制。
