import * as React from 'react';
import styles from './personal.module.css';

// A raymarched liquid object for the hero. It cycles through three materials:
// spiky black latex (ferrofluid spikes that stand up towards the cursor),
// pink and shock-green plush, and clear water. The blob leans and reaches for
// the pointer, fast movement excites it, and a click skips to the next form.

const HOLD = 5;
const MORPH = 2.2;
const SEGMENT = HOLD + MORPH;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uRot;
uniform vec3 uW;
uniform float uEnergy;
uniform vec2 uCenter;
uniform float uDist;

mat3 R;
vec3 mDir;

float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
    vec3 i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

float shape(vec3 p) {
    vec3 q = R * p;
    float len = length(q);
    vec3 n = q / max(len, 1e-4);
    float reach = exp((dot(n, mDir) - 1.0) * 3.0);

    // Latex: ferrofluid spikes, longest on the side facing the cursor.
    vec3 s = n * 6.2 + 0.55 * vec3(noise(n * 2.0 + uTime * 0.35), noise(n * 2.0 + 7.1 - uTime * 0.3), noise(n * 2.0 + 3.3 + uTime * 0.25));
    float spikes = pow(abs(sin(s.x) * sin(s.y) * sin(s.z)), 3.2);
    float latex = spikes * (0.22 + 0.5 * reach + 0.25 * uEnergy);

    // Plush: big soft lumps with a fuzzy, fibrous surface.
    float plush = (noise(q * 1.7 + uTime * 0.22) - 0.5) * 0.5 + (noise(q * 36.0) - 0.5) * 0.03 + 0.05;

    // Water: a wobbling drop with ripples running out from the cursor side.
    float water = sin(n.x * 4.0 + uTime * 1.5) * sin(n.y * 3.5 - uTime * 1.2) * sin(n.z * 3.0 + uTime) * 0.1
                + sin(dot(n, mDir) * 16.0 - uTime * 5.0) * 0.014 * (1.0 + 3.0 * uEnergy);

    float r = 1.0 + 0.03 * sin(uTime * 1.3) + reach * (0.12 + 0.12 * uEnergy);
    return len - r - uW.x * latex - uW.y * plush - uW.z * water;
}

vec3 normalAt(vec3 p) {
    const vec2 e = vec2(0.0015, -0.0015);
    return normalize(e.xyy * shape(p + e.xyy) + e.yyx * shape(p + e.yyx) + e.yxy * shape(p + e.yxy) + e.xxx * shape(p + e.xxx));
}

// Studio lighting: a white softbox above, pink on the right, green on the left.
vec3 env(vec3 d) {
    vec3 c = vec3(0.015, 0.015, 0.025);
    c += vec3(1.0) * smoothstep(0.5, 0.9, d.y) * smoothstep(0.95, 0.2, abs(d.x)) * 1.5;
    c += vec3(1.0, 0.3, 0.7) * smoothstep(0.55, 0.95, d.x) * smoothstep(0.7, 0.0, abs(d.y)) * 1.1;
    c += vec3(0.3, 1.0, 0.25) * smoothstep(0.6, 0.95, -d.x) * smoothstep(0.6, 0.0, abs(d.y - 0.15)) * 0.8;
    c += vec3(0.3, 0.2, 0.6) * smoothstep(0.0, -0.9, d.y) * 0.25;
    return c;
}

