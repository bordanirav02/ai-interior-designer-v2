# Deployment & Installation Manual

**Course:** CS 691/692 — Computer Science Capstone Project, Spring 2026
**Team:** Group 4 — AI Interior Designer v2
**Version:** 2.0 | **Last Updated:** May 2026
**Live App:** https://ai-interior-designer-v2-m4z5.vercel.app

---

## Table of Contents

1. [Audience Definition](#1-audience-definition)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Prerequisites & Installation](#3-prerequisites--installation)
   - [Windows 10/11](#windows-1011)
   - [macOS](#macos-monterey--ventura--sonoma)
   - [Linux (Ubuntu)](#linux-ubuntu-2004--2204)
4. [Configuration Instructions](#4-configuration-instructions)
5. [Deployment Instructions](#5-deployment-instructions)
   - [Frontend — React on Vercel](#component-1--frontend-react)
   - [Backend — Flask on Render](#component-2--backend-flask)
   - [AI Pipeline — Google Colab](#component-3--ai-pipeline-google-colab)
6. [Deployment Scripts](#6-deployment-scripts)
7. [Testing the Deployment](#7-testing-the-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Audience Definition

This manual is written for:

| Audience | Description | Assumed Knowledge |
|----------|-------------|-------------------|
| **System Administrators** | IT personnel deploying on organizational servers or cloud infrastructure | Server management, CLI, environment variables, firewall/port config |
| **New Developers** | Developers joining the team needing a local dev environment | Basic Python, JavaScript, Git, and web development |
| **DevOps Engineers** | Engineers setting up CI/CD, cloud deployments (Vercel, Render), or Docker | Cloud platforms, CI/CD, containerization |
| **QA Engineers** | Testers who need a fully running environment to execute test cases | Basic CLI, web browser |

**Scope:** This manual covers all three independently deployable components:

- **Frontend** — React 19 web app (Vercel CDN or local)
- **Backend** — Flask REST API (Render or local)
- **AI Pipeline** — Google Colab notebook (on-demand, connects via ngrok)

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPONENT MAP                                │
│                                                                     │
│  ┌──────────────────┐     HTTP/Axios     ┌──────────────────────┐  │
│  │  FRONTEND        │ ◄─────────────────► │  BACKEND             │  │
│  │  React 19        │                    │  Flask 3.1 (Python)  │  │
│  │  Vercel CDN      │                    │  Render / Local      │  │
│  └──────────────────┘                    └──────────┬───────────┘  │
│           │                                         │               │
│           │ Firebase SDK                            │ Routes to:    │
│           ▼                                         ▼               │
│  ┌──────────────────┐              ┌────────────────────────────┐  │
│  │  FIREBASE        │              │  GOOGLE COLAB (Primary)    │  │
│  │  Auth + Firestore│◄─────────────│  T4 GPU • SD 1.5           │  │
│  │  Storage         │  Colab URL   │  ControlNet • YOLOv8 • SAM │  │
│  └──────────────────┘  sync        │  exposed via ngrok tunnel  │  │
│                                    └────────────────────────────┘  │
│                                              OR                     │
│                                    ┌────────────────────────────┐  │
│                                    │  REPLICATE API (Fallback)  │  │
│                                    │  Paid, always-on 24/7      │  │
│                                    └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principle:** Each component is independently deployable. The frontend works whether or not the AI backend is active. The backend falls back to Replicate API if Colab is not running.

---

## 3. Prerequisites & Installation

### Windows 10/11

#### Step 1 — Install Git
1. Download from: https://git-scm.com/download/win
2. Run installer with default options
3. Verify: `git --version` → Expected: `git version 2.44.0` or higher

#### Step 2 — Install Node.js (for Frontend)
1. Download Node.js LTS (v20.x) from: https://nodejs.org
2. Run `.msi` installer with defaults
3. Verify:
```cmd
node --version    # Expected: v20.x.x or higher
npm --version     # Expected: 10.x.x or higher
```

#### Step 3 — Install Python 3.10+ (for Backend)
1. Download from: https://www.python.org/downloads/windows/
2. **IMPORTANT:** Check "Add Python to PATH" during installation
3. Verify:
```cmd
python --version    # Expected: Python 3.10.x or higher
pip --version       # Expected: pip 23.x or higher
```

#### Step 4 — Create a Python Virtual Environment
```cmd
cd "path\to\ai-interior-designer-v2\backend"
python -m venv venv
venv\Scripts\activate
```

---

### macOS (Monterey / Ventura / Sonoma)

#### Step 1 — Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2 — Install Git, Node.js, Python
```bash
brew install git
brew install node@20
brew install python@3.10
```

#### Step 3 — Add Node to PATH
```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Step 4 — Create Python Virtual Environment
```bash
cd /path/to/ai-interior-designer-v2/backend
python3 -m venv venv
source venv/bin/activate
```

---

### Linux (Ubuntu 20.04 / 22.04)

#### Step 1 — Update and Install Git
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install git -y
```

#### Step 2 — Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install nodejs -y
node --version    # Expected: v20.x.x
```

#### Step 3 — Install Python 3.10+
```bash
# Ubuntu 22.04
sudo apt-get install python3.10 python3.10-venv python3-pip -y

# Ubuntu 20.04 (needs deadsnakes PPA)
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update
sudo apt-get install python3.10 python3.10-venv python3-pip -y
```

#### Step 4 — Install Build Tools
```bash
sudo apt-get install build-essential libssl-dev libffi-dev python3-dev -y
```

#### Step 5 — Create Python Virtual Environment
```bash
cd /path/to/ai-interior-designer-v2/backend
python3.10 -m venv venv
source venv/bin/activate
```

---

## 4. Configuration Instructions

### 4.1 Clone the Repository (All Platforms)

```bash
git clone https://github.com/Ai-interiar748/Ai_interior_Project.git
cd Ai_interior_Project
```

### 4.2 Firebase Configuration

The application uses Firebase for Auth, Firestore, and Storage.

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open project `ai-interior-designer-b4c9d` (or create new)
3. Enable: **Authentication** (Email/Password + Google), **Firestore**, **Storage**
4. Add your deployment domain under Authentication → Settings → Authorized domains

**Firestore Security Rules (copy exactly):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{docId} {
      allow read: if true;
      allow write: if request.resource.data.secret == "interiorai-colab-2024";
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /public_shares/{shareId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4.3 Frontend Environment Variables

Create `frontend/.env.local` for local development:

```env
# Points to locally running Flask backend
REACT_APP_API_URL=http://localhost:5000
```

For Vercel production, set in Vercel Dashboard → Settings → Environment Variables:

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

### 4.4 Backend Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):

```env
# Replicate API fallback (sign up at replicate.com)
REPLICATE_API_TOKEN=r8_your_token_here

# Allowed CORS origins (comma-separated)
ALLOWED_ORIGINS=https://ai-interior-designer-v2-m4z5.vercel.app,http://localhost:3000

# Flask settings
FLASK_DEBUG=false
PORT=5000
```

### 4.5 Google Colab Configuration

1. A Google account with Colab access
2. An ngrok authtoken (free at https://ngrok.com)
3. In the notebook, locate:
   ```python
   ngrok.set_auth_token("YOUR_NGROK_TOKEN_HERE")
   ```
   Replace with your token from https://dashboard.ngrok.com

---

## 5. Deployment Instructions

### Component 1 — Frontend (React)

#### Option A: Production — Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import repo
3. Configure:
   - **Framework:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add Environment Variable: `REACT_APP_API_URL` → your backend URL
5. Click **Deploy** — auto-redeploys on every `git push` to `main`

Expected deploy time: **2–3 minutes**

#### Option B: Local Development

```bash
# All platforms
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

---

### Component 2 — Backend (Flask)

#### Option A: Production — Render.com (Recommended)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
4. Set Environment Variables: `REPLICATE_API_TOKEN`, `ALLOWED_ORIGINS`
5. Click **Create Web Service**

Expected deploy time: **3–5 minutes**

#### Option B: Local Development

**Windows:**
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

**macOS / Linux:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

---

### Component 3 — AI Pipeline (Google Colab)

> Colab runs in your browser — no platform-specific local install needed.

**Step 1 — Open the Notebook**

Option A — Google Drive link:
```
https://colab.research.google.com/drive/1Pm3BoUa0eih3Jq_tRHAXc2qiiGg1o7ho
```

Option B — Upload from repo:
- File → Upload notebook → Select `backend/AI_Interior_Designer_v2.ipynb`

**Step 2 — Set Runtime to T4 GPU**
```
Runtime → Change runtime type → Hardware accelerator → T4 GPU → Save
```

**Step 3 — Set ngrok Token**

Find the cell with `ngrok.set_auth_token(...)` and paste your authtoken.

**Step 4 — Run All Cells**
```
Runtime → Run all  (or Ctrl+F9)
```

**Expected Timeline:**

| Phase | Duration | What Happens |
|-------|----------|--------------|
| Dependency Install | 2–3 min | PyTorch, diffusers, ultralytics, SAM installed |
| Model Download (first run) | 5–7 min | SD 1.5, ControlNet, YOLOv8, SAM → Google Drive |
| Model Load (cached runs) | 1–2 min | Models loaded from Drive cache |
| Flask + ngrok startup | 30 sec | Server starts, ngrok URL generated |
| Firebase registration | 10 sec | ngrok URL written to Firestore |

**Step 5 — Verify Connection**

Last cell output shows:
```
Flask server running at: https://abcd-12-34-56-78.ngrok-free.app
Registered URL in Firebase: OK
Status: READY
```

The app status indicator turns **green (Live)** within 30 seconds.

---

## 6. Deployment Scripts

### Windows — Full Setup Script

Save as `setup_windows.bat` in the project root:

```batch
@echo off
echo ============================================
echo  AI Interior Designer v2 — Windows Setup
echo ============================================

node --version >nul 2>&1
if errorlevel 1 ( echo ERROR: Node.js not found && exit /b 1 )
echo [OK] Node.js found

python --version >nul 2>&1
if errorlevel 1 ( echo ERROR: Python not found && exit /b 1 )
echo [OK] Python found

echo [1/4] Installing frontend dependencies...
cd frontend && call npm install && cd ..
echo [OK] Frontend ready

echo [2/4] Setting up Python venv...
cd backend && python -m venv venv && call venv\Scripts\activate

echo [3/4] Installing backend dependencies...
pip install -r requirements.txt
echo [OK] Backend ready

echo [4/4] Creating .env...
if not exist .env ( copy .env.example .env && echo Created .env — fill in API keys )

echo Setup Complete! Run: cd frontend ^& npm start
pause
```

### macOS / Linux — Full Setup Script

Save as `setup.sh` in the project root:

```bash
#!/bin/bash
echo "=== AI Interior Designer v2 — Setup ==="

command -v node &> /dev/null || { echo "ERROR: Node.js not found"; exit 1; }
echo "[OK] Node.js $(node --version)"

command -v python3 &> /dev/null || { echo "ERROR: Python3 not found"; exit 1; }
echo "[OK] Python $(python3 --version)"

echo "[1/4] Installing frontend..."
cd frontend && npm install && cd ..

echo "[2/4] Creating Python venv..."
cd backend && python3 -m venv venv && source venv/bin/activate

echo "[3/4] Installing backend..."
pip install -r requirements.txt

echo "[4/4] Creating .env..."
[ ! -f .env ] && cp .env.example .env && echo "Created .env — fill in API keys"

cd ..
echo "=== Setup Complete! ==="
echo "  Frontend: cd frontend && npm start"
echo "  Backend:  cd backend && source venv/bin/activate && python3 app.py"
```

```bash
chmod +x setup.sh && ./setup.sh
```

### Backend Health Check Script

Save as `backend/check_health.py`:

```python
import requests, sys

BACKEND_URL = "http://localhost:5000"

def check_health():
    print("=== AI Interior Designer v2 — Health Check ===\n")
    try:
        data = requests.get(f"{BACKEND_URL}/health", timeout=10).json()
    except requests.exceptions.ConnectionError:
        print(f"FAIL: Cannot connect to {BACKEND_URL}")
        print("      Make sure Flask is running: python app.py")
        sys.exit(1)

    print(f"Backend Status:    {'OK' if data.get('status') == 'ok' else 'FAIL'}")
    print(f"Colab Connected:   {'YES' if data.get('colab_connected') else 'NO'}")
    print(f"Replicate Enabled: {'YES' if data.get('replicate_enabled') else 'NO'}")
    print(f"Active Mode:       {data.get('mode', 'none').upper()}")
    print(f"Colab URL:         {data.get('colab_url', 'Not registered')}")
    print()
    if data.get('colab_connected'):
        print("STATUS: FULL MODE — Colab GPU active.")
    elif data.get('replicate_enabled'):
        print("STATUS: 24/7 MODE — Replicate API fallback active.")
    else:
        print("STATUS: OFFLINE — Start Colab or set REPLICATE_API_TOKEN.")

if __name__ == "__main__":
    check_health()
```

---

## 7. Testing the Deployment

### Frontend Smoke Tests

| Test | Steps | Expected |
|------|-------|----------|
| Page Load | Open `http://localhost:3000` | App loads, no console errors |
| Auth — Register | Click Register, enter email + password | Account created, redirect to upload |
| Auth — Google | Click "Continue with Google" | Google popup, login succeeds |
| Upload | Drag JPEG onto upload zone | Preview appears, "Next" button shown |
| Style Cards | Click any of 8 style cards | Card highlights with blue border |
| Color Palette | Click any palette swatch | Palette selected, checkmark appears |
| Backend Status | Check status dot (top right) | Live (green) / Partial (yellow) / Offline (red) |
| History Panel | Press `Ctrl+H` | History panel slides in |
| Keyboard Shortcuts | Press `?` | Shortcut overlay appears |
| Mobile | Resize to 375px | Layout adapts, no horizontal scroll |

### Backend API Tests

```bash
# Health check
curl http://localhost:5000/health

# Upload test
curl -X POST http://localhost:5000/upload \
  -F "image=@/path/to/test_room.jpg"

# Generate test
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"style":"minimalist","palette":null,"customPrompt":null}'
```

### Full End-to-End Pipeline Test

```
1.  Start Colab (Runtime → Run all)
2.  Wait for "READY" in last cell (~7-10 min first run)
3.  Open live app URL
4.  Confirm status dot turns GREEN (Live mode)
5.  Log in with Google
6.  Upload a room photo (any JPEG)
7.  Select "Minimalist" style
8.  Click Generate → Wait 1-2 minutes
9.  Confirm styled image appears
10. Drag compare slider — original | styled side by side
11. Click "Edit Objects" → click "sofa" chip
12. Type: "white velvet sofa with gold legs" → Apply
13. Confirm only the sofa changed
14. Press Ctrl+Z — image should revert
15. Click Download — JPEG saved
16. PASS: Full pipeline confirmed working
```

---

## 8. Troubleshooting

### Frontend Issues

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| Blank white screen on load | Build error or missing env var | Open DevTools → Console. Run `npm run build` locally to see errors. |
| "Failed to fetch" on all requests | Backend URL wrong or not running | Check `REACT_APP_API_URL` in `.env.local`. Verify Flask is running. |
| Status dot stuck on "Checking..." | Firebase Firestore unreachable | Check Firebase Console → Firestore is enabled and rules are published. |
| Google login popup blocked | Browser blocking popups | Allow popups for localhost/Vercel domain in browser settings. |
| `npm install` fails with ERESOLVE | Peer dependency conflict | Run: `npm install --legacy-peer-deps` |
| App shows old version after deploy | Vercel cached old build | Vercel Dashboard → Deployments → Redeploy. Clear cache with `Ctrl+Shift+R`. |

### Backend Issues

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| `ModuleNotFoundError` on startup | venv not activated | Activate venv first, then `pip install -r requirements.txt` |
| Port 5000 already in use | Another process using port | Change port: `python app.py --port 5001` or run `npx kill-port 5000` |
| CORS error in browser | Frontend domain not in ALLOWED_ORIGINS | Add frontend URL to `ALLOWED_ORIGINS` in `.env` and restart Flask |
| `503 No AI backend connected` | No Colab or Replicate configured | Start Colab notebook OR set `REPLICATE_API_TOKEN` in `.env` |
| Render deployment fails | Build error | Check Render Logs → look for pip errors → ensure `requirements.txt` is in `backend/` |

### Google Colab Issues

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| "No GPU available" | Free tier GPU limit reached | Wait 12-24 hours. Consider Colab Pro for guaranteed access. |
| ngrok `AuthenticationError` | Wrong or expired authtoken | Get fresh authtoken from https://dashboard.ngrok.com |
| `CUDA out of memory` | GPU VRAM exceeded | Runtime → Restart runtime → Run all again |
| Status dot stays "Offline" | Firebase write failed | Check last cell for "Firebase registration: OK". Verify Firestore rules. |
| Models re-download despite cache | Drive not mounted | Ensure Google Drive mount cell ran. Check `/content/drive/MyDrive/InteriorAI_Models/` exists. |
| Colab session disconnects | 90-min idle timeout | Re-run all cells (models reload from cache in ~2 min) |

### Firebase Issues

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| `auth/unauthorized-domain` | Frontend domain not in Firebase | Firebase Console → Auth → Settings → Authorized domains → add domain |
| Firestore permission denied | Security rules wrong | Re-publish correct rules (see Section 4.2) |
| `auth/invalid-api-key` | Firebase config incorrect | Verify `firebase.js` has correct `apiKey` from Firebase Console → Project Settings |

### Common Error Messages Quick Reference

```
Error: ENOENT: no such file or directory, open '.../.env'
→ Copy .env.example to .env and fill in values

Error: Cannot find module 'react'
→ cd frontend && npm install

Error: python: command not found
→ Use python3 on macOS/Linux. On Windows, re-install Python with "Add to PATH" checked.

Error: address already in use :::5000
→ Kill the port: npx kill-port 5000

Error: Firebase: Error (auth/network-request-failed)
→ Check internet connection. Firebase requires HTTPS in production.

Error: Replicate API error 401
→ Your REPLICATE_API_TOKEN is invalid. Get a new one at replicate.com.

Error: ControlNet model not found in cache
→ First-time load — wait 5-7 min for download. Subsequent runs use Drive cache.
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Clone repo | `git clone https://github.com/Ai-interiar748/Ai_interior_Project.git` |
| Install frontend | `cd frontend && npm install` |
| Start frontend | `cd frontend && npm start` |
| Build for prod | `cd frontend && npm run build` |
| Activate venv (Win) | `venv\Scripts\activate` |
| Activate venv (Mac/Linux) | `source venv/bin/activate` |
| Install backend | `cd backend && pip install -r requirements.txt` |
| Start backend (dev) | `cd backend && python app.py` |
| Start backend (prod) | `gunicorn app:app --bind 0.0.0.0:5000` |
| Check backend health | `curl http://localhost:5000/health` |
| Run health check | `cd backend && python check_health.py` |
| Open Colab | Visit link → Runtime → Run all |
| Verify full pipeline | Follow Section 7 end-to-end test |

---

*AI Interior Designer v2 — CS 691/692 Capstone Project, Pace University, Spring 2026 — Group 4*
