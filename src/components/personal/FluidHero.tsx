import * as React from 'react';
import styles from './personal.module.css';

// "The wave IS the ocean": the hero is a set of liquid droplets, one per person. At rest
// they float apart. Move the pointer slowly and they gather around it and merge into one
// body of water; move it fast and the body breaks apart again (technology running over
// people). A click sends a ripple through the liquid and shows one of `phrases` for a
// moment, its letters splashing out of the nearest drop; scrolling down lets the drops sink.
// The water behaves as in microgravity (after NASA's water-sphere experiments on the ISS):
// knocked drops ring through oval and pear shapes before settling, small droplets pinch off
// and drift away in straight lines until they touch a drop and merge back, and each drop
// works as a lens, showing the scene behind it flipped, with a thick dark rim. Droplet
// physics run in JavaScript and the liquid is raymarched as a smooth union of spheres.

const MAX_DROPS = 22;
const MAX_SPRAY = 18;
const MAX_SPHERES = MAX_DROPS + MAX_SPRAY;
const FOCAL = 1.6;
const DIST = 9;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uDrops[${MAX_SPHERES}];
uniform vec4 uFlow[${MAX_SPHERES}];
uniform vec4 uShape[${MAX_SPHERES}];
uniform int uCount;
uniform float uBlend;
uniform vec4 uBound;
uniform vec4 uClick;
uniform float uCohesion;

const float FOCAL = ${FOCAL.toFixed(2)};
const float DIST = ${DIST.toFixed(2)};

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

// Smooth union: the larger k, the more neighbouring drops melt into each other.
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

float liquid(vec3 p) {
    float d = 1e3;
    for (int i = 0; i < ${MAX_SPHERES}; i++) {
        if (i >= uCount) break;
        vec4 drop = uDrops[i];
        vec4 flow = uFlow[i];
        vec4 shape = uShape[i];
        vec3 q = p - drop.xyz;
        // Fast drops stretch a little along their velocity, keeping roughly the same volume.
        float speed = length(flow.xyz);
        if (speed > 0.001) {
            vec3 dir = flow.xyz / speed;
            float s = 1.0 + min(speed * 0.15, 0.45);
            float along = dot(q, dir);
            vec3 across = q - dir * along;
            q = dir * along / (along < 0.0 ? s * 1.2 : s) + across * sqrt(s);
        }
        float len = length(q);
        vec3 n = q / max(len, 1e-4);
        // Oscillation modes of a free-floating drop, along shape.xy: the 2nd mode squashes it
        // into an oval and back, the 3rd swells one end into a pear shape.
        float c = dot(n, vec3(shape.xy, 0.0));
        float p2 = 0.5 * (3.0 * c * c - 1.0);
        float p3 = 0.5 * (5.0 * c * c * c - 3.0 * c);
        // And a small ripple of its own.
        float wobble = sin(n.x * 5.0 + uTime * 2.1 + flow.w) * sin(n.y * 4.0 - uTime * 1.7 + flow.w * 1.3) * sin(n.z * 4.5 + uTime * 1.3 + flow.w * 0.7);
        d = smin(d, len - drop.w * (1.0 + shape.z * p2 + shape.w * p3 + 0.06 * wobble), uBlend);
    }
    // Irregular, slowly drifting bumps make the surface organic rather than geometric,
    // with a finer tremble on top; both grow when the drops are together.
    d += (noise(p * 1.8 + vec3(0.0, uTime * 0.35, uTime * 0.2)) - 0.5) * (0.08 + 0.06 * uCohesion);
    d += sin(p.x * 4.0 + uTime * 1.3) * sin(p.y * 3.5 - uTime * 1.1) * sin(p.z * 4.0 + uTime * 0.9) * (0.01 + 0.02 * uCohesion);
    // The ripple from the last click, spreading out from where it landed.
    if (uClick.w < 4.0) {
        float r = length(p - uClick.xyz);
        d += sin(r * 9.0 - uClick.w * 9.0) * 0.045 * exp(-uClick.w * 1.3) * exp(-r * 0.35);
    }
    return d;
}

