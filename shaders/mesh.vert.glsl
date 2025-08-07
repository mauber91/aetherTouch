uniform float uTime;
varying vec3 vPos;
varying vec2 vUv;

void main(){
    vUv = uv;
    vPos = position;
    float dist = length(position);
    float noise = sin(10.0 * dist + uTime) * 0.15;
    vec3 newPosition = position + normal * noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);
}
