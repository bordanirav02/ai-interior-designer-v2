# AI Interior Designer v2

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4  
**Live App:** https://ai-interior-designer-v2-m4z5.vercel.app  
**Repository:** https://github.com/Ai-interiar748/Ai_interior_Project

---

## Project Description

AI Interior Designer v2 is a web-based application that transforms any room photo into a professionally redesigned space using AI — in under 2 minutes. Users upload a photo of their room, choose from 8 design styles, and the AI generates a photorealistic redesign while preserving the exact room structure (walls, doors, windows, layout).

The application uses **ControlNet + Canny Edge Detection** to trace the geometry of the original room before applying Stable Diffusion 1.5, ensuring the layout is never altered — only the aesthetic changes. For object-level editing, **YOLOv8** detects furniture, **SAM (Segment Anything Model)** creates precise masks, and **Stable Diffusion Inpainting** replaces individual items.

The AI pipeline runs on a free **Google Colab T4 GPU** and connects to the frontend automatically via **Firebase Firestore** — no manual URL configuration needed.

---

## Wiki Navigation

| Section | Page |
|---------|------|
| 👥 Team | [[Team Members & Responsibilities]] |
| 🤝 Working Agreement | [[Team Working Agreement]] |
| 🎨 Project Design | [[Project Design]] |
| 🛠️ Languages & Tools | [[Languages and Tools]] |
| 🏗️ Architecture | [[Architecture Diagram]] |
| 📦 Final Deliverables | [[Final Application Artifacts]] |
| 📋 CS691 Presentations | [[CS691 Spring 2023 Deliverables]] |
| 🧑‍💼 Personas | [[Product Personas]] |
| 📖 User Stories | [[User Stories – Full Product Backlog]] |
| ✅ Acceptance Criteria | [[Acceptance Criteria]] |
| 🧪 Test Cases | [[Application Test Cases]] |
| 📉 Sprint 1 Burndown | [[Sprint 1 Completed Tasks]] |
| 📉 Sprint 2 Burndown | [[Sprint 2 Burndown Chart and Completed Tasks]] |
| 📉 Sprint 3 Burndown | [[Sprint 3 Burndown Chart and Completed Tasks]] |
| 📉 Sprint 4 Burndown | [[Sprint 4 Burndown Chart and Completed Tasks]] |
| 🚀 Deployment Manual | [[Deployment & Installation Manual]] |

---

## Key Features

| Feature | Description |
|---------|-------------|
| 8 Design Styles | Minimalist, Industrial, Cyberpunk, Modern Luxury, Scandinavian, Mid-Century, Japanese Zen, Bohemian |
| Style Preview | Generate all 8 styles simultaneously before committing |
| Color Palette | 8 presets + custom color picker to influence the mood |
| Custom Prompt | Describe your own style in plain English |
| Object Editing | Detect furniture with YOLOv8 → replace with text prompt via inpainting |
| Furnish Room | Add furniture to an empty room by category |
| Compare Slider | Side-by-side before/after drag comparison |
| Style Comparison | 3-panel side-by-side style viewer |
| History | Last 8 generations saved locally |
| Authentication | Email/password + Google OAuth via Firebase |

---

## System Architecture (Overview)

```
User's Browser (React 19 / Vercel)
        │
        │ REST API — ngrok URL auto-registered via Firebase
        ▼
Google Colab T4 GPU
  ├── Flask server (exposed via ngrok)
  ├── Stable Diffusion 1.5 + ControlNet Canny   → style transfer
  ├── Stable Diffusion Inpainting                → object replacement
  ├── YOLOv8x                                   → furniture detection
  └── SAM ViT-H                                 → segmentation masks
```

See [[Architecture Diagram]] for the full detailed diagram.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Framer Motion, Firebase |
| Auth & Config | Firebase Authentication, Firestore |
| AI Models | Stable Diffusion 1.5, ControlNet Canny, SD Inpainting |
| Object Detection | YOLOv8x |
| Segmentation | SAM ViT-H |
| GPU Runtime | Google Colab (T4 GPU, free tier) |
| Backend | Flask (Python), Pillow |
| Hosting | Vercel |

See [[Languages and Tools]] for full stack with icons.

---

## Sprint Status

| Sprint | Status | Story Points | Completion |
|--------|--------|-------------|------------|
| Sprint 0 | ✅ Complete | 11 / 11 | 100% |
| Sprint 1 | ✅ Complete | 13 / 13 | 100% |
| Sprint 2 | ✅ Complete | 15 / 15 | 100% |
| Sprint 3 | ✅ Complete | 16 / 16 | 100% |
| Sprint 4 | ✅ Complete | 18 / 18 | 100% |