vec3 normalAt(vec3 p) {
    const vec2 e = vec2(0.002, -0.002);
    return normalize(e.xyy * liquid(p + e.xyy) + e.yyx * liquid(p + e.yyx) + e.yxy * liquid(p + e.yxy) + e.xxx * liquid(p + e.xxx));
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

vec3 backdrop(vec2 p, vec2 pool, float lineStrength) {
    vec3 c = vec3(0.027, 0.027, 0.035);
    vec2 d = p - pool;
    float glow = exp(-dot(d, d) * 2.2);
    c += mix(vec3(0.3, 0.25, 0.9), vec3(0.2, 0.6, 1.0), uCohesion) * glow * 0.16;
    // Fine diagonal hairlines; they bend visibly through the liquid.
    float lines = smoothstep(0.93, 1.0, abs(sin((p.x * 0.6 + p.y) * 42.0)));
    c += lines * 0.06 * glow * lineStrength;
    return c;
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ro = vec3(0.0, 0.0, DIST);
    vec3 rd = normalize(vec3(p, -FOCAL));
    vec2 pool = uBound.xy * FOCAL / (DIST - uBound.z);
    vec3 col = backdrop(p, pool, 1.0);

    // Only march inside the sphere that bounds all the drops.
    vec3 oc = ro - uBound.xyz;
    float b = dot(oc, rd);
    float h = b * b - dot(oc, oc) + uBound.w * uBound.w;
    if (h > 0.0) {
        float t = max(-b - sqrt(h), 0.0);
        float tEnd = -b + sqrt(h);
        bool hit = false;
        for (int i = 0; i < 96; i++) {
            float d = liquid(ro + rd * t);
            if (d < 0.0015 * t) { hit = true; break; }
            t += d * 0.6;
            if (t > tEnd) break;
        }
        if (hit) {
            vec3 pos = ro + rd * t;
            vec3 nor = normalAt(pos);
            float ndv = clamp(dot(nor, -rd), 0.0, 1.0);
            float fres = pow(1.0 - ndv, 4.0);
            vec3 L = normalize(vec3(-0.4, 0.85, 0.6));
            vec3 H = normalize(L - rd);
            vec3 refl = reflect(rd, nor);
            vec3 rr = refract(rd, nor, 0.75);

            float caustic = pow(noise(pos * 2.5 + uTime * 0.5), 4.0);
            vec3 tint = mix(vec3(0.2, 0.55, 1.0), vec3(0.6, 0.35, 1.0), 0.5 + 0.5 * nor.y);
            // A ball of water is a lens: the view through it is magnified and flipped.
            // (The hairlines are softened here: magnified, they would read as contour lines.)
            vec3 liquidCol = backdrop(p - rr.xy * 1.1, pool, 0.35) * vec3(0.85, 1.0, 1.15) * 1.25 + env(-rr) * 0.18;
            liquidCol += tint * (0.04 + caustic * 0.4);
            // Light bends away near the edge, so a thick dark rim runs all around the drop,
            // with a thin bright line just inside it.
            float edge = 1.0 - ndv;
            liquidCol *= 1.0 - 0.85 * smoothstep(0.45, 0.85, edge);
            liquidCol += vec3(0.75, 0.85, 1.0) * smoothstep(0.3, 0.42, edge) * smoothstep(0.52, 0.42, edge) * 0.35;
            // A thin-film sheen at grazing angles, like light on a soap bubble.
            vec3 film = 0.5 + 0.5 * cos(6.2831 * (fres * 1.3 + ndv * 0.5 + vec3(0.0, 0.33, 0.67)));
            liquidCol = mix(liquidCol, env(refl), 0.08 + 0.9 * fres) + film * fres * 0.3;
            liquidCol += pow(max(dot(nor, H), 0.0), 220.0) * 2.6;
            col = liquidCol / (1.0 + liquidCol * 0.3);
        }
    }

    vec2 uv = gl_FragCoord.xy / uRes;
    col *= 1.0 - 0.35 * dot(p * 0.9, p * 0.9);
    col = mix(vec3(0.027, 0.027, 0.035), col, smoothstep(0.0, 0.2, uv.y));
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

// Deterministic pseudo-random numbers, so every visit starts with the same arrangement.
function seeded(seed: number) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

type Drop = {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    r: number;
    // Resting place, relative to the centre of the cloud.
    hx: number;
    hy: number;
    hz: number;
    // Place in the gathered body, relative to the pointer.
    gx: number;
    gy: number;
    gz: number;
    phase: number;
    // 1 right after a phrase splashed out of this drop, fading to 0.
    pulse: number;
    // Shape oscillation: axis (ax, ay) and the amplitudes and velocities of the
    // oval (a2) and pear (a3) modes.
    ax: number;
    ay: number;
    a2: number;
    v2: number;
    a3: number;
    v3: number;
};

// Natural frequencies (rad/s) and damping of the two shape modes; light damping lets a drop
// ring for a few seconds, like the drops in the NASA footage.
const MODE2 = { omega: 6.5, damping: 0.7 };
const MODE3 = { omega: 11, damping: 1.1 };

// Knock a drop's shape along (dx, dy): s2 and s3 set how hard each mode is struck.
function kick(d: Drop, dx: number, dy: number, s2: number, s3: number) {
    const len = Math.hypot(dx, dy);
    if (len > 1e-4) {
        // Turn the axis towards the new direction, more so if the drop is barely moving.
        const w = 1 / (1 + Math.abs(d.a2) * 6);
        d.ax += (dx / len - d.ax) * w;
        d.ay += (dy / len - d.ay) * w;
        const n = Math.hypot(d.ax, d.ay) || 1;
        d.ax /= n;
        d.ay /= n;
    }
    d.v2 += s2 * MODE2.omega;
    d.v3 += s3 * MODE3.omega;
}

type Spray = {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    r: number;
    age: number;
    life: number;
    phase: number;
};

export default function FluidHero({ phrases }: { phrases: string[] }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const phraseRef = React.useRef<HTMLSpanElement>(null);
    const [fallback, setFallback] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const phraseEl = phraseRef.current;
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
        const uDrops = u('uDrops');
        const uFlow = u('uFlow');
        const uShape = u('uShape');
        const uCount = u('uCount');
        const uBlend = u('uBlend');
        const uBound = u('uBound');
        const uClick = u('uClick');
        const uCohesion = u('uCohesion');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const narrow = window.innerWidth < 720;
        const count = narrow ? 14 : MAX_DROPS;
        // Raymarching is expensive: render below native resolution and lower it further if frames run slow.
        let scale = Math.min(window.devicePixelRatio || 1, 1.5) * (narrow ? 0.5 : 0.6);

        // Screen space (x in [-aspect/2, aspect/2], y in [-0.5, 0.5]) ↔ the plane z = 0 in the scene.
        const toWorld = DIST / FOCAL;
        const cloud = { x: 0, y: 0, spread: 1 };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.round(rect.width * scale));
            canvas.height = Math.max(1, Math.round(rect.height * scale));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            const aspect = rect.width / rect.height;
            // Desktop: the drops rest to the upper right of the headline. Narrow screens: above it.
            cloud.x = (aspect > 1 ? aspect * 0.2 : 0) * toWorld;
            cloud.y = (aspect > 1 ? 0.1 : 0.2) * toWorld;
            cloud.spread = aspect > 1 ? 1 : 0.62;
        };
        resize();

        const random = seeded(7);
        const drops: Drop[] = Array.from({ length: count }, () => {
            const angle = random() * Math.PI * 2;
            const radius = Math.sqrt(random());
            const ga = random() * Math.PI * 2;
            const gb = Math.acos(random() * 2 - 1);
            const gd = 0.25 + random() * 0.45;
            return {
                x: 0,
                y: 0,
                z: 0,
                vx: 0,
                vy: 0,
                vz: 0,
                r: 0.18 + random() * 0.26,
                hx: Math.cos(angle) * radius * 2.0,
                hy: Math.sin(angle) * radius * 1.35,
                hz: (random() - 0.5) * 1.4,
                gx: Math.sin(gb) * Math.cos(ga) * gd,
                gy: Math.sin(gb) * Math.sin(ga) * gd,
                gz: Math.cos(gb) * gd * 0.6,
                phase: random() * Math.PI * 2,
                pulse: 0,
                ax: 1,
                ay: 0,
                a2: 0,
                v2: 0,
                a3: 0,
                v3: 0
            };
        });
        // Start at rest; with reduced motion, start (and stay) gathered as one body of water.
        for (const d of drops) {
            d.x = cloud.x + (reduceMotion ? d.gx : d.hx) * cloud.spread;
            d.y = cloud.y + (reduceMotion ? d.gy : d.hy) * cloud.spread;
            d.z = reduceMotion ? d.gz : d.hz;
        }

        // Resizing clears the canvas, so draw again (needed when motion is reduced and the loop is idle).
        const onResize = () => {
            resize();
            run();
        };
        window.addEventListener('resize', onResize);

        const pointer = { x: 0, y: 0, active: false, lastMove: -Infinity };
        const setPointer = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            if (clientY < rect.top || clientY > rect.bottom) return;
            pointer.x = ((clientX - rect.left - rect.width / 2) / rect.height) * toWorld;
            pointer.y = ((rect.height / 2 - (clientY - rect.top)) / rect.height) * toWorld;
            pointer.lastMove = performance.now();
            pointer.active = true;
        };
        const onPointer = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
        // On touch screens the page scrolls under the finger, so follow touches directly.
        const onTouch = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (touch) setPointer(touch.clientX, touch.clientY);
        };
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('touchstart', onTouch, { passive: true });
        window.addEventListener('touchmove', onTouch, { passive: true });

        // Small spray droplets thrown off when the water breaks apart or is clicked.
        const spray: Spray[] = [];
        const emit = (x: number, y: number, z: number, vx: number, vy: number, vz: number) => {
            if (spray.length >= MAX_SPRAY || reduceMotion) return;
            spray.push({ x, y, z, vx, vy, vz, r: (0.035 + Math.random() * 0.07) * cloud.spread, age: 0, life: 3 + Math.random() * 3, phase: Math.random() * 6.28 });
        };

        // A click (or tap) sends a ripple out from the pointer, and the next phrase splashes out of
        // the nearest drop letter by letter, then drips away.
        const click = { x: 0, y: 0, z: 0, at: -Infinity };
        let phraseIndex = 0;
        let phraseTimer = 0;
        const toScreen = (d: Drop, rect: DOMRect) => {
            const k = FOCAL / (DIST - d.z);
            return { x: rect.width / 2 + d.x * k * rect.height, y: rect.height / 2 - d.y * k * rect.height };
        };
        const showPhrase = (clientX: number, clientY: number) => {
            if (!phraseEl || phrases.length === 0) return;
            const rect = canvas.getBoundingClientRect();
            const clickX = clientX - rect.left;
            const clickY = clientY - rect.top;
            let source = drops[0];
            let best = Infinity;
            for (const d of drops) {
                const pos = toScreen(d, rect);
                const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
                if (dist < best) {
                    best = dist;
                    source = d;
                }
            }
            source.pulse = 1;
            // Struck like the drops hit by a puff of air: it rings through oval and pear shapes,
            // and a few small droplets pinch off its far side and drift away.
            const hitX = source.x - pointer.x;
            const hitY = source.y - pointer.y;
            const hitLen = Math.hypot(hitX, hitY) || 1;
            kick(source, hitX, hitY, 0.32, 0.26);
            for (let i = 0; i < 5; i++) {
                const a = Math.atan2(hitY, hitX) + (Math.random() - 0.5) * 1.2;
                const v = 0.6 + Math.random() * 1.1;
                emit(source.x + (hitX / hitLen) * source.r, source.y + (hitY / hitLen) * source.r, source.z, Math.cos(a) * v, Math.sin(a) * v, (Math.random() - 0.5) * 0.4);
            }
            const from = toScreen(source, rect);

            window.clearTimeout(phraseTimer);
            phraseEl.className = styles.heroPhrase;
            phraseEl.replaceChildren();
            const letters = Array.from(phrases[phraseIndex % phrases.length]).map((ch) => {
                const span = document.createElement('span');
                span.className = styles.heroLetter;
                span.textContent = ch === ' ' ? '\u00a0' : ch;
                phraseEl.appendChild(span);
                return span;
            });
            phraseIndex++;
            // Centre the line above the click, kept inside the hero.
            const half = phraseEl.offsetWidth / 2 + 16;
            phraseEl.style.left = `${Math.min(Math.max(clickX, half), rect.width - half)}px`;
            phraseEl.style.top = `${Math.max(clickY - 70, 90)}px`;
            // Each letter starts inside the drop and flies to its place in the line.
            letters.forEach((span, i) => {
                const box = span.getBoundingClientRect();
                span.style.setProperty('--dx', `${from.x - (box.left + box.width / 2 - rect.left)}px`);
                span.style.setProperty('--dy', `${from.y - (box.top + box.height / 2 - rect.top)}px`);
                span.style.setProperty('--spin', `${(Math.random() - 0.5) * 90}deg`);
                span.style.setProperty('--delay', `${i * 26}ms`);
            });
            requestAnimationFrame(() => phraseEl.classList.add(styles.heroPhraseOn));
            phraseTimer = window.setTimeout(() => phraseEl.classList.add(styles.heroPhraseOut), 2800 + letters.length * 26);
        };
        const onClick = (e: PointerEvent) => {
            setPointer(e.clientX, e.clientY);
            click.x = pointer.x;
            click.y = pointer.y;
            click.z = 0;
            click.at = performance.now();
            for (const d of drops) {
                const dx = d.x - click.x;
                const dy = d.y - click.y;
                const dist = Math.hypot(dx, dy) || 1;
                const push = Math.max(0, 1 - dist / 3) * 2.2;
                d.vx += (dx / dist) * push;
                d.vy += (dy / dist) * push;
            }
            showPhrase(e.clientX, e.clientY);
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

        const dropData = new Float32Array(MAX_SPHERES * 4);
        const flowData = new Float32Array(MAX_SPHERES * 4);
        const shapeData = new Float32Array(MAX_SPHERES * 4);
        const smooth = { x: 0, y: 0 };
        let cohesion = reduceMotion ? 1 : 0;
        let scatteredUntil = -Infinity;
        let last = performance.now();
        let time = 0;
        let slowFrames = 0;

        function frame(now: number) {
            // The first frame can be timestamped just before "last"; never step backwards.
            const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
            last = now;
            time += dt;

            if (dt > 0.03 && scale > 0.3) slowFrames++;
            else slowFrames = Math.max(0, slowFrames - 1);
            if (slowFrames > 30) {
                slowFrames = 0;
                scale *= 0.8;
                resize();
            }

            // Pointer speed decides between gathering (slow) and scattering (fast).
            const px = smooth.x;
            const py = smooth.y;
            smooth.x += (pointer.x - smooth.x) * Math.min(dt * 10, 1);
            smooth.y += (pointer.y - smooth.y) * Math.min(dt * 10, 1);
            const pvx = dt > 0 ? (smooth.x - px) / dt : 0;
            const pvy = dt > 0 ? (smooth.y - py) / dt : 0;
            const speed = Math.hypot(pvx, pvy);
            const recent = pointer.active && now - pointer.lastMove < 2500;
            // A fast move breaks the body apart, and the drops stay apart for a moment before regrouping.
            if (speed > 5) scatteredUntil = now + 1400;
            const want = reduceMotion ? 1 : recent && now > scatteredUntil ? 1 : 0;
            // Cohesion drops over a few tenths of a second, so the body stretches before it tears.
            cohesion += (want - cohesion) * Math.min(dt * (want > cohesion ? 1.2 : 3), 1);
            const scattered = now < scatteredUntil;

            if (speed > 5) {
                const sweep = Math.min(speed, 40);
                for (const d of drops) {
                    const dx = d.x - smooth.x;
                    const dy = d.y - smooth.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    const reach = Math.max(0, 1 - dist / 3.5);
                    if (reach === 0) continue;
                    // The pointer drags the water along its path, parts it sideways a little and
                    // sets every drop it passes ringing.
                    const scale = Math.min(1, 40 / speed);
                    kick(d, pvx, pvy, reach * dt * 2.2, (Math.random() < 0.5 ? -1 : 1) * reach * dt * 1.6);
                    d.vx += (pvx * scale * 0.06 + (dx / dist) * sweep * 0.035) * reach * 9 * dt;
                    d.vy += (pvy * scale * 0.06 + (dy / dist) * sweep * 0.035) * reach * 9 * dt;
                    d.vz += (Math.random() - 0.5) * reach * 4 * dt;
                    // Torn water sheds small droplets from its surface.
                    if (Math.random() < reach * 0.2) {
                        const ox = dx / dist;
                        const oy = dy / dist;
                        emit(
                            d.x + ox * d.r,
                            d.y + oy * d.r,
                            d.z,
                            d.vx + ox * (0.5 + Math.random() * 1.2) + pvx * scale * 0.04,
                            d.vy + oy * (0.5 + Math.random() * 1.2) + pvy * scale * 0.04,
                            (Math.random() - 0.5) * 0.8
                        );
                    }
                }
            }

            // Scrolling past the hero lets the drops sink.
            const sink = Math.min(Math.max(window.scrollY / Math.max(window.innerHeight, 1), 0), 1);
            const gatherX = recent ? smooth.x : cloud.x;
            const gatherY = recent ? smooth.y : cloud.y;

            let minX = Infinity;
            let minY = Infinity;
            let minZ = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            let maxZ = -Infinity;
            drops.forEach((d, i) => {
                // At rest the drops wander on slow, overlapping currents, so their paths cross.
                const floatX = Math.sin(time * 0.21 + d.phase) * 0.55 + Math.sin(time * 0.47 + d.phase * 2.3 + d.hy) * 0.25;
                const floatY = Math.cos(time * 0.18 + d.phase * 1.7) * 0.45 + Math.sin(time * 0.39 + d.hx) * 0.2;
                const restX = cloud.x + d.hx * cloud.spread + floatX;
                const restY = cloud.y + d.hy * cloud.spread + floatY;
                const tx = restX + (gatherX + d.gx * cloud.spread - restX) * cohesion;
                const ty = restY + (gatherY + d.gy * cloud.spread - restY) * cohesion - sink * 3.5;
                const tz = d.hz + (d.gz - d.hz) * cohesion;
                // Looser springs at rest, so the drops lag, overshoot and stretch. Just after
                // breaking apart the springs almost let go, so the pieces drift on their own
                // momentum, weightless, before the currents bring them back.
                const k = (2.2 + 2.8 * cohesion) * (scattered ? 0.2 : 1);
                const damping = (1.8 + 1.4 * cohesion) * (scattered ? 0.3 : 1);
                d.vx += ((tx - d.x) * k - d.vx * damping) * dt;
                d.vy += ((ty - d.y) * k - d.vy * damping) * dt;
                d.vz += ((tz - d.z) * k - d.vz * damping) * dt;
                d.x += d.vx * dt;
                d.y += d.vy * dt;
                d.z += d.vz * dt;
                dropData[i * 4] = d.x;
                dropData[i * 4 + 1] = d.y;
                dropData[i * 4 + 2] = d.z;
                d.pulse *= Math.exp(-dt * 2.5);
                // Shape modes as damped oscillators, with the odd small knock to keep drops alive.
                if (!reduceMotion && Math.random() < dt * 0.12) kick(d, Math.random() - 0.5, Math.random() - 0.5, 0.06, 0.04);
                d.v2 += (-MODE2.omega * MODE2.omega * d.a2 - 2 * MODE2.damping * d.v2) * dt;
                d.v3 += (-MODE3.omega * MODE3.omega * d.a3 - 2 * MODE3.damping * d.v3) * dt;
                d.a2 = Math.min(0.55, Math.max(-0.4, d.a2 + d.v2 * dt));
                d.a3 = Math.min(0.35, Math.max(-0.35, d.a3 + d.v3 * dt));
                shapeData[i * 4] = d.ax;
                shapeData[i * 4 + 1] = d.ay;
                shapeData[i * 4 + 2] = d.a2;
                shapeData[i * 4 + 3] = d.a3;
                dropData[i * 4 + 3] = d.r * cloud.spread * (1 + 0.15 * cohesion) * (1 - 0.35 * d.pulse);
                flowData[i * 4] = d.vx;
                flowData[i * 4 + 1] = d.vy;
                flowData[i * 4 + 2] = d.vz;
                flowData[i * 4 + 3] = d.phase;
                minX = Math.min(minX, d.x - d.r);
                minY = Math.min(minY, d.y - d.r);
                minZ = Math.min(minZ, d.z - d.r);
                maxX = Math.max(maxX, d.x + d.r);
                maxY = Math.max(maxY, d.y + d.r);
                maxZ = Math.max(maxZ, d.z + d.r);
            });
            // Spray: weightless droplets drifting in straight lines and slowing a little; one
            // that touches a drop merges back into it.
            for (let j = spray.length - 1; j >= 0; j--) {
                const p = spray[j];
                p.age += dt;
                const drag = Math.exp(-0.35 * dt);
                p.vx *= drag;
                p.vy *= drag;
                p.vz *= drag;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.z += p.vz * dt;
                const absorbed = p.age > 0.6 && drops.some((d) => Math.hypot(d.x - p.x, d.y - p.y, d.z - p.z) < d.r * cloud.spread);
                if (absorbed || p.age > p.life) spray.splice(j, 1);
            }
            spray.forEach((p, j) => {
                const i = count + j;
                const fade = Math.min(1, (p.life - p.age) / 0.3);
                dropData[i * 4] = p.x;
                dropData[i * 4 + 1] = p.y;
                dropData[i * 4 + 2] = p.z;
                dropData[i * 4 + 3] = p.r * fade;
                flowData[i * 4] = p.vx;
                flowData[i * 4 + 1] = p.vy;
                flowData[i * 4 + 2] = p.vz;
                flowData[i * 4 + 3] = p.phase;
                shapeData[i * 4] = 1;
                shapeData[i * 4 + 1] = 0;
                shapeData[i * 4 + 2] = 0;
                shapeData[i * 4 + 3] = 0;
                minX = Math.min(minX, p.x - p.r);
                minY = Math.min(minY, p.y - p.r);
                minZ = Math.min(minZ, p.z - p.r);
                maxX = Math.max(maxX, p.x + p.r);
                maxY = Math.max(maxY, p.y + p.r);
                maxZ = Math.max(maxZ, p.z + p.r);
            });

            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            const cz = (minZ + maxZ) / 2;
            const boundRadius = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2 + 0.4;

            const clickAge = (now - click.at) / 1000;
            gl.uniform1f(uTime, time);
            gl.uniform4fv(uDrops, dropData);
            gl.uniform4fv(uFlow, flowData);
            gl.uniform4fv(uShape, shapeData);
            gl.uniform1i(uCount, count + spray.length);
            // Even apart, drops that pass close to each other briefly neck and merge.
            gl.uniform1f(uBlend, 0.22 + 0.4 * cohesion);
            gl.uniform4f(uBound, cx, cy, cz, boundRadius);
            gl.uniform4f(uClick, click.x, click.y, click.z, clickAge < 4 ? clickAge : 10);
            gl.uniform1f(uCohesion, cohesion);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
            else running = false;
        }
        run();

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(phraseTimer);
            observer.disconnect();
            window.removeEventListener('resize', onResize);
            window.removeEventListener('pointermove', onPointer);
            window.removeEventListener('touchstart', onTouch);
            window.removeEventListener('touchmove', onTouch);
            canvas.removeEventListener('pointerdown', onClick);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [phrases]);

    return (
        <>
            <canvas ref={canvasRef} className={fallback ? `${styles.heroCanvas} ${styles.heroFallback}` : styles.heroCanvas} aria-hidden="true" />
            <span ref={phraseRef} className={styles.heroPhrase} aria-hidden="true" />
        </>
    );
}
