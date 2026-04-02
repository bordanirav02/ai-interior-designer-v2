# AI Interior Designer

An AI-powered web application that transforms room photos into different interior design styles, furnishes empty rooms, and allows precision editing of individual objects. Built as a Master's capstone project at Northeastern University.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [AI Pipeline](#ai-pipeline)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Design Styles](#design-styles)
- [Known Limitations](#known-limitations)
- [Research References](#research-references)
- [Author](#author)

---

## Project Overview

AI Interior Designer is a full-stack web application that uses generative AI to reimagine and furnish interior spaces. A user uploads a photograph of any room and can either transform it into one of eight design styles, furnish an empty room with selected furniture items, or edit individual objects using AI inpainting. The application preserves the original room structure while applying AI-generated design transformations.

---

## Key Features

**Style Transformation**
- Transform any room into 8 distinct design styles at 768x768 resolution
- Preview all 8 styles simultaneously before selecting
- Color palette selector with 8 preset themes and custom color picker
- Custom style prompt box for user-defined transformations
- Before and after comparison slider

**Room Furnishing**
- Upload an empty room and select furniture items to add
- Room-specific furniture categories for Living Room, Bedroom, Kitchen, Home Office and Dining Room
- SAM-based floor detection for precise furniture placement using inpainting
- Style preference selection for furniture aesthetics

**Object Editing**
- Automatic object detection using YOLOv8
- Precision object replacement using SAM masking and SD inpainting
- Multiple sequential edits that build on each other
- Undo last edit functionality
- Original image backup to prevent quality degradation

**User Experience**
- Generation history panel with one-click restore
- Zoom modal with scroll to zoom and drag to pan
- 3-panel style comparison view with download
- Download result with style name and date watermark
- Share button with copy image and copy caption
- Loading progress bar with step-by-step indicators
- Firebase authentication with email and Google sign-in

---

## Technology Stack

**Frontend**
- React.js 18
- Framer Motion for animations
- React Compare Slider for before and after comparison
- Axios for HTTP requests
- Firebase SDK

**Backend**
- Python 3.10
- Flask and Flask-CORS
- Pillow for image processing
- Requests for Colab communication

**AI Models**
- Stable Diffusion v1.5 for style transfer
- Stable Diffusion Inpainting for object editing and room furnishing
- ControlNet Canny for structure preservation
- YOLOv8x for object detection
- Segment Anything Model ViT-H for precise masking

**Infrastructure**
- Google Colab Pro with A100 GPU (40GB VRAM)
- ngrok for tunneling
- Google Drive for model caching
- Firebase Authentication and Storage
- GitHub for version control

---

## System Architecture

```
React Frontend (localhost:3000)
        |
        | HTTP requests
        |
Flask Backend (localhost:5000)
        |
        | HTTP via ngrok tunnel
        |
Colab Flask API (port 7860)
        |
        | Direct function calls
        |
AI Models (SD v1.5, ControlNet, YOLOv8, SAM)
```

---

## AI Pipeline

**Style Transfer Pipeline**
1. User uploads room image — Flask resizes to 768x768
2. Flask sends base64 image to Colab via ngrok
3. Canny edge detection extracts room structure
4. ControlNet guides Stable Diffusion using edge map
5. Style prompt and optional color palette injected into generation
6. Result saved to Drive and returned to frontend

**Room Furnishing Pipeline**
1. User selects room type and furniture items
2. SAM detects floor area using multi-point prompting
3. Floor mask created for bottom 60 percent of image
4. SD Inpainting fills masked floor area with selected furniture
5. Walls, windows, ceiling preserved pixel-perfect

**Object Editing Pipeline**
1. YOLOv8 detects all objects in generated image
2. User selects object and describes replacement
3. SAM creates precise pixel-level mask around object
4. SD Inpainting replaces only masked region
5. Result saved as new base for next edit

---

## Project Structure

```
ai-interior-designer-v2/
|
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- uploads/
|   |-- outputs/
|
|-- frontend/src/
|   |-- App.js
|   |-- App.css
|   |-- firebase.js
|   |-- components/
|   |   |-- Auth.js
|   |   |-- Upload.js
|   |   |-- StyleSelector.js
|   |   |-- ResultView.js
|   |   |-- ObjectEditor.js
|   |   |-- ColorPaletteSelector.js
|   |   |-- FurnishRoom.js
|   |   |-- StyleComparison.js
|
|-- README.md
```

---

## Prerequisites

- Python 3.10
- Node.js 16 or higher
- Google Colab Pro account
- Google Drive with 10GB free space
- ngrok account
- Firebase project with Authentication enabled

---

## Installation and Setup

**Clone the repository**
```bash
git clone https://github.com/bordanirav02/ai-interior-designer-v2.git
cd ai-interior-designer-v2
```

**Set up Flask backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Set up React frontend**
```bash
cd frontend
npm install
```

**Configure Firebase**
- Enable Email and Google authentication
- Copy config to frontend/src/firebase.js

**Set up Google Colab**
- Open Colab notebook
- Set runtime to A100 GPU
- Run all 16 cells in order

---

## Running the Application

**Terminal 1 — Flask:**
```bash
cd backend
venv\Scripts\activate
python app.py
```

**Terminal 2 — React:**
```bash
cd frontend
npm start
```

**Colab — Run all cells in order:**
1. Install packages
2. Suppress warnings and imports
3. Mount Drive and set directories
4. Load ControlNet
5. Load Stable Diffusion
6. Load Inpainting pipeline
7. Load YOLOv8
8. Load SAM
9. ngrok auth token
10. Helper functions
11. Style prompts
12. generate_style function
13. detect_objects function
14. edit_object function
15. furnish_room_inpaint function
16. generate_all_previews function
17. Flask API and ngrok cell

**Register Colab URL:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/set-colab-url" -Method POST -ContentType "application/json" -Body '{"url": "YOUR_NGROK_URL"}'
```

**Verify connection:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET
```

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| /health | GET | Check Flask and Colab status |
| /set-colab-url | POST | Register ngrok URL |
| /upload | POST | Upload room image |
| /generate | POST | Style transfer with optional palette and custom prompt |
| /detect-objects | POST | YOLOv8 object detection |
| /edit-object | POST | SAM and inpainting object replacement |
| /preview-styles | POST | Generate all 8 style thumbnails |

---

## Design Styles

| Style | Description |
|---|---|
| Minimalist | White walls, natural light, clean geometry, Scandinavian influence |
| Industrial | Exposed brick, metal fixtures, concrete, Edison bulbs |
| Cyberpunk | Dark walls, neon lighting, gaming setup, city view |
| Modern Luxury | Marble, gold fixtures, velvet furniture, chandeliers |
| Scandinavian | Light wood, hygge atmosphere, neutral tones |
| Mid-Century Modern | 1960s retro, teak furniture, geometric patterns |
| Japanese Zen | Tatami, shoji screens, bamboo, wabi-sabi |
| Bohemian | Colorful textiles, plants, macrame, eclectic furniture |

---

## Known Limitations

- Generation takes 35 to 45 seconds per image
- ngrok URL must be re-registered every Colab session
- YOLOv8 detection accuracy lower on AI-generated images
- Color palette enforcement varies by style strength
- Furnishing accuracy depends on room complexity

---

## Research References

- Rombach et al. (2022). High-Resolution Image Synthesis with Latent Diffusion Models. CVPR.
- Zhang and Agrawala (2023). Adding Conditional Control to Text-to-Image Diffusion Models. arXiv:2302.05543.
- Ho et al. (2020). Denoising Diffusion Probabilistic Models. NeurIPS 33.
- Kirillov et al. (2023). Segment Anything. arXiv:2304.02643.
- Jocher et al. (2023). Ultralytics YOLOv8. https://github.com/ultralytics/ultralytics.

---

## Author

Nirav Borda
Master of Science in Computer Science
Pace University
Capstone Project, Spring 2026

GitHub: https://github.com/bordanirav02/ai-interior-designer-v2
