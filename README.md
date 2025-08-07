# HandFlow - Interactive Particle Animation

An interactive art installation that uses hand gestures to manipulate 3D particle systems. Inspired by Refik Anadol's data sculptures and interactive art pieces.

## Features
- Real-time hand tracking using MediaPipe
- Interactive 3D particle system with Three.js
- Gesture-based interaction
- Dynamic color transitions
- Fluid animation responses

## Setup

1. Clone the repository
2. Open index.html in a modern web browser
3. Allow camera access when prompted
4. Use hand gestures to interact with the particles

## Customization Guide

### Particle Colors
To modify the particle colors, locate the color initialization in `main.js`:

```javascript
// Around line 50 in main.js
if (colorChoice < 0.33) {
    color = new THREE.Color(0x9932CC); // Purple
} else if (colorChoice < 0.66) {
    color = new THREE.Color(0x4169E1); // Blue
} else {
    color = new THREE.Color(0xFF4500); // Red
}
```

Replace the hex colors with your preferred values.

### Hand Gestures
Adjust hand gesture sensitivity in `hand.js`:

```javascript
// Modify this value to change how closed the hand needs to be for interaction
const pressed = avgSpread < 0.1; // Lower = needs to be more closed
```

### Particle System
Modify particle behavior in `main.js`:

```javascript
// Number of particles
const numParticles = 35000; // Increase/decrease for density

// Particle size
material = new THREE.PointsMaterial({
    size: 2, // Adjust particle size
    sizeAttenuation: true,
    vertexColors: true
});

// Interaction radius
if (distance < 200) { // Adjust interaction distance
    // ...
}
```

### Animation Settings
Fine-tune animation parameters in `main.js`:

```javascript
// Rotation speed
particles.rotation.y += 0.0006; // Adjust rotation speed

// Particle movement amplitude
positions[i] = vector.x + Math.sin(i + time) * 0.1; // Adjust wave amplitude
```

### Visual Cursor
Modify the hand cursor appearance in `index.html`:

```css
#handCursor {
    width: 12px;  /* Cursor size */
    height: 12px;
    background: white;  /* Default color */
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);  /* Glow effect */
}
```

### Camera Settings
Adjust hand tracking camera settings in `hand.js`:

```javascript
const cam = new window.Camera(videoEl, {
    width: 1920,   // Camera resolution width
    height: 1080   // Camera resolution height
});
```

## Hand Tracking Settings
Fine-tune hand detection in `hand.js`:

```javascript
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1.0,     // 0.0 to 1.0 (higher = more accurate but slower)
    minDetectionConfidence: 0.8,  // 0.0 to 1.0 (higher = stricter detection)
    minTrackingConfidence: 0.5    // 0.0 to 1.0 (higher = more stable tracking)
});
```

## Tips
- For better performance, reduce `numParticles` if experiencing lag
- Adjust `minDetectionConfidence` if hand tracking is too sensitive/not sensitive enough
- Modify `box-shadow` values in CSS for different cursor effects
- Experiment with different color combinations for unique visual effects

## Dependencies
- Three.js (r128)
- MediaPipe Hands
- MediaPipe Camera Utils

## Browser Support
Requires a modern browser with