vec3 backdrop(vec2 p) {
    vec3 c = vec3(0.027, 0.027, 0.035);
    vec3 tint = uW.x * vec3(0.4, 0.25, 1.0) + uW.y * vec3(1.0, 0.25, 0.65) + uW.z * vec3(0.2, 0.65, 1.0);
    vec2 d = p - uCenter;
    float pool = exp(-dot(d, d) * 2.5);
    c += tint * pool * 0.16;
    // Fine diagonal hairlines; they bend visibly through the water.
    float lines = smoothstep(0.93, 1.0, abs(sin((p.x * 0.6 + p.y) * 42.0)));
    c += lines * 0.06 * pool;
    return c;
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 col = backdrop(p);

    float cy = cos(uRot.x), sy = sin(uRot.x), cx = cos(uRot.y), sx = sin(uRot.y);
    R = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);
    mDir = normalize(R * vec3((uMouse - uCenter) * 3.0, 0.8));

    vec3 ro = vec3(0.0, 0.0, uDist);
    vec3 rd = normalize(vec3(p - uCenter, -1.6));

    // Only march inside the bounding sphere.
    float b = dot(ro, rd);
    float h = b * b - dot(ro, ro) + 2.2 * 2.2;
    if (h > 0.0) {
        float t = -b - sqrt(h);
        float tEnd = -b + sqrt(h);
        float stepScale = mix(0.65, 0.22, uW.x);
        float minD = 1e3;
        bool hit = false;
        for (int i = 0; i < 140; i++) {
            float d = shape(ro + rd * t);
            minD = min(minD, d);
            if (d < 0.001 * t) { hit = true; break; }
            t += d * stepScale;
            if (t > tEnd) break;
        }

        vec3 fur = mix(vec3(1.0, 0.2, 0.62), vec3(0.32, 1.0, 0.1), smoothstep(0.42, 0.58, noise(R * (ro + rd * t) * 1.5 + vec3(0.0, 0.0, uTime * 0.15))));

        if (hit) {
            vec3 pos = ro + rd * t;
            vec3 nor = normalAt(pos);
            vec3 q = R * pos;
            float ndv = clamp(dot(nor, -rd), 0.0, 1.0);
            float fres = pow(1.0 - ndv, 5.0);
            vec3 L = normalize(vec3(-0.4, 0.85, 0.6));
            vec3 H = normalize(L - rd);
            vec3 refl = reflect(rd, nor);

            vec3 latex = vec3(0.012, 0.01, 0.02) * (0.3 + max(dot(nor, L), 0.0));
            latex += env(refl) * (0.1 + 0.9 * fres);
            latex += mix(vec3(1.0, 0.3, 0.7), vec3(0.4, 0.3, 1.0), 0.5 + 0.5 * nor.y) * pow(1.0 - ndv, 3.0) * 0.35;
            latex += pow(max(dot(nor, H), 0.0), 160.0) * 2.2;

            float fibre = noise(q * 70.0) * noise(q * 21.0 + 3.0);
            float wrap = clamp((dot(nor, L) + 0.6) / 1.6, 0.0, 1.0);
            vec3 plush = fur * (0.22 + 0.78 * wrap) * (0.5 + 0.75 * fibre);
            plush += mix(fur, vec3(1.0), 0.45) * pow(1.0 - ndv, 2.5) * 0.85;

            vec3 rr = refract(rd, nor, 0.75);
            float caustic = pow(noise(q * 3.0 + uTime * 0.6), 4.0);
            vec3 water = backdrop(p + rr.xy * 0.4) * vec3(0.8, 1.0, 1.15) + env(rr) * 0.12;
            water += vec3(0.3, 0.75, 1.0) * (0.05 + caustic * 0.6);
            water = mix(water, env(refl), 0.08 + 0.92 * fres);
            water += pow(max(dot(nor, H), 0.0), 240.0) * 2.8;

            vec3 obj = uW.x * latex + uW.y * plush + uW.z * water;
            col = obj / (1.0 + obj * 0.3);
        } else {
            // Stray fibres around the plush silhouette.
            float halo = smoothstep(0.07, 0.0, minD) * noise(rd * 260.0);
            col += fur * halo * uW.y * 0.7;
        }
    }

    vec2 uv = gl_FragCoord.xy / uRes;
    col *= 1.0 - 0.35 * dot(p * 0.9, p * 0.9);
    col = mix(vec3(0.027, 0.027, 0.035), col, smoothstep(0.0, 0.25, uv.y));
    col += (hash(vec3(gl_FragCoord.xy, uTime)) - 0.5) * 0.02;
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

