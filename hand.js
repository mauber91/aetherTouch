// This script bridges hand tracking to synthetic mouse events
// It requires MediaPipe Hands library and Camera Utils to be loaded via <script> tags
(function(){
  // Get reference to video element that will show camera feed
  // Must have an element with id="handcam" in your HTML
  const videoEl = document.getElementById('handcam');
  if (!videoEl) return;

  // Track mouse button state and last known coordinates
  let isDown = false; // true when simulating mouse button press
  let lastClientX = null, lastClientY = null;

  // Helper function to create and dispatch synthetic mouse events
  // type: 'mousedown', 'mousemove', or 'mouseup'
  // x,y: screen coordinates for the event
  function dispatchMouse(type, x, y){
    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      // Set appropriate button state based on event type
      buttons: type === 'mousemove' ? (isDown ? 1 : 0) : (type === 'mousedown' ? 1 : 0)
    });
    window.dispatchEvent(evt);
    document.dispatchEvent(evt);
  }

  // MODIFICATION POINT 1: Hand tracking result handler
  // This function is called every frame with detected hand landmarks
  function onResults(results){
    // Handle case when no hands are detected
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0){
      // Release virtual mouse button if hand disappears while holding
      if (isDown && lastClientX != null && lastClientY != null){
        dispatchMouse('mouseup', lastClientX, lastClientY);
        isDown = false;
      }
      return;
    }

    const lm = results.multiHandLandmarks[0];
    
    // Calculate average position of palm landmarks for cursor movement
    // Using landmarks 0,5,9,13,17 which form the base of the palm
    const palmPoints = [lm[0], lm[5], lm[9], lm[13], lm[17]];
    const palmCenter = palmPoints.reduce((acc, point) => {
        return {
            x: acc.x + point.x / palmPoints.length,
            y: acc.y + point.y / palmPoints.length
        };
    }, {x: 0, y: 0});

    // Use palm center for cursor position instead of index finger
    const clientX = Math.round(palmCenter.x * window.innerWidth);
    const clientY = Math.round(palmCenter.y * window.innerHeight);
    lastClientX = clientX; lastClientY = clientY;

    // Move the cursor to follow the palm center
    dispatchMouse('mousemove', clientX, clientY);

    // For click detection, you can use palm opening/closing
    // Calculate average distance between palm center and fingertips
    const fingertips = [lm[4], lm[8], lm[12], lm[16], lm[20]]; // all fingertips
    const avgSpread = fingertips.reduce((acc, tip) => {
        const dx = tip.x - palmCenter.x;
        const dy = tip.y - palmCenter.y;
        return acc + Math.hypot(dx, dy);
    }, 0) / fingertips.length;

    // Adjust this threshold to change click sensitivity
    const pressed = avgSpread < 0.1; // smaller = hand needs to be more closed to trigger

    // Handle virtual mouse button state
    if (pressed && !isDown){
      isDown = true;
      dispatchMouse('mousedown', clientX, clientY);
    } else if (!pressed && isDown){
      isDown = false; 
      dispatchMouse('mouseup', clientX, clientY);
    }

    // Add this after your hand tracking setup
    function updateHandCursor(x, y, isPressed) {
        const cursor = document.getElementById('handCursor');
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        cursor.style.background = isPressed ? 'yellow' : 'white';
    }

    // Find where you process hand landmarks and add:
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            const indexFinger = landmarks[8];
            const x = indexFinger.x * window.innerWidth;
            const y = indexFinger.y * window.innerHeight;
            updateHandCursor(x, y, pressed); // Pass the pressed state
        }
    }
  }

  // Initialize hand tracking and camera
  function start(){
    if (!window.Hands || !window.Camera){
      console.warn('[hand.js] MediaPipe Hands or Camera Utils not loaded.');
      return;
    }

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    // MODIFICATION POINT 5: Adjust MediaPipe Hands options
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1.0,     // Increased from 0.9 to 1.0 for maximum accuracy
      selfieMode: true,
      minDetectionConfidence: 0.8,  // Increased from 0.5 to 0.8 for stricter detection
      minTrackingConfidence: 0.5    // Increased from 0.1 to 0.5 for more stable tracking
    });
    hands.onResults(onResults);

    // MODIFICATION POINT 6: Adjust camera settings
    const cam = new window.Camera(videoEl, {
      onFrame: async () => {
        await hands.send({ image: videoEl });
      },
      width: window.innerWidth < 960 ? 640 : 1920,   // Lower resolution for mobile
      height: window.innerWidth < 960 ? 480 : 1080,  // Lower resolution for mobile
    });
    cam.start();
  }

  // Start tracking when DOM is ready
  if (document.readyState === 'loading'){
    window.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
