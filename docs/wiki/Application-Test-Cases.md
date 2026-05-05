# Application Test Cases

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2  
**Last Updated:** May 2026

---

## Coverage Summary

| Category | Cases | Passed | Failed |
|----------|-------|--------|--------|
| Authentication | 6 | 6 | 0 |
| Image Upload | 5 | 5 | 0 |
| Style Generation | 7 | 7 | 0 |
| Result View | 6 | 6 | 0 |
| Object Editing | 5 | 5 | 0 |
| Preview All Styles | 4 | 4 | 0 |
| Furnish Room | 3 | 3 | 0 |
| History & Undo | 4 | 4 | 0 |
| Connection Status | 3 | 3 | 0 |
| Mobile | 3 | 3 | 0 |
| **Total** | **46** | **46** | **0** |

---

## Authentication

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-AUTH-01 | US-S2-01 | Registered account exists | Enter valid email + password → Sign In | Redirect to Upload screen | ✅ Pass |
| TC-AUTH-02 | US-S2-01 | Login screen visible | Enter valid email + wrong password → Sign In | Toast: "Invalid email or password", stay on login | ✅ Pass |
| TC-AUTH-03 | US-S2-02 | Google account available; domain in Firebase | Click "Continue with Google" → select account | Authenticated, redirect to Upload | ✅ Pass |
| TC-AUTH-04 | US-S2-01 | Email not registered | Click Register → enter new email + password ≥6 chars | Account created, redirect to Upload | ✅ Pass |
| TC-AUTH-05 | US-S2-01 | Registration form visible | Enter 4-character password → Register | Validation error: "Password must be at least 6 characters" | ✅ Pass |
| TC-AUTH-06 | US-S2-01 | User logged in | Click Sign Out | Session cleared, redirect to login | ✅ Pass |

---

## Image Upload

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-UPLOAD-01 | US-S1-01 | Logged in, on Upload screen | Drag JPEG onto upload zone | Preview appears; Next button activates | ✅ Pass |
| TC-UPLOAD-02 | US-S1-01 | On Upload screen | Click zone → select PNG from file picker | Preview appears; Next button activates | ✅ Pass |
| TC-UPLOAD-03 | US-S1-01 | On Upload screen | Drag a PDF onto upload zone | Toast: "Please upload a JPEG or PNG image" | ✅ Pass |
| TC-UPLOAD-04 | US-S1-01 | User has 12MB JPEG | Upload large file | File accepted; Flask resizes to 512×512 via Pillow | ✅ Pass |
| TC-UPLOAD-05 | US-S1-01 | Image already uploaded | Drag new image onto zone | Preview updates to new image | ✅ Pass |

---

## Style Generation

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-GEN-01 | US-S1-07 | Image uploaded; Colab running (green dot) | Select "Minimalist" → Generate Full Quality | Styled image loads within 3 min | ✅ Pass (~95 sec) |
| TC-GEN-02 | US-S2-05 | Image uploaded; Colab running | Select "Scandinavian" + "Warm Neutrals" palette → Generate | Generated image shows warm tones | ✅ Pass |
| TC-GEN-03 | US-S4-01 | Image uploaded; Colab running | Select "Modern Luxury" + type "dark emerald velvet accents" → Generate | Image incorporates emerald green | ✅ Pass |
| TC-GEN-04 | US-S1-06 | Image uploaded; no style selected | Click Generate | Button disabled / validation shown | ✅ Pass |
| TC-GEN-05 | US-S2-07 | Colab offline (red dot) | Select style → Generate | Toast: "AI is currently offline" | ✅ Pass |
| TC-GEN-06 | US-S2-03 | Generation in progress | Observe UI during wait | Progress bar visible; Generate disabled | ✅ Pass |
| TC-GEN-07 | US-S1-03 | Room with distinct window uploaded | Generate "Cyberpunk" → compare window position | Window in same position (ControlNet preserved) | ✅ Pass |

---