const smoothstep = (a: number, b: number, x: number) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};

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

        const u = (name: string) => gl.getUniformLocation(program, name);
        const uRes = u('uRes');
        const uTime = u('uTime');
        const uMouse = u('uMouse');
        const uRot = u('uRot');
        const uW = u('uW');
        const uEnergy = u('uEnergy');
        const uCenter = u('uCenter');
        const uDist = u('uDist');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Raymarching is expensive: render below native resolution and lower it further if frames run slow.
        let scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
        const center = { x: 0, y: 0 };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.round(rect.width * scale));
            canvas.height = Math.max(1, Math.round(rect.height * scale));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            const aspect = rect.width / rect.height;
            // Desktop: upper right, beside the headline. Narrow screens: centred above it.
            center.x = aspect > 1 ? aspect * 0.2 : 0;
            center.y = aspect > 1 ? 0.12 : 0.2;
            gl.uniform2f(uCenter, center.x, center.y);
            gl.uniform1f(uDist, aspect > 1 ? 6.3 : 11);
        };
        resize();
        // Resizing clears the canvas, so draw again (needed when motion is reduced and the loop is idle).
        const onResize = () => {
            resize();
            run();
        };
        window.addEventListener('resize', onResize);

        // Pointer in shader space: x in [-aspect/2, aspect/2], y in [-0.5, 0.5].
        const target = { x: 0, y: 0 };
        const smooth = { x: 0, y: 0 };
        let energy = 0;
        let lastMove = -Infinity;
        const onPointer = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            target.x = (e.clientX - rect.left - rect.width / 2) / rect.height;
            target.y = (rect.height / 2 - (e.clientY - rect.top)) / rect.height;
            lastMove = performance.now();
        };
        window.addEventListener('pointermove', onPointer, { passive: true });

        // The material clock: hold each form, then morph into the next. A click jumps to the next morph.
        let clock = 0;
        const onClick = () => {
            const into = clock % SEGMENT;
            if (into < HOLD) clock += HOLD - into;
            energy = 1;
        };
        canvas.addEventListener('pointerdown', onClick);

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

        let last = performance.now();
        let time = 0;
        let slowFrames = 0;
        function frame(now: number) {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            time += dt;
            if (!reduceMotion) clock += dt;

            if (dt > 0.028 && scale > 0.3) slowFrames++;
            else slowFrames = Math.max(0, slowFrames - 1);
            if (slowFrames > 30) {
                slowFrames = 0;
                scale *= 0.8;
                resize();
            }

            // When the pointer rests, drift slowly around the object so it keeps moving.
            if (now - lastMove > 3000) {
                target.x = center.x + Math.sin(time * 0.4) * 0.35;
                target.y = center.y + Math.sin(time * 0.55) * 0.25;
            }
            const px = smooth.x;
            const py = smooth.y;
            smooth.x += (target.x - smooth.x) * 0.08;
            smooth.y += (target.y - smooth.y) * 0.08;
            const speed = Math.hypot(smooth.x - px, smooth.y - py) / Math.max(dt, 0.001);
            energy += (Math.min(speed * 0.5, 1) - energy) * (speed * 0.5 > energy ? 0.25 : 0.04);

            const segment = Math.floor(clock / SEGMENT);
            const morph = smoothstep(HOLD, SEGMENT, clock - segment * SEGMENT);
            const weights = [0, 0, 0];
            weights[segment % 3] += 1 - morph;
            weights[(segment + 1) % 3] += morph;

            gl.uniform1f(uTime, time);
            gl.uniform2f(uMouse, smooth.x, smooth.y);
            gl.uniform2f(uRot, time * 0.15 + (smooth.x - center.x) * 1.2, -(smooth.y - center.y) * 0.9);
            gl.uniform3f(uW, weights[0], weights[1], weights[2]);
            gl.uniform1f(uEnergy, energy);
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
            canvas.removeEventListener('pointerdown', onClick);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, []);

    return <canvas ref={canvasRef} className={fallback ? `${styles.heroCanvas} ${styles.heroFallback}` : styles.heroCanvas} aria-hidden="true" />;
}
