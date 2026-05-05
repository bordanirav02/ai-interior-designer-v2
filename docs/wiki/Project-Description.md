# Project Description

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2  
**Live App:** https://ai-interior-designer-v2-m4z5.vercel.app

---

## What Is AI Interior Designer v2?

AI Interior Designer v2 is a web-based application that allows users to upload a photo of any room and instantly receive a photorealistic AI-generated redesign in a chosen design style — all within 1–2 minutes, at no cost.

The application preserves the exact structure of the original room (walls, doors, windows, ceiling height, layout) using **ControlNet with Canny edge detection**, then applies a chosen design aesthetic using **Stable Diffusion 1.5**. The result is a realistic visualization of the same room in a completely different style, without altering any permanent architectural features.

Beyond style transfer, the application supports **object-level editing**: it detects individual furniture items using **YOLOv8**, generates a precise mask with **SAM (Segment Anything Model)**, and replaces only that item using **Stable Diffusion Inpainting** — leaving the rest of the room unchanged.

---

## Core Capabilities

- Upload a room photo and generate a redesign in any of **8 built-in design styles**
- Apply a **color palette** or type a **custom style description** in plain English
- Preview all 8 styles simultaneously before committing
- Compare styles side-by-side with a drag slider or 3-panel view
- Detect and replace individual furniture objects via text prompt
- Furnish an empty room by selecting room type and furniture category
- Save and revisit the last 8 generations with one-click undo

---

## 8 Design Styles

| Style | Aesthetic |
|-------|-----------|
| Minimalist | Clean lines, white space, uncluttered |
| Industrial | Raw concrete, metal, exposed brick |
| Cyberpunk | Neon lights, RGB accents, sci-fi |
| Modern Luxury | Marble, gold finishes, velvet |
| Scandinavian | Natural wood, warm neutrals, hygge |
| Mid-Century Modern | Retro 1960s, teak wood, geometric patterns |
| Japanese Zen | Wabi-sabi, bamboo, natural calm |
| Bohemian | Colorful textiles, eclectic, layered |

---

## Who Is It For?

- **Homeowners** who want to visualize a redesign before buying furniture
- **Interior design students** who need rapid concept generation for presentations
- **Real estate agents** who need virtual staging for vacant property listings

---

## Why It's Different

Most AI image tools change everything — including the room's shape. This application uses **ControlNet** to trace the room's edge geometry first, so the AI generates *within* that structure. The room layout is never altered; only the style changes.

Connection between the frontend and the AI backend is fully automatic — the Colab notebook registers its public URL to Firebase Firestore on startup, and the React app reads it in real time. Users never copy-paste backend URLs or interact with infrastructure.

---

## Tech Stack (Summary)

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, Firebase, Vercel |
| AI Pipeline | Stable Diffusion 1.5, ControlNet, YOLOv8x, SAM ViT-H |
| Backend | Flask (Python), ngrok |
| GPU | Google Colab T4 (free tier) |

→ See [[Languages and Tools]] for the full stack with version details and icons.  
→ See [[Architecture Diagram]] for system design.
