import * as THREE from 'https://unpkg.com/three@0.150.0/build/three.module.js';
import meshVert from './shaders/mesh.vert.glsl?raw';
import meshFrag from './shaders/mesh.frag.glsl?raw';
import glitchFrag from './shaders/glitch.frag.glsl?raw';

// ...rest of your code, using meshVert, meshFrag, glitchFrag as shader strings...

async function loadShader(url) {
  const res = await fetch(url);
  return await res.text();
}

const vertexShader = await loadShader('./shaders/mesh.vert.glsl');
const fragmentShader = await loadShader('./shaders/mesh.frag.glsl');