export const vertexShader = `uniform float uTime;
			uniform float uBreak;
			varying vec3 vPos;
			varying vec2 vUv;

			float rand(vec2 co){
					return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
			}

			void main(){
					vUv = uv;
					vPos = position;

					float dist = length(position);
					float noise = sin(25.0 * dist + uTime) * 0.1;

					// Make cubes larger and more visible
					float gridSize = 0.3; // Try 0.18–0.3 for different cube sizes
					vec3 gridCell = floor(position / gridSize + 0.5);
					vec3 cubeCenter = gridCell * gridSize;

					vec3 breakupOffset = vec3(0.0);
					if(uBreak > 0.01){
							float t = uTime + uBreak * 2.0;
							breakupOffset.x = (rand(gridCell.xy + t) - 0.5) * 1.2 * uBreak;
							breakupOffset.y = (rand(gridCell.yz + t) - 0.5) * 1.9 * uBreak;
							breakupOffset.z = (rand(gridCell.zx + t) - 0.5) * 1.5 * uBreak;
							breakupOffset.y -= uBreak * uTime * (0.5 + rand(gridCell.xy + t));
							cubeCenter += breakupOffset;
					}

					// Shrink mesh inside each cube so cubes don't touch
					vec3 localPos = (position - cubeCenter) * mix(1.0, 0.3, uBreak);

					vec3 newPosition = cubeCenter + localPos + normal * noise * (1.8-uBreak);

					gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);
			}
		`;

export const fragmentShader = `uniform float uTime;
uniform sampler2D uNoiseTex;
varying vec3 vPos;
varying vec2 vUv;

vec3 palette(float t){
    return 0.5 + 0.5*cos(6.28318*(t+vec3(0,0.33,0.66))+vec3(1,1,1));
}

void main(){
    float hue = mod(vPos.y * 0.5 + uTime*0.1, 1.0);
    vec3 baseColor = palette(hue);

    // Calculate tiled UVs
    vec2 uv = vUv * 4.0 + vec2(0,uTime*0.05);

    // Find distance to nearest seam (0 or 1 in tile space)
    vec2 seamDist = min(fract(uv), 1.0 - fract(uv));
    float seamProximity = smoothstep(0.0, 0.08, min(seamDist.x, seamDist.y)); // 0 near seam, 1 away

    // Standard blur
    vec4 texCol = (
        texture2D(uNoiseTex, uv) +
        texture2D(uNoiseTex, uv + vec2(0.01, 0.0)) +
        texture2D(uNoiseTex, uv + vec2(-0.01, 0.0)) +
        texture2D(uNoiseTex, uv + vec2(0.0, 0.01)) +
        texture2D(uNoiseTex, uv + vec2(0.0, -0.01))
    ) / 5.0;

    // Stronger blur for seams
    vec4 seamBlur = (
        texture2D(uNoiseTex, uv + vec2(0.03, 0.0)) +
        texture2D(uNoiseTex, uv + vec2(-0.03, 0.0)) +
        texture2D(uNoiseTex, uv + vec2(0.0, 0.03)) +
        texture2D(uNoiseTex, uv + vec2(0.0, -0.03)) +
        texture2D(uNoiseTex, uv + vec2(0.03, 0.03)) +
        texture2D(uNoiseTex, uv + vec2(-0.03, -0.03))
    ) / 6.0;

    // Mix more blur near seams
    vec4 blendedTex = mix(seamBlur, texCol, seamProximity);

    vec3 finalColor = mix(baseColor, blendedTex.rgb, 0.5);

    gl_FragColor = vec4(finalColor, 0.8);
}
`;