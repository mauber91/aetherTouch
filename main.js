let scene, camera, renderer, particles, material;
let mouse = new THREE.Vector2();
let isMouseDown = false;
let mouseJustReleased = false;
let lastMouseDown = false;

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const numParticles = 35000;
    const radius = 400; // Sphere radius

    for (let i = 0; i < numParticles; i++) {
        // Create particles in a sphere
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const r = radius * Math.cbrt(Math.random()); // Cube root for uniform distribution

        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        
        vertices.push(x, y, z);

        // Random color between purple, blue and red
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.33) {
            color = new THREE.Color(0x9932CC); // Purple
        } else if (colorChoice < 0.66) {
            color = new THREE.Color(0x4169E1); // Blue
        } else {
            color = new THREE.Color(0xFF4500); // Red
        }
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: true,
        vertexColors: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse move event listener
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    // Add mouse down/up event listeners
    document.addEventListener('mousedown', () => isMouseDown = true);
    document.addEventListener('mouseup', () => isMouseDown = false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    // Scale mouse coordinates to match scene space
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;
    const time = Date.now() * 0.00005;

    // Check if mouse was just released
    if (lastMouseDown && !isMouseDown) {
        mouseJustReleased = true;
        setTimeout(() => mouseJustReleased = false, 100); // Reset after 100ms
    }
    lastMouseDown = isMouseDown;

    for (let i = 0; i < positions.length; i += 1) {
        const vector = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        
        // Convert mouse coordinates to scene space
        const mouseVector = new THREE.Vector3(
            mouse.x * 500, // Reduced from 800
            mouse.y * 300, // Reduced from 900
            0
        );
        const distance = vector.distanceTo(mouseVector);

        if (isMouseDown) {
            // Strong attraction to cursor when mouse is down
            const cursorForce = mouseVector.clone()
                .sub(vector)
                .normalize()
                .multiplyScalar(3.0);
            vector.add(cursorForce);
        } else {
            // Add hover effect
            if (distance < 200) { // Reduced from 200 for tighter interaction
                const repelForce = vector.clone()
                    .sub(mouseVector)
                    .normalize()
                    .multiplyScalar(2.0);
                vector.add(repelForce);
            }

            if (mouseJustReleased) {
                // Reduced explosion strength and more randomization
                const mousePos = new THREE.Vector3(mouse.x * 600, mouse.y * 900, 0);
                const explosiveForce = vector.clone().sub(mousePos).normalize();
                // Add random direction to explosion
                explosiveForce.x += (Math.random() - 0.5) * 0.5;
                explosiveForce.y += (Math.random() - 0.5) * 0.5;
                explosiveForce.z += (Math.random() - 0.5) * 0.5;
                const explosionStrength = 15.0 + Math.random() * 2.0;
                vector.add(explosiveForce.multiplyScalar(explosionStrength));
            }

            // Improved spherical containment
            const centerForce = new THREE.Vector3().subVectors(new THREE.Vector3(), vector).normalize();
            const distanceFromCenter = vector.length();
            const sphereRadius = 300;
            
            // Smoother containment force
            if (distanceFromCenter > sphereRadius) {
                const pullBackStrength = 1.0 + Math.pow((distanceFromCenter - sphereRadius) / 100, 2);
                vector.add(centerForce.multiplyScalar(pullBackStrength));
            }

            // Add slight random movement to break up patterns
            vector.x += (Math.random() - 0.5) * 0.1;
            vector.y += (Math.random() - 0.5) * 0.1;
            vector.z += (Math.random() - 0.5) * 0.1;
        }

        // Reduced movement amplitude and added z-axis variation
        positions[i] = vector.x + Math.sin(i + time) * 0.1;
        positions[i + 1] = vector.y + Math.cos(i + time) * 0.1;
        positions[i + 2] = vector.z + Math.sin(i * 1.1 + time) * 0.1;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.0006;

    renderer.render(scene, camera);
}