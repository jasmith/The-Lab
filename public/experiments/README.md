# Experiments Directory

This directory contains experimental projects and proofs-of-concept for The Lab.

## Structure

Each experiment should be organized in its own subdirectory with the following structure:

```
experiment-name/
├── index.html          # Main HTML file
├── styles.css          # Experiment-specific styles
├── app.js             # ES6 JavaScript module
└── assets/            # Any additional assets (images, audio, etc.)
```

## Development Standards

All experiments should follow the development standards outlined in `/specifications/development-standards.mdc`:

- ✅ ES6+ JavaScript syntax
- ✅ Separation of concerns (HTML/CSS/JS in separate files)
- ✅ No inline styles or event handlers
- ✅ Responsive design
- ✅ Proper security practices (minimal innerHTML usage)

## Current Experiments

### Psychocircle (`/psychoCircle`)
Canvas-based animation experiment featuring:
- Radial gradient circles
- Dynamic color generation
- Audio integration
- Multiple animation modes (psycho circles, balloons)

**Access:** [http://localhost:3000/experiments/psychoCircle/](http://localhost:3000/experiments/psychoCircle/)

### Balloonacy (`/balloonacy`)
Interactive balloon popping game featuring:
- Click-to-pop balloon mechanics
- Real-time score tracking
- Beautiful gradient balloons with realistic lighting
- Dynamic balloon spawning
- Responsive canvas gameplay

**Access:** [http://localhost:3000/experiments/balloonacy/](http://localhost:3000/experiments/balloonacy/)

## Adding New Experiments

1. Create a new directory under `/public/experiments/`
2. Follow the standard file structure
3. Ensure compliance with development standards
4. Add a card to the main index page experiments section
5. Document your experiment in this README

---

**Note:** Experiments are served statically via Express. No server-side routing configuration needed.

