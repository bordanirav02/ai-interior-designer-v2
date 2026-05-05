# Project Design

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2

---

## Overview

AI Interior Designer v2 is built as a three-tier web application. Each tier is independently deployable and communicates over standard HTTP REST APIs.

```
┌──────────────────────────────────────────────────────────────────┐
│  TIER 1 — PRESENTATION                                           │
│  React 19 Single Page Application                                │
│  Deployed on Vercel CDN (global edge network)                    │
│  Firebase SDK for Auth + real-time Colab URL sync               │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP / Axios
┌────────────────────────▼─────────────────────────────────────────┐
│  TIER 2 — APPLICATION / API                                      │
│  Flask 3.1 REST API (Python)                                     │
│  Handles routing, image I/O, request forwarding                  │
│  Runs locally or on Render.com                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP (via ngrok tunnel)
┌────────────────────────▼─────────────────────────────────────────┐
│  TIER 3 — AI / DATA                                              │
│  Google Colab T4 GPU                                             │
│  Stable Diffusion 1.5 + ControlNet Canny (style transfer)        │
│  SD Inpainting + YOLOv8x + SAM ViT-H (object editing)           │
│  Models cached on Google Drive                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Design

**Framework:** React 19 (Create React App)  
**State Management:** Component-level useState / useEffect  
**Routing:** Single-page flow managed via App.js state machine (upload → style → result → edit)  
**Animations:** Framer Motion for page transitions, card hovers, and progress indicators  
**Notifications:** Custom Toast system (ToastProvider context + useToast hook)

**Design System:**
- Background: `#0a0a0f` (deep dark)
- Accent: `#c9a84c` (brushed gold)
- Headings: Cormorant Garamond (editorial serif)
- Body: DM Sans (clean sans-serif)

**Component Structure:**

| Component | Responsibility |
|-----------|---------------|
| `App.js` | State hub, step routing, Firebase auto-connect |
| `Auth.js` | Email + Google OAuth login/register |
| `Upload.js` | Drag-and-drop room image upload |
| `StyleSelector.js` | 8 style cards, palette picker, custom prompt |
| `ResultView.js` | Before/after slider, download, undo history |
| `ObjectEditor.js` | YOLO chip list + inpainting prompt |
| `StyleComparison.js` | 3-panel side-by-side viewer |
| `FurnishRoom.js` | Room type + furniture category generation |
| `ColorPaletteSelector.js` | 8 palette presets + custom color picker |
| `BackendSetup.js` | Manual backend URL connection popup |
| `Toast.js` | Toast notification system |

---

## Backend Design

**Framework:** Flask 3.1 | **Language:** Python 3.10+  
**Image Processing:** Pillow (resize to 512×512, format conversion)  
**CORS:** Flask-CORS (allows Vercel frontend origin)  
**Request Forwarding:** Flask proxies API calls to the active Colab URL

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Model load status check |
| `POST` | `/upload` | Upload room image (stored as `room_original.jpg`) |
| `POST` | `/generate` | Style transfer via ControlNet + SD |
| `POST` | `/detect-objects` | YOLOv8 object detection |
| `POST` | `/edit-object` | SAM mask + SD inpainting |
| `POST` | `/preview-styles` | All 8 styles simultaneously |
| `POST` | `/furnish-room` | Add furniture to empty room |
| `POST` | `/set-colab-url` | Register active Colab ngrok URL |

---

## AI Pipeline Design

**Style Transfer Flow:**
1. Flask receives image → saves as `uploads/room_original.jpg` (512×512)
2. Canny edge detector traces room geometry
3. ControlNet conditions SD on the edge map
4. Stable Diffusion 1.5 generates styled image within those edges
5. Output saved as `outputs/room_styled.jpg`

**Object Editing Flow:**
1. YOLOv8x detects furniture in the styled image (confidence ≥ 15%)
2. User selects an object (e.g., "sofa")
3. SAM ViT-H generates a precise pixel mask for that object
4. SD Inpainting fills only the masked region with the user's text prompt
5. Output saved as `outputs/room_edited.jpg`

**Auto-Connect Design:**
- When Colab starts, the last notebook cell registers its ngrok URL in **Firebase Firestore**
- The React frontend reads this URL on load via Firebase SDK
- No manual URL entry needed — connection is automatic within ~30 seconds

---

## Database / Storage Design

| Service | Purpose | Data Stored |
|---------|---------|-------------|
| Firebase Authentication | User identity | Email, UID, display name |
| Firebase Firestore | Config sync | Active Colab ngrok URL |
| Firebase Storage | User images | Uploaded + generated room photos |
| localStorage | Generation history | Last 8 generated images (key: `interiorai_history`) |

---

## Security Design

- Firebase Auth protects all user data (Firestore rules enforce `uid == request.auth.uid`)
- Colab URL write requires a secret key (`interiorai-colab-2024`) — prevents unauthorized URL injection
- CORS restricted to known frontend origins
- No API keys stored client-side
