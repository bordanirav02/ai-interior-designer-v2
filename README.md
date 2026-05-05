# AI Interior Designer v2

> Transform any room photo into a professionally designed space using AI — in under 2 minutes.

**Live App:** [ai-interior-designer-v2-m4z5.vercel.app](https://ai-interior-designer-v2-m4z5.vercel.app)

---

## What It Does

Upload a room photo. Pick a design style. The AI redesigns it while keeping your walls, windows, doors, and layout exactly intact — only the aesthetic changes.

Built using **ControlNet (Canny edge detection)** + **Stable Diffusion 1.5**, so the room structure is always preserved. Unlike simple style transfer, this approach traces your room's actual geometry before generating.

---

## Features

| Feature | Description |
|---------|-------------|
| **8 Design Styles** | Minimalist, Industrial, Cyberpunk, Modern Luxury, Scandinavian, Mid-Century, Japanese Zen, Bohemian |
| **Color Palette Guidance** | 8 presets + custom color picker to influence the mood |
| **Custom Prompt** | Describe your own style in plain English |
| **Preview All 8 Styles** | Generate all styles simultaneously for comparison (~8 min) |
| **Style Comparison** | 3-panel side-by-side viewer |
| **Object Editing** | Select a detected object (sofa, table, etc.) and replace it with a text prompt |
| **Furnish Room** | Generate furniture into an empty room by category (living room, bedroom, etc.) |
| **Before/After Slider** | Drag to compare original vs. generated |
| **Download** | Save result with watermark |
| **History** | Last 8 generations saved locally |
| **Authentication** | Email/password + Google OAuth via Firebase |

---

## How It Works

```
Your Photo
    │
    ▼
Edge Detection (Canny)        ← preserves walls, doors, windows
    │
    ▼
Stable Diffusion 1.5          ← generates styled room within edges
+ ControlNet Canny
    │
    ▼
Styled Room Image
    │
    ├─► Object Editing:
    │       YOLOv8 detects furniture
    │       SAM creates precise mask
    │       SD Inpainting replaces object
    │
    └─► Result View (compare slider, download, share)
```

The AI pipeline runs on a **Google Colab T4 GPU** (free). The Colab notebook connects automatically to the frontend via Firebase Firestore — no manual URL entry needed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Framer Motion, CSS Variables |
| Auth & DB | Firebase Authentication, Firebase Firestore |
| Storage | Firebase Storage |
| AI Models | Stable Diffusion 1.5, ControlNet Canny, SD Inpainting |
| Object Detection | YOLOv8x |
| Segmentation | SAM ViT-H (Segment Anything Model) |
| GPU Runtime | Google Colab (T4 GPU, free tier) |
| Tunnel | ngrok (Colab → internet) |
| Backend | Flask (Python), Pillow |
| Hosting | Vercel (frontend), local Flask |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User's Browser                      │
│              React 19  ·  Vercel  ·  Firebase            │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API (via ngrok URL)
                            │ URL auto-registered in Firestore
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Google Colab (GPU)                    │
│   Flask server  ·  ngrok tunnel  ·  Python AI pipeline   │
│                                                          │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  ControlNet  │  │  SD 1.5 /  │  │  YOLOv8x + SAM  │  │
│  │  Canny Edge  │  │ Inpainting │  │  Object Editor  │  │
│  └──────────────┘  └────────────┘  └─────────────────┘  │
│              Models cached on Google Drive               │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
ai-interior-designer-v2/
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.js                    # State hub, routing, Firebase auto-connect
│       ├── config.js                 # API URL resolution
│       ├── firebase.js               # Firebase project config
│       └── components/
│           ├── Auth.js               # Email + Google OAuth login
│           ├── Upload.js             # Drag-and-drop room upload
│           ├── StyleSelector.js      # Style cards, palette, custom prompt
│           ├── ResultView.js         # Compare slider, download, undo
│           ├── ObjectEditor.js       # YOLO detect + SAM inpaint
│           ├── StyleComparison.js    # 3-panel style comparison
│           ├── FurnishRoom.js        # Room type + furniture generation
│           ├── ColorPaletteSelector.js # Palette presets + color picker
│           ├── BackendSetup.js       # Manual backend URL popup
│           └── Toast.js              # Notification system
│
├── backend/
│   ├── AI_Interior_Designer_v2.ipynb # Colab notebook — run this for AI
│   ├── app.py                        # Local Flask API (for development)
│   └── requirements.txt
│
├── SETUP_GUIDE.md                    # Full deployment + usage guide
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- A Google account (for Colab)
- A Firebase project (for auth + auto-connect)

### 1. Clone the repo

```bash
git clone https://github.com/bordanirav02/ai-interior-designer-v2.git
cd ai-interior-designer-v2
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`.

### 3. Start the local Flask backend (optional)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:5000`.

### 4. Start the AI pipeline (required for generation)

1. Open the Colab notebook: [AI\_Interior\_Designer\_v2.ipynb](backend/AI_Interior_Designer_v2.ipynb)
2. Set runtime to **T4 GPU** (Runtime → Change runtime type)
3. Click **Run all** (`Ctrl+F9`)
4. Wait ~7 minutes for models to load

The notebook automatically registers its ngrok URL with Firebase — the frontend connects without any manual configuration.

For the full deployment guide including Firebase setup, Vercel env vars, and troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## API Endpoints (Colab Flask)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check model load status |
| `POST` | `/upload` | Upload room image (saves as 512×512) |
| `POST` | `/generate` | Style transfer via ControlNet + SD |
| `POST` | `/detect-objects` | YOLOv8 object detection on styled image |
| `POST` | `/edit-object` | SAM mask + inpainting for object replacement |
| `POST` | `/preview-styles` | Generate all 8 styles simultaneously |
| `POST` | `/furnish-room` | Add furniture to an empty room |

---

## Deployment

### Frontend (Vercel)

```bash
cd frontend
CI=false npm run build
# Deploy via Vercel dashboard or CLI
```

Set the environment variable in Vercel:
- `REACT_APP_API_URL` = `http://localhost:5000` (fallback; Colab URL is set dynamically via Firebase)

### AI Backend (Google Colab)

No server to deploy — the Colab notebook IS the backend. Start it when you need AI generation; keep the tab open while users are active.

- Free tier: T4 GPU, 12 hrs/session, ~90 min idle timeout
- For production: Colab Pro ($10/month) for longer sessions and A100 GPU

---

## Performance

| Operation | Time |
|-----------|------|
| Single style generation | ~1–2 min |
| Preview all 8 styles | ~8 min |
| Object detection | ~5 sec |
| Object replacement (inpainting) | ~30 sec |
| Model cold start (first session) | ~7–10 min |
| Model warm start (Drive cache) | ~3–4 min |

---

## Cost

Everything used is free for personal / demo use:

| Service | Plan | Limit |
|---------|------|-------|
| Vercel | Free | Unlimited personal projects |
| Firebase | Spark (free) | 50K reads/day, 20K writes/day |
| Google Colab | Free | T4 GPU, 12 hrs/session |
| ngrok | Free | 1 tunnel (URL changes each session) |

---

## Design System

- **Theme:** Dark — `#0a0a0f` background, `#c9a84c` gold accent
- **Headings:** Cormorant Garamond (serif, editorial)
- **Body:** DM Sans (clean, readable)
- **Animations:** Framer Motion (page transitions, hover states)

---

## About

Northeastern University Master's capstone project — demonstrating end-to-end AI integration in a full-stack web application.

**Stack rationale:** React 19 for reactive UI, Firebase for zero-infrastructure auth and real-time config sync, Google Colab to avoid GPU hosting costs while keeping the AI pipeline state-of-the-art.

---

## License

MIT — see [LICENSE](LICENSE) for details.
