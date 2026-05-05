# Product Personas

**Course:** CS 691 — Computer Science Capstone Project, Spring 2026  
**Team:** Group 4 — AI Interior Designer v2

---

## Persona 1 — Sarah Mitchell, Homeowner

| Attribute | Detail |
|-----------|--------|
| **Name** | Sarah Mitchell |
| **Age** | 34 |
| **Occupation** | Marketing Manager |
| **Location** | Suburban Boston, MA |
| **Tech Comfort** | Moderate — uses apps daily, not a developer |

### Background
Sarah recently moved into a new home and wants to redecorate her living room. She has a rough idea of the aesthetic she wants (clean and modern) but struggles to visualize how specific styles will look in her actual space. She has browsed Pinterest for hours but cannot translate those images to her own room.

### Goals
- Visualize multiple design styles in her actual room before spending money
- Explore styles she would not normally consider (e.g., Japanese Zen)
- Get a photorealistic preview she can show her partner to get buy-in

### Pain Points
- Professional designers charge $150–$300/hour — too expensive for one room
- Generic apps show example rooms, not her specific space
- She wants results in minutes, not days

### How She Uses the App
1. Photographs her living room on her iPhone
2. Uploads to the app, selects "Modern Luxury" and "Scandinavian"
3. Uses the compare slider to show her partner both options
4. Downloads the result to share in the family group chat

### Key Quote
> "I just want to see what my room could look like without hiring someone or buying furniture I might return."

### Features Influenced
- Before/after compare slider, 8-style previews, Firebase auto-connect (no technical setup)

---

## Persona 2 — David Osei, Design Student

| Attribute | Detail |
|-----------|--------|
| **Name** | David Osei |
| **Age** | 22 |
| **Occupation** | Interior Design Student (3rd year) |
| **Location** | New York, NY |
| **Tech Comfort** | High — comfortable with design tools, some coding experience |

### Background
David is in his third year of an interior design program. He produces multiple concept presentations per semester and needs to generate ideas quickly before committing to detailed CAD work. He has used Stable Diffusion before but found it too complex for rapid client-ready visuals.

### Goals
- Rapidly prototype design concepts for class critiques and client presentations
- Generate multiple style variations of the same room quickly
- Demonstrate technical breadth to professors and potential employers

### Pain Points
- SketchUp and AutoCAD take hours to produce a single render
- Free SD web UIs change room layout, making them unusable for real rooms
- He needs 3+ style options per client and can't create each manually

### How He Uses the App
1. Takes a reference photo of a real room
2. Generates 3–4 style variations using the custom prompt feature
3. Exports and drops them into his presentation slides
4. Uses the object editor to swap specific furniture pieces

### Key Quote
> "I can show a client three completely different directions in the same meeting. That used to take me a whole weekend."

### Features Influenced
- Custom prompt input, object editing pipeline, high-quality output

---

## Persona 3 — Karen Patel, Real Estate Agent

| Attribute | Detail |
|-----------|--------|
| **Name** | Karen Patel |
| **Age** | 41 |
| **Occupation** | Real Estate Agent |
| **Location** | Miami, FL |
| **Tech Comfort** | Low-to-moderate — uses smartphone and email daily |

### Background
Karen lists 8–12 properties per month. Many are vacant or have outdated furniture that makes it hard for buyers to imagine living there. Traditional virtual staging costs $200–$400 per room and takes 2–3 business days. She needs a same-day alternative she can use herself.

### Goals
- Stage vacant rooms digitally before listing photos go live
- Help buyers visualize potential in empty spaces
- Reduce costs compared to traditional staging ($2,000–$5,000 per property)

### Pain Points
- Traditional staging is slow (2–3 day turnaround)
- She is not a designer and needs sensible defaults, not expert configuration
- The Colab setup is too technical — she needs plug-and-play

### How She Uses the App
1. Photographs empty rooms immediately after a walkthrough
2. Uploads each photo and selects "Modern Luxury" or "Scandinavian"
3. Downloads the result and adds it to MLS listing alongside the original

### Key Quote
> "It used to take three days and $400 per room. Now I do it myself in 10 minutes before I leave the property."

### Features Influenced
- Furnish Room feature, simple 3-step flow, Firebase auto-connect, download
