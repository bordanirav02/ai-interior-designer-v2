# AI Interior Designer

An AI-powered web application that transforms room photos into different interior design styles using Stable Diffusion, ControlNet, YOLOv8, and Segment Anything Model. Built as a Master's capstone project at Northeastern University.

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
- [Authentication](#authentication)
- [Design Styles](#design-styles)
- [Known Limitations](#known-limitations)
- [Research References](#research-references)
- [Author](#author)

---

## Project Overview

AI Interior Designer is a full-stack web application that uses generative AI to reimagine interior spaces. A user uploads a photograph of any room, selects a design style from eight available options, and the application generates a photorealistic transformation of that room in the chosen aesthetic. The original room structure, including walls, windows, doors, and layout, is preserved exactly while all design elements such as furniture, lighting, textures, and colors are transformed.

After the style transformation is complete, the application automatically detects individual objects within the generated image using YOLOv8. The user can then select any detected object, describe a replacement, and the application uses the Segment Anything Model and Stable Diffusion inpainting to replace only that specific object while keeping the rest of the image pixel-perfect.

---

## Key Features

- **Room style transformation** — Upload any room photo and transform it into one of eight design styles
- **Structure preservation** — ControlNet with Canny edge detection ensures walls, windows, and layout remain identical across all transformations
- **Before and after comparison** — Interactive slider to compare the original and generated images side by side
- **Automatic object detection** — YOLOv8 scans the generated image and returns a list of detected objects
- **Precision object editing** — Select any detected object and replace it with a custom description using SAM masking and inpainting
- **Firebase authentication** — Secure login and registration with email/password and Google sign-in
- **User profile management** — Users can register with a name and profile photo
- **High resolution output** — Images generated at 768x768 resolution with 40 inference steps
- **Download results** — Download the generated or edited image directly from the browser

---

## Technology Stack

### Frontend
- React.js 18
- Framer Motion for page transitions and animations
- React Compare Slider for before/after image comparison
- Axios for HTTP requests
- Firebase SDK for authentication and storage

### Backend
- Python 3.10
- Flask web framework
- Flask-CORS for cross-origin request handling
- Pillow for image processing
- Requests for HTTP communication with Colab

### AI Models
- Stable Diffusion v1.5 for image generation and inpainting
- ControlNet with Canny edge detection for structure preservation
- YOLOv8x for object detection
- Segment Anything Model (SAM ViT-H) for precise object masking

### Infrastructure
- Google Colab Pro with A100 GPU (40GB VRAM)
- ngrok for tunneling between local Flask and Colab
- Google Drive for model caching and persistence
- Firebase for user authentication and profile photo storage
- GitHub for version control

---

## System Architecture

The application is built on a three-tier architecture:

```
React Frontend (localhost:3000)
        |
        | HTTP requests
        |
Flask Backend (localhost:5000)
        |
        | HTTP requests via ngrok tunnel
        |
Colab Flask API (Google Cloud, port 7860)
        |
        | Direct function calls
        |
AI Models (SD v1.5, ControlNet, YOLOv8, SAM)
```

- The React frontend handles all user interactions and displays results
- The Flask backend acts as a middleware layer, managing image storage and routing requests
- The Colab notebook runs all AI inference on a cloud GPU
- ngrok creates a secure tunnel so Flask can communicate with Colab

---

## AI Pipeline

### Style Transfer Pipeline

1. The user uploads a room image which Flask saves and resizes to 768x768
2. Flask sends the image as a base64-encoded string to Colab via the ngrok tunnel
3. In Colab, the image is converted to a numpy array and processed through Canny edge detection
4. The edge map is passed to ControlNet which guides Stable Diffusion to generate a new image
5. Stable Diffusion generates the styled image using the style prompt and negative prompt
6. The result is encoded as base64 and returned to Flask, which saves it and sends it to the frontend

### Object Detection Pipeline

1. After style transfer, the generated image is sent to Colab
2. YOLOv8x runs inference on the image with a confidence threshold of 0.15
3. All detected object labels are deduplicated and returned as a list
4. The frontend displays these as clickable buttons

### Object Editing Pipeline

1. The user selects an object from the detected list and types a replacement description
2. Flask sends the styled image, object label, and prompt to Colab
3. YOLOv8 locates the bounding box of the target object in the image
4. SAM uses the bounding box to create a precise pixel-level mask around the object
5. Stable Diffusion inpainting fills only the masked region with the new design
6. The result is returned and displayed alongside the previous version

---

## Project Structure

```
ai-interior-designer-v2/
|
|-- backend/
|   |-- app.py                  Main Flask application
|   |-- requirements.txt        Python dependencies
|   |-- uploads/                Stores user uploaded images
|   |-- outputs/                Stores generated and edited images
|   |-- venv/                   Python virtual environment
|
|-- frontend/
|   |-- public/
|   |   |-- index.html
|   |-- src/
|   |   |-- App.js              Main application component with routing logic
|   |   |-- App.css             Application-level styles
|   |   |-- index.js            React entry point
|   |   |-- index.css           Global CSS variables and base styles
|   |   |-- firebase.js         Firebase configuration and exports
|   |   |-- components/
|   |   |   |-- Auth.js         Login and registration component
|   |   |   |-- Auth.css
|   |   |   |-- Upload.js       Drag and drop image upload component
|   |   |   |-- Upload.css
|   |   |   |-- StyleSelector.js    Style selection grid component
|   |   |   |-- StyleSelector.css
|   |   |   |-- ResultView.js   Before/after comparison slider component
|   |   |   |-- ResultView.css
|   |   |   |-- ObjectEditor.js Object selection and editing component
|   |   |   |-- ObjectEditor.css
|   |-- package.json
|
|-- README.md
|-- .gitignore
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed and available:

- Python 3.10 on your local machine
- Node.js version 16 or higher
- Git
- A Google account with access to Google Colab Pro
- A Google Drive account with at least 10GB of free space for model storage
- A free ngrok account at ngrok.com
- A Firebase project with Authentication and Storage enabled

---

## Installation and Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/bordanirav02/ai-interior-designer-v2.git
cd ai-interior-designer-v2
```

### Step 2 — Set Up the Flask Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac or Linux
pip install -r requirements.txt
```

### Step 3 — Set Up the React Frontend

```bash
cd frontend
npm install
```

### Step 4 — Configure Firebase

- Create a project at console.firebase.google.com
- Enable Email/Password and Google authentication under Authentication
- Enable Firebase Storage
- Register a web app and copy the config object
- Create a file at `frontend/src/firebase.js` with your config

### Step 5 — Set Up Google Colab

- Open Google Colab and create a new notebook
- Set the runtime to GPU, preferably A100
- Run the installation cell to install all required libraries
- Restart the runtime after installation
- Run all remaining cells in order

### Step 6 — Configure ngrok

- Create a free account at dashboard.ngrok.com
- Copy your authtoken
- Add it to the Colab ngrok cell before running

---

## Running the Application

Follow these steps every time you start the project:

### Terminal 1 — Start Flask Backend

```bash
cd backend
venv\Scripts\activate
python app.py
```

Wait for `Running on http://127.0.0.1:5000` before proceeding.

### Terminal 2 — Start React Frontend

```bash
cd frontend
npm start
```

The browser will open automatically at `http://localhost:3000`.

### Google Colab — Run All Cells in Order

- Suppress warnings and imports
- Set cache directory
- Load ControlNet
- Load Stable Diffusion pipeline
- Load Inpainting pipeline
- Load YOLOv8
- Load SAM
- Helper functions
- Style prompts dictionary
- generate_style function
- detect_objects function
- edit_object function
- generate_all_previews function
- Flask API and ngrok cell

After the last cell runs, copy the printed ngrok URL.

### Terminal 3 — Register Colab URL with Flask

```bash
Invoke-WebRequest -Uri "http://localhost:5000/set-colab-url" -Method POST -ContentType "application/json" -Body '{"url": "YOUR_NGROK_URL"}'
```

### Verify Connection

```bash
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET
```

The response should show `colab_connected: true`.

### Open the Application

Go to `http://localhost:3000` in your browser.

---

## API Reference

| Endpoint | Method | Description | Request Body |
|---|---|---|---|
| /health | GET | Check Flask and Colab connection status | None |
| /set-colab-url | POST | Register the active ngrok URL | `{"url": "ngrok-url"}` |
| /upload | POST | Upload a room image | Form data with image file |
| /generate | POST | Run style transfer | `{"style": "style-name"}` |
| /detect-objects | POST | Detect objects in generated image | None |
| /edit-object | POST | Replace a specific object | `{"object": "chair", "prompt": "description"}` |
| /preview-styles | POST | Generate previews of all 8 styles | None |

---

## Authentication

The application uses Firebase Authentication with two sign-in methods:

- **Email and password** — Users register with a full name, email, password, and optional profile photo
- **Google sign-in** — Users can authenticate with their Google account in one click

Profile photos uploaded during registration are stored in Firebase Storage. User sessions persist across browser refreshes. Clicking Sign Out clears the session and returns the user to the login page.

---

## Design Styles

| Style | Description |
|---|---|
| Minimalist | Clean lines, white walls, natural light, minimal furniture |
| Industrial | Exposed brick, metal fixtures, concrete surfaces, Edison bulbs |
| Cyberpunk | Dark walls, neon lighting, gaming setup, city view at night |
| Modern Luxury | Marble accents, gold fixtures, velvet furniture, chandeliers |
| Scandinavian | Light wood, neutral tones, hygge atmosphere, natural materials |
| Mid-Century Modern | 1960s retro aesthetic, teak furniture, geometric patterns |
| Japanese Zen | Tatami mats, shoji screens, bamboo, wabi-sabi philosophy |
| Bohemian | Colorful textiles, eclectic furniture, plants, macrame |

---

## Known Limitations

- Generation takes 35 to 45 seconds per image due to 768x768 resolution and 40 inference steps
- The ngrok URL changes every Colab session and must be re-registered each time
- YOLOv8 was trained on real photographs, so detection accuracy on AI-generated images can sometimes be lower
- Google Colab Pro sessions can disconnect after periods of inactivity, requiring a full restart
- Firebase Storage CORS must be configured correctly for profile photo uploads to work from localhost
- The application currently runs locally and requires all three services to be active simultaneously

---

## Research References

- Rombach, R., Blattmann, A., Lorenz, D., Esser, P., and Ommer, B. (2022). High-Resolution Image Synthesis with Latent Diffusion Models. IEEE/CVF Conference on Computer Vision and Pattern Recognition.
- Zhang, L., and Agrawala, M. (2023). Adding Conditional Control to Text-to-Image Diffusion Models. arXiv preprint arXiv:2302.05543.
- Ho, J., Jain, A., and Abbeel, P. (2020). Denoising Diffusion Probabilistic Models. Advances in Neural Information Processing Systems, 33.
- Kirillov, A., Mintun, E., Ravi, N., Mao, H., Rolland, C., Gustafson, L., Xiao, T., Whitehead, S., Berg, A. C., Lo, W. Y., Dollar, P., and Girshick, R. (2023). Segment Anything. arXiv preprint arXiv:2304.02643.
- Jocher, G., Chaurasia, A., and Qiu, J. (2023). Ultralytics YOLOv8. https://github.com/ultralytics/ultralytics.

---

## Author

Nirav Borda
Master of Science in Computer Science
Pace University
Capstone Project, Spring 2026

GitHub: https://github.com/bordanirav02/ai-interior-designer-v2