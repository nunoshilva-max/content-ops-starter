import * as React from 'react';
import styles from './personal.module.css';

// Organic, ink-in-water background for the hero. A trail of smoothed pointer
// positions warps a domain-warped noise field in a fragment shader, so the
// surface bends and swirls behind the cursor and settles back like liquid.

const TRAIL = 24;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uTrail[${TRAIL}];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
    return v;
}

void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    // Pointer trail: each point pulls and swirls the space around it.
    vec2 warp = vec2(0.0);
    float glow = 0.0;
    for (int i = 0; i < ${TRAIL}; i++) {
        vec3 t = uTrail[i];
        vec2 d = p - t.xy;
        float w = t.z * exp(-dot(d, d) * 9.0);
        warp += vec2(-d.y, d.x) * w * 1.6 + d * w * 0.6;
        glow += w;
    }

    float time = uTime * 0.045;
    vec2 q = p * 1.35 + warp;
    vec2 a = vec2(fbm(q + time), fbm(q + vec2(5.2, 1.3) - time));
    vec2 b = vec2(fbm(q + 3.0 * a + vec2(1.7, 9.2) + time * 1.4), fbm(q + 3.0 * a + vec2(8.3, 2.8)));
    float n = fbm(q + 3.2 * b);

    vec3 ink = vec3(0.027, 0.027, 0.035);
    vec3 deep = vec3(0.10, 0.09, 0.32);
    vec3 violet = vec3(0.48, 0.24, 0.96);
    vec3 coral = vec3(1.0, 0.36, 0.30);
    vec3 lime = vec3(0.80, 1.0, 0.36);

    vec3 col = mix(ink, deep, smoothstep(0.2, 0.75, n));
    col = mix(col, violet, smoothstep(0.45, 0.95, length(a) * n) * 0.9);
    col = mix(col, coral, smoothstep(0.55, 0.95, b.x * n * 1.6) * 0.85);
    col += lime * smoothstep(0.62, 0.9, n) * clamp(glow, 0.0, 1.0) * 0.55;

    // Fine ridges, like light on a moving surface.
    float ridge = abs(sin(n * 22.0 + time * 6.0));
    col += vec3(0.9, 0.85, 1.0) * pow(1.0 - ridge, 18.0) * smoothstep(0.35, 0.8, n) * 0.18;

    // Vignette and fade to page background at the bottom.
    col *= 1.0 - 0.55 * dot(p * vec2(0.8, 1.1), p * vec2(0.8, 1.1));
    col = mix(ink, col, smoothstep(0.0, 0.3, uv.y));
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.025;
    gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

export default function FluidHero() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [fallback, setFallback] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
        if (!gl) {
            setFallback(true);
            return;
        }
        const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
        const program = gl.createProgram();
        if (!vs || !fs || !program) {
            setFallback(true);
            return;
        }
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, 'uRes');
        const uTime = gl.getUniformLocation(program, 'uTime');
        const uTrail = gl.getUniformLocation(program, 'uTrail');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Render at reduced resolution: the field is soft, and this keeps it smooth on laptops.
        const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.round(rect.width * scale));
            canvas.height = Math.max(1, Math.round(rect.height * scale));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
        };
        resize();
        // Resizing clears the canvas, so draw again (needed when motion is reduced and the loop is idle).
        const onResize = () => {
            resize();
            run();
        };
        window.addEventListener('resize', onResize);

        // Pointer in shader space: x in [-aspect/2, aspect/2], y in [-0.5, 0.5].
        const target = { x: 0.15, y: 0.05 };
        const smooth = { x: 0.15, y: 0.05 };
        let lastMove = -Infinity;
        const trail = new Float32Array(TRAIL * 3);
        for (let i = 0; i < TRAIL; i++) {
            trail[i * 3] = smooth.x;
            trail[i * 3 + 1] = smooth.y;
        }
        let head = 0;

        const onPointer = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const aspect = rect.width / rect.height;
            target.x = ((e.clientX - rect.left) / rect.width - 0.5) * aspect;
            target.y = 0.5 - (e.clientY - rect.top) / rect.height;
            lastMove = performance.now();
        };
        window.addEventListener('pointermove', onPointer, { passive: true });

        let raf = 0;
        let running = false;
        let visible = true;
        const run = () => {
            if (running) return;
            running = true;
            raf = requestAnimationFrame(frame);
        };
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !reduceMotion) run();
        });
        observer.observe(canvas);

        const start = performance.now();
        function frame(now: number) {
            const t = (now - start) / 1000;
            // When the pointer rests, drift along a slow figure-eight so the surface keeps breathing.
            if (now - lastMove > 2500) {
                const aspect = canvas.width / canvas.height;
                target.x = Math.sin(t * 0.21) * aspect * 0.3;
                target.y = Math.sin(t * 0.34) * 0.22;
            }
            const px = smooth.x;
            const py = smooth.y;
            smooth.x += (target.x - smooth.x) * 0.09;
            smooth.y += (target.y - smooth.y) * 0.09;
            const speed = Math.hypot(smooth.x - px, smooth.y - py);

            for (let i = 0; i < TRAIL; i++) trail[i * 3 + 2] *= 0.955;
            head = (head + 1) % TRAIL;
            trail[head * 3] = smooth.x;
            trail[head * 3 + 1] = smooth.y;
            trail[head * 3 + 2] = Math.min(0.12 + speed * 14, 0.9);

            gl.uniform1f(uTime, reduceMotion ? 12 : t + 12);
            gl.uniform3fv(uTrail, trail);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
            else running = false;
        }
        run();

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            window.removeEventListener('resize', onResize);
            window.removeEventListener('pointermove', onPointer);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, []);

    return <canvas ref={canvasRef} className={fallback ? `${styles.heroCanvas} ${styles.heroFallback}` : styles.heroCanvas} aria-hidden="true" />;
}
