export const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

export const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      // Simple VHS/Glitch effect
      void main() {
        vec2 uv = vUv;
        float y = uv.y * uResolution.y;

        // Horizontal color channel offset
        float glitch = step(fract(uTime * 0.5 + y * 0.01), 0.1);
        float offset = glitch * 0.02 * sin(uTime * 10.0 + y * 0.05);

        vec3 col;
        col.r = texture2D(tDiffuse, uv + vec2(offset, 0.0)).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - vec2(offset, 0.0)).b;

        // Scanlines
        float scanline = 0.9 + 0.1 * sin(y * 2.0 + uTime * 20.0);
        col *= scanline;

        // Flicker
        float flicker = 0.97 + 0.03 * sin(uTime * 60.0);
        col *= flicker;

        gl_FragColor = vec4(col, 1.0);
      }
    `;