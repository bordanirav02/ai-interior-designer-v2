# Final Application Artifacts

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2  
**Live App:** https://ai-interior-designer-v2-m4z5.vercel.app

---

## Final MVP Demo

**Live Application:** https://ai-interior-designer-v2-m4z5.vercel.app

The live application demonstrates the complete AI interior design pipeline:

1. **User Authentication** — Email/password or Google OAuth login
2. **Room Upload** — Drag-and-drop or click-to-upload JPEG/PNG
3. **Style Selection** — Choose from 8 design styles + color palette + optional custom prompt
4. **AI Generation** — ControlNet + Stable Diffusion generates a styled room (1–2 min)
5. **Result View** — Before/after compare slider with zoom, download, undo
6. **Object Editing** — YOLOv8 detects furniture → replace individual objects via inpainting
7. **Style Comparison** — Compare up to 3 styles side by side
8. **Preview All Styles** — Generate all 8 styles simultaneously (~8 min)

### MVP Feature Checklist

| Feature | Status |
|---------|--------|
| User authentication (Email + Google) | ✅ Complete |
| Room image upload (drag-and-drop) | ✅ Complete |
| 8 design style generation | ✅ Complete |
| ControlNet structure preservation | ✅ Complete |
| Before/after compare slider | ✅ Complete |
| Color palette guidance | ✅ Complete |
| Custom text prompt | ✅ Complete |
| Preview all 8 styles at once | ✅ Complete |
| 3-panel style comparison | ✅ Complete |
| Object detection (YOLOv8) | ✅ Complete |
| Object replacement (SAM + Inpainting) | ✅ Complete |
| Furnish empty room | ✅ Complete |
| Image download with watermark | ✅ Complete |
| Generation history (last 8) | ✅ Complete |
| Mobile responsive layout | ✅ Complete |
| Firebase auto-connect (no manual URL) | ✅ Complete |

---

## Application Manuals

### Installation Manual

Full step-by-step guide covering all three components (frontend, backend, AI pipeline) for Windows, macOS, and Linux.

**→ See [[Deployment & Installation Manual]]**

---

### API Documentation

#### Base URL
- **Local:** `http://localhost:5000`
- **Production Colab:** `https://<ngrok-id>.ngrok-free.app`

#### Endpoints

**`GET /health`** — Check server and model status

**`POST /upload`** — Upload room image (saves as 512×512 JPEG)

**`POST /generate`** — Style transfer via ControlNet + Stable Diffusion  
Body: `{ "style": "minimalist", "palette": "warm-neutrals", "customPrompt": "..." }`

**`POST /detect-objects`** — YOLOv8 furniture detection on styled image

**`POST /edit-object`** — SAM mask + SD inpainting for object replacement  
Body: `{ "object_label": "sofa", "replacement_prompt": "...", "bbox": [...] }`

**`POST /preview-styles`** — Generate all 8 styles simultaneously

**`POST /furnish-room`** — Add furniture to empty room  
Body: `{ "room_type": "living_room", "furniture_category": "modern", "style": "scandinavian" }`

Full request/response schemas are documented in [[Final Application Artifacts#api-documentation]].

---

## Technical Paper

### Abstract

AI Interior Designer v2 is a full-stack web application enabling non-designers to transform room photos into professionally styled spaces using state-of-the-art AI. The system uses **ControlNet with Canny Edge Detection** conditioned on **Stable Diffusion 1.5** to generate photorealistic redesigns while preserving the original room geometry. Object-level editing combines **YOLOv8x** for detection, **SAM ViT-H** for segmentation, and **SD Inpainting** for seamless replacement.

### Problem Statement

Interior design visualization requires either expensive consultants ($150–$300/hour) or complex software with steep learning curves. Homeowners and students lack accessible tools to explore room redesigns before committing to purchases or renovations.

### Solution

A three-tier web app where heavy AI computation runs on free Google Colab GPUs, the frontend lives on Vercel's global CDN, and Firebase Firestore provides real-time configuration sync — eliminating any infrastructure management for users.

### Key Technical Contributions

1. **Structure-Preserving Style Transfer** — ControlNet Canny ensures walls, windows, and room layout are never altered across all 8 style generations.

2. **Zero-Config Auto-Connect** — Colab self-registers its ngrok URL to Firebase Firestore on startup; React reads it via `onSnapshot`. No manual URL entry ever needed.

3. **Cascading AI Pipeline** — Style transfer, detection, segmentation, and inpainting are independent but chainable stages, allowing partial regeneration without re-running the full pipeline.

4. **Free-Tier Architecture** — Entire system runs at $0: Vercel free hosting, Firebase Spark plan, Google Colab free T4 GPU, ngrok free tunnel.

### Results

| Metric | Value |
|--------|-------|
| Style transfer time | 87–120 seconds (T4 GPU) |
| Average YOLO detection confidence | ~91% on residential furniture |
| All 8 style previews | ~8 minutes total |
| Cold start (first session) | 7–10 minutes |
| Warm start (Drive cache) | ~3 minutes |
| Frontend uptime | 100% (Vercel CDN) |

### Future Work

- Persistent GPU backend (Replicate API or RunPod) for 24/7 availability
- SDXL 1.0 support for 1024×1024 output
- Real-time collaborative design sessions
- Room type auto-detection via scene classification
