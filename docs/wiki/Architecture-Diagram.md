# Architecture Diagram

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2

---

## Full System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  React 19 SPA (Vercel CDN)                   │   │
│  │                                                               │   │
│  │  Auth.js         Upload.js        StyleSelector.js            │   │
│  │  Firebase Auth   Drag & Drop      8 Styles + Palette          │   │
│  │                                   + Custom Prompt             │   │
│  │  ResultView.js   ObjectEditor.js  StyleComparison.js          │   │
│  │  Compare Slider  YOLO Chips       3-Panel Viewer              │   │
│  │  Download/Undo   Inpaint Prompt                               │   │
│  │                                                               │   │
│  │  FurnishRoom.js  Toast.js         BackendSetup.js             │   │
│  │  Room+Furniture  Notifications    Manual URL Entry            │   │
│  └───────────────────────┬───────────────────────────────────────┘  │
│                           │ Firebase SDK                            │
│                           ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Firebase (Google Cloud)                      │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐     │   │
│  │  │    Auth    │  │  Firestore  │  │     Storage      │     │   │
│  │  │  Email +   │  │  colab_url  │  │  room images     │     │   │
│  │  │  Google    │  │  user data  │  │  (upload/output) │     │   │
│  │  └────────────┘  └──────┬──────┘  └──────────────────┘     │   │
│  └──────────────────────────│──────────────────────────────────┘   │
└──────────────────────────────│───────────────────────────────────────┘
                               │  ngrok URL auto-registered on startup
┌──────────────────────────────▼───────────────────────────────────────┐
│                     Flask API (Python)                               │
│                  localhost:5000 or Render.com                        │
│                                                                      │
│  POST /upload         → save room_original.jpg (512×512)             │
│  POST /generate       → forward to Colab style transfer              │
│  POST /detect-objects → forward to Colab YOLOv8                      │
│  POST /edit-object    → forward to Colab SAM + Inpaint               │
│  POST /preview-styles → forward to Colab (all 8 styles)             │
│  POST /furnish-room   → forward to Colab furniture generation        │
│  GET  /health         → model load status                            │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTP via ngrok HTTPS tunnel
┌──────────────────────────────▼───────────────────────────────────────┐
│                  Google Colab (T4 GPU)                               │
│                                                                      │
│  Flask Server (port 7860)  +  ngrok tunnel (HTTPS public URL)       │
│                                                                      │
│  ┌──────────────────────┐    ┌──────────────────────┐               │
│  │   Style Transfer     │    │   Object Editing     │               │
│  │                      │    │                      │               │
│  │  Input Image         │    │  Styled Image        │               │
│  │       ↓              │    │       ↓              │               │
│  │  Canny Edge Detect   │    │  YOLOv8x             │               │
│  │       ↓              │    │  (detect furniture)  │               │
│  │  ControlNet          │    │       ↓              │               │
│  │  (edge conditioning) │    │  SAM ViT-H           │               │
│  │       ↓              │    │  (pixel mask)        │               │
│  │  Stable Diff 1.5     │    │       ↓              │               │
│  │  (style prompt)      │    │  SD Inpainting       │               │
│  │       ↓              │    │  (text prompt)       │               │
│  │  room_styled.jpg     │    │  room_edited.jpg     │               │
│  └──────────────────────┘    └──────────────────────┘               │
│                                                                      │
│  Models cached on Google Drive:                                      │
│  /content/drive/MyDrive/InteriorAI_Models/                           │
│  ├── stable-diffusion-v1-5/                                          │
│  ├── controlnet-canny/                                               │
│  ├── sd-inpainting/                                                  │
│  └── yolov8x.pt + sam_vit_h.pth                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Auto-Connect Flow

```
1. Colab notebook starts (Runtime → Run all)
2. All models load into GPU memory (~7 min first run)
3. Flask server starts on port 7860
4. ngrok creates HTTPS tunnel → https://xxxx.ngrok-free.app
5. Last cell writes ngrok URL to Firebase Firestore
6. React frontend reads the URL via onSnapshot listener
7. Status dot turns GREEN within ~30 seconds
8. All API calls route to the active Colab session
```

---

## Deployment Topology

```
         GitHub Repo (source truth)
               │
               │ git push → auto-deploy
    ┌──────────▼──────────┐
    │        Vercel        │   ← Always live (frontend)
    │  ai-interior.vercel  │
    └──────────┬───────────┘
               │
    ┌──────────▼──────────┐
    │      Firebase        │   ← Always live (auth + config)
    │  Auth + Firestore    │
    └──────────┬───────────┘
               │ URL sync
    ┌──────────▼──────────┐
    │    Google Colab      │   ← On-demand (start manually)
    │   T4 GPU + Flask     │
    └─────────────────────┘
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Google Colab for GPU | Zero infrastructure cost; T4 GPU sufficient for SD 1.5 |
| Firebase Firestore for URL sync | Eliminates manual URL entry; auto-connects users |
| ControlNet Canny | Preserves room structure — walls, doors, windows never change |
| Flask as proxy | Decouples frontend from volatile Colab URL |
| 512×512 images | Matches SD 1.5 native resolution; prevents CUDA OOM on free tier |