## Result View

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-RESULT-01 | US-S2-04 | Generation complete | Drag compare slider to 25% then 75% | Images reveal proportionally, no lag | ✅ Pass |
| TC-RESULT-02 | US-S3-05 | On Result screen | Scroll up over generated image | Image zooms in centered on cursor | ✅ Pass |
| TC-RESULT-03 | US-S3-05 | Image zoomed in | Click and drag image | Image pans in drag direction | ✅ Pass |
| TC-RESULT-04 | US-S3-06 | Generation complete | Click Download | JPEG saved with watermark | ✅ Pass |
| TC-RESULT-05 | US-S4-04 | 2+ generations completed | Click Undo / press Ctrl+Z | Previous image restored | ✅ Pass |
| TC-RESULT-06 | US-S3-04 | 2 styles generated | Click "Compare Styles" → select 2 styles | 3-panel view: original + 2 styles with labels | ✅ Pass |

---

## Object Editing

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-OBJ-01 | US-S3-07 | Styled image with furniture | Click "Edit Objects" | Object chips appear within 10 seconds | ✅ Pass (~4 sec) |
| TC-OBJ-02 | US-S3-07 | "sofa" chip visible | Click "sofa" → type prompt → Apply | Only sofa region replaced; rest unchanged | ✅ Pass |
| TC-OBJ-03 | US-S3-07 | Minimalist/empty generated image | Click "Edit Objects" | Message: "No objects detected" | ✅ Pass |
| TC-OBJ-04 | US-S3-07 | Multiple objects detected | Edit sofa → Apply; edit table → Apply | Both replacements visible in final image | ✅ Pass |
| TC-OBJ-05 | US-S3-07 | Object chip clicked | Leave prompt empty → Cancel | No generation triggered; original unchanged | ✅ Pass |

---

## Preview All Styles

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-PREVIEW-01 | US-S3-02 | Image uploaded; Colab running | Click "Preview All 8 Styles" | All 8 labeled thumbnails appear (~8 min) | ✅ Pass (7.5 min) |
| TC-PREVIEW-02 | US-S3-03 | Thumbnails visible | Click any thumbnail | Full-size modal opens with close button | ✅ Pass |
| TC-PREVIEW-03 | US-S3-03 | Modal open | Click × or press Escape | Modal closes; grid remains | ✅ Pass |
| TC-PREVIEW-04 | US-S3-01 | Preview triggered | Observe UI during generation | Spinner visible; thumbnails appear one-by-one | ✅ Pass |

---

## History & Undo

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-HIST-01 | US-S4-03 | 1+ generations completed | Press Ctrl+H | Side panel slides in with thumbnails | ✅ Pass |
| TC-HIST-02 | US-S4-03 | 9 generations completed | Open history panel | Only 8 most recent shown; oldest removed | ✅ Pass |
| TC-UNDO-01 | US-S4-04 | 2+ generations completed | Press Ctrl+Z | Previous image restored | ✅ Pass |
| TC-UNDO-02 | US-S4-04 | Only 1 generation exists | Press Ctrl+Z | No change or message: "Nothing to undo" | ✅ Pass |

---

## Connection Status

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-STATUS-01 | US-S2-07 | Colab running, URL in Firestore | Open app | Status dot green within 30 sec | ✅ Pass |
| TC-STATUS-02 | US-S2-07 | Colab session ended | Open app | Status dot red; Generate shows offline state | ✅ Pass |
| TC-STATUS-03 | US-S2-07 | Colab running; URL registered mid-session | Wait 30 seconds after Colab registers | Status dot updates from red to green automatically | ✅ Pass |

---

## Mobile

| TC | Story | Preconditions | Steps | Expected | Result |
|----|-------|--------------|-------|----------|--------|
| TC-MOB-01 | US-S4-05 | Browser devtools at 375×812 | Navigate all screens | No horizontal scroll; all elements accessible | ✅ Pass |
| TC-MOB-02 | US-S4-05 | App on mobile device | Tap upload zone → select from camera roll | Image selected and preview appears | ✅ Pass |
| TC-MOB-03 | US-S4-05 | Generation complete on mobile | Touch and drag compare slider | Slider responds to touch; images reveal correctly | ✅ Pass |
