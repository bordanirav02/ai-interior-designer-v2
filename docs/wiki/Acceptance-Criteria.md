# Acceptance Criteria

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2

Criteria are written in **Given / When / Then** format. A story is Done only when all its criteria pass.

---

## Authentication

**US-S2-01 — Email Login**

Given a visitor enters a valid email and password  
When they click Sign In  
Then they are authenticated and redirected to the upload screen

Given a visitor enters an incorrect password  
When they click Sign In  
Then they see a toast: "Invalid email or password" and remain on the login page

**US-S2-02 — Google OAuth**

Given a visitor clicks "Continue with Google"  
When they complete the Google popup  
Then they are authenticated and redirected to the upload screen

---

## Image Upload

**US-S1-01 — Drag-and-Drop**

Given a logged-in user drags a JPEG/PNG onto the upload zone  
When the drop fires  
Then a preview appears and the Next button activates

Given a user drops a non-image file  
When the drop fires  
Then a toast error: "Please upload a JPEG or PNG image"

---

## Style Generation

**US-S1-06 — Style Selection**

Given a user clicks a style card  
When the click is registered  
Then the card highlights and the Generate button activates

**US-S1-07 — Generation Result**

Given a user clicks Generate with Colab online  
When the AI pipeline completes  
Then the styled image appears within 3 minutes

Given Colab is offline  
When a user clicks Generate  
Then a toast: "AI is currently offline. Please try again later."

**US-S2-03 — Progress Indicator**

Given a user clicks Generate  
When the AI is processing  
Then a loading bar is visible and Generate is disabled to prevent duplicate requests

**US-S4-01 — Custom Prompt**

Given a user types in the custom prompt field and clicks Generate  
When the request is sent  
Then the custom text is appended to the style prompt

---

## Result View

**US-S2-04 — Compare Slider**

Given a user drags the slider to 25% then 75%  
When the drag completes  
Then original and generated images are revealed proportionally with no lag

**US-S3-05 — Zoom and Pan**

Given a user scrolls up over the generated image  
When the scroll fires  
Then the image zooms in centered on the cursor

Given the image is zoomed in and the user drags  
When the drag fires  
Then the image pans smoothly in the drag direction

**US-S3-06 — Download**

Given a user clicks Download  
When the download is triggered  
Then a JPEG file saves to the device with a watermark

**US-S4-04 — Undo**

Given a user presses Ctrl+Z  
When the event fires  
Then the previous generated image is restored

---

## Object Editing

**US-S3-07 — Object Detection**

Given a user clicks "Edit Objects"  
When YOLOv8 detection completes  
Then detected furniture appears as clickable chips within 10 seconds

Given a user clicks a chip, types a replacement, and clicks Apply  
When inpainting completes  
Then only the masked region is replaced; the rest of the room is unchanged

Given no furniture is detected  
When the user opens the editor  
Then a message: "No objects detected. Try generating with a furnished style."

---

## Preview All Styles

**US-S3-02 — Preview All 8**

Given a user clicks "Preview All Styles"  
When all generations complete  
Then exactly 8 labeled thumbnails appear

**US-S3-03 — Full-Size Modal**

Given a user clicks a thumbnail  
When the click fires  
Then a full-size modal opens with a close button

---

## Furnish Room

**US-S4-02 — Furnish Empty Room**

Given a user selects a room type and furniture category  
When they click Generate  
Then the AI furnishes the uploaded empty room image

---

## History

**US-S4-03 — History Panel**

Given a user presses Ctrl+H  
When the event fires  
Then a side panel slides in with thumbnails of the last 8 generations

Given more than 8 generations exist  
When a new one completes  
Then the oldest history entry is automatically removed

---

## Connection Status

**US-S2-07 — Status Indicator**

Given Colab is running and registered in Firestore  
When the user opens the app  
Then the status dot turns green within 30 seconds

Given Colab has ended  
When the user opens the app  
Then the status dot is red and Generate shows an offline state

---

## Mobile

**US-S4-05 — Mobile Responsiveness**

Given a user opens the app on a 375px screen  
When they navigate through all screens  
Then no horizontal scroll appears and all elements have a minimum 44px tap target
