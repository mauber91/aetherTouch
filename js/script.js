import * as THREE from './three.min.js';

let scene, camera, renderer, clock;
let mesh;                     // the animated geometry
const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uNoiseTex: { value: null }   // optional data texture
};

init();
animate();

function init(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45, window.innerWidth/window.innerHeight, 0.1, 100 );
    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // --- geometry -------------------------------------------------------
    const geometry = new THREE.IcosahedronGeometry(1.5, 8); // high detail

    // --- material (shader) ---------------------------------------------
    const mat = new THREE.ShaderMaterial({
        vertexShader: loadGLSL('shaders/vertex.glsl'),
        fragmentShader: loadGLSL('shaders/fragment.glsl'),
        uniforms,
        side: THREE.DoubleSide,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, mat);
    scene.add(mesh);

    // --- optional data texture -----------------------------------------
    // Replace this with your own image / noise / audio‑derived texture.
    const loader = new THREE.TextureLoader();
    loader.load('https://i.imgur.com/6fMZ1vJ.png', tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        uniforms.uNoiseTex.value = tex;
    });

    window.addEventListener('resize', onWindowResize, false);
}

function loadGLSL(path){
    // Synchronously fetch the shader (dev only)
    const req = new XMLHttpRequest();
    req.open('GET', path, false);
    req.send(null);
    return req.responseText;
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
    );
}

function animate(){
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    uniforms.uTime.value += delta * 0.5; // speed

    renderer.render(scene, camera);
}
