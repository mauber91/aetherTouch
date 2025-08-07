uniform float uTime;
uniform sampler2D uNoiseTex; // optional data source
varying vec3 vPos;
varying vec2 vUv;

vec3 palette(float t){
    // a smooth rainbow palette (you can change it)
    return 0.5 + 0.5*cos(6.28318*(t+vec3(0,0.33,0.66))+vec3(1,1,1));
}

void main(){
    // Color based on position & time
    float hue = mod(vPos.y * 0.5 + uTime*0.1, 1.0);
    vec3 baseColor = palette(hue);

    // Mix in a data texture if available
    vec4 texCol = texture2D(uNoiseTex, vUv * 4.0 + vec2(0,uTime*0.05));
    vec3 finalColor = mix(baseColor, texCol.rgb, 0.5);

    gl_FragColor = vec4(finalColor, 0.8); // some transparency
}
