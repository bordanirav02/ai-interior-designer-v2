# Sprint 1 Completed Tasks

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2

> This burndown chart covers **Sprint 1 only** — not cumulative across sprints.

---

## Sprint 1 Goal

Establish a working end-to-end pipeline: user can upload a room photo, select a style, and receive an AI-generated result. Flask API and Colab notebook must be connected.

---

## Sprint 1 Burndown Chart

| Day | Remaining Story Points |
|-----|----------------------|
| Day 1 | 13 |
| Day 2 | 13 |
| Day 3 | 10 |
| Day 4 | 10 |
| Day 5 | 8 |
| Day 6 | 6 |
| Day 7 | 6 |
| Day 8 | 4 |
| Day 9 | 2 |
| Day 10 | 0 |

**Committed:** 13 story points | **Completed:** 13 | **Rate:** 100%

---

## Completed User Stories

| Story ID | User Story | Points | Status |
|----------|-----------|--------|--------|
| US-S1-01 | Set up GitHub repo with folder structure | 1 | ✅ Done |
| US-S1-02 | Drag-and-drop room photo upload | 2 | ✅ Done |
| US-S1-03 | Integrate Stable Diffusion 1.5 in Colab | 3 | ✅ Done |
| US-S1-04 | ControlNet Canny edge detection for structure preservation | 3 | ✅ Done |
| US-S1-05 | Flask `/upload` and `/generate` endpoints | 2 | ✅ Done |
| US-S1-06 | ngrok tunnel from Colab to internet | 1 | ✅ Done |
| US-S1-07 | Basic style selection UI with 8 cards | 1 | ✅ Done |

---

## Sprint 1 Retrospective

**What went well:**
- ControlNet integration worked on the first attempt with T4 GPU
- Flask-to-Colab routing via ngrok was straightforward
- Team communication was strong through Discord

**What could be improved:**
- Colab cold-start takes 7–10 min — needs clear user communication
- Upload UI needed more polish
- No error handling when Colab is offline

**Action items for Sprint 2:**
- Add loading states and progress indicators
- Implement before/after compare slider
- Add Firebase Authentication
