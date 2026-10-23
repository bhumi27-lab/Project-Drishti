// GLSL for the hero strands → Watcher iris. Shader units: y in -1..1, x in -aspect..aspect.
// Every mesh shares strandPos(), so ribbons, tips and beads always move together.

const STRAND = /* glsl */ `
uniform float uTime;
uniform float uMorph;   // 0 = hero bundle, 1 = iris (from scroll)
uniform float uAspect;
uniform float uScale;   // iris size (smaller on portrait screens)
uniform vec2  uMouse;  // cursor, for bending fibres (far away when unknown)
uniform vec2  uGaze;   // cursor, clamped, for the pupil's glance (0 when unknown)
uniform float uCount;

const float TAU = 6.2831853;

// Each strand converges at its own moment, so the iris forms in a sweep.
float morphOf(vec4 r) {
  float m = clamp((uMorph - r.w * 0.3) / 0.7, 0.0, 1.0);
  return m * m * (3.0 - 2.0 * m);
}

// Hero: a bundle sweeping in from the top-left, flowing behind the centred copy and ending
// in a wide band of tips around the level of the buttons.
vec2 bundle(vec4 r, float t) {
  vec2 o = vec2(-uAspect - 0.35 + r.x * 0.3, 1.3 + r.y * 0.25);
  float a = r.z * TAU;
  float k = sqrt(r.w);
  float spread = 0.92 * min(uAspect, 1.7);
  vec2 tip = vec2(0.0, -0.46) + vec2(cos(a) * spread, sin(a) * 0.2) * k;
  vec2 c1 = o + vec2(0.55 + r.y * 0.35, -0.3 - r.x * 0.25);
  vec2 c2 = tip + vec2(-0.6 - r.z * 0.35, 0.5 + r.w * 0.25);
  float u = 1.0 - t;
  vec2 p = u * u * u * o + 3.0 * u * u * t * c1 + 3.0 * u * t * t * c2 + t * t * t * tip;
  p += vec2(sin(uTime * 0.5 + r.x * TAU + t * 2.0), cos(uTime * 0.4 + r.y * TAU + t * 1.7)) * 0.03 * t;
  vec2 d = p - uMouse;
  p += normalize(d + 1e-4) * exp(-dot(d, d) / 0.06) * 0.16 * t; // the cursor bends fibres away
  return p;
}

// Eye: a radial fibre from the iris edge (t = 0) in to the pupil rim (t = 1).
vec2 iris(float i, vec4 r, float t) {
  float ang = (i + r.x * 0.6) / uCount * TAU;
  vec2 dir = vec2(cos(ang), sin(ang));
  float rad = mix((0.47 + (r.y - 0.5) * 0.09) * uScale, 0.135 * uScale, t);
  vec2 p = dir * rad;
  p += vec2(-dir.y, dir.x) * sin(t * 9.0 + r.z * 30.0 + uTime * 0.6) * 0.0035 * uScale;
  p += uGaze * 0.025 * t; // the pupil glances at the cursor
  return p;
}

vec2 strandPos(float i, vec4 r, float t) {
  return mix(bundle(r, t), iris(i, r, t), morphOf(r));
}
`

export const ribbonVert = /* glsl */ `
${STRAND}
attribute float aStrand;
attribute vec4 aRand;
attribute float aT;
attribute float aSide;
uniform float uWidth;
varying float vT;
varying float vSide;
varying float vM;
varying float vDim;

void main() {
  vec2 p = strandPos(aStrand, aRand, aT);
  vec2 ahead = strandPos(aStrand, aRand, min(aT + 0.01, 1.0));
  vec2 behind = strandPos(aStrand, aRand, max(aT - 0.01, 0.0));
  vec2 tang = normalize(ahead - behind + 1e-5);
  vM = morphOf(aRand);
  // hero: dim the strands where they pass behind the centred text block
  vec2 q = (p - vec2(0.0, 0.0)) / vec2(0.55 * min(uAspect, 1.7), 0.6);
  vDim = mix(mix(0.28, 1.0, smoothstep(0.35, 1.15, length(q))), 1.0, vM);
  float w = uWidth * mix(mix(0.5, 1.0, aT), mix(1.35, 0.7, aT), vM);
  p += vec2(-tang.y, tang.x) * aSide * w;
  vT = aT;
  vSide = aSide;
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
}
`

export const ribbonFrag = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uAlpha;
varying float vT;
varying float vSide;
varying float vM;
varying float vDim;

void main() {
  float edge = 1.0 - abs(vSide);
  edge *= edge;
  float hero = mix(0.16, 1.0, smoothstep(0.55, 1.0, vT));      // fibre optics glow toward the tip
  float eye = smoothstep(0.0, 0.3, vT) * mix(0.55, 1.5, vT);    // iris: bright at the pupil rim
  vec3 col = mix(uColA, uColB, vT) * mix(hero, eye, vM) * edge * uAlpha * vDim;
  gl_FragColor = vec4(col, 1.0);
}
`

export const tipVert = /* glsl */ `
${STRAND}
attribute float aStrand;
attribute vec4 aRand;
uniform float uSize;
varying float vM;

void main() {
  vec2 p = strandPos(aStrand, aRand, 1.0);
  vM = morphOf(aRand);
  float big = step(0.66, aRand.y);
  gl_PointSize = uSize * mix(mix(0.45, 1.25, big), 0.3, vM);
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
}
`

export const beadVert = /* glsl */ `
${STRAND}
attribute float aStrand;
attribute vec4 aRand;
attribute vec3 aBead; // speed, phase, size
uniform float uSize;
varying float vFade;
varying float vM;

void main() {
  float t = fract(uTime * aBead.x + aBead.y);
  vec2 p = strandPos(aStrand, aRand, t);
  vM = morphOf(aRand);
  vFade = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.92, t);
  gl_PointSize = uSize * aBead.z;
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
}
`

/** The threat: one coral bead on a strand chosen in JS. */
export const threatVert = /* glsl */ `
${STRAND}
uniform float uThreatStrand;
uniform vec4 uThreatRand;
uniform float uThreatT;
uniform float uSize;
varying float vFade;
varying float vM;

void main() {
  vec2 p = strandPos(uThreatStrand, uThreatRand, uThreatT);
  vM = morphOf(uThreatRand);
  vFade = smoothstep(0.0, 0.06, uThreatT) * smoothstep(1.0, 0.95, uThreatT);
  gl_PointSize = uSize;
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
}
`

/** Soft glowing disc with a hot core. */
export const dotFrag = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uAlpha;
varying float vM;
#ifdef FADE
varying float vFade;
#endif

void main() {
  float d = length(gl_PointCoord - 0.5);
  float glow = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.2, 0.0, d);
  float a = glow * glow * uAlpha;
#ifdef FADE
  a *= vFade;
#endif
  gl_FragColor = vec4(mix(uColA, uColB, core) * a, 1.0);
}
`

export const spokeVert = /* glsl */ `
uniform float uAspect;
uniform float uScale;
uniform float uRot;
uniform float uShow;
attribute float aIdx;
attribute vec2 aCorner;
varying vec2 vCorner;
varying float vIdx;

void main() {
  float ang = aIdx / ${32}.0 * 6.2831853 + uRot;
  vec2 dir = vec2(cos(ang), sin(ang));
  float grow = mix(1.12, 1.0, uShow);
  float r = mix(0.53, 0.63, aCorner.y) * uScale * grow;
  vec2 p = dir * r + vec2(-dir.y, dir.x) * aCorner.x * 0.017 * uScale * (0.8 + 0.4 * aCorner.y);
  vCorner = aCorner;
  vIdx = aIdx;
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
}
`

export const spokeFrag = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uThreat;
uniform float uShow;
uniform float uLockIdx;
uniform float uLock;
varying vec2 vCorner;
varying float vIdx;

void main() {
  // distance to the spoke's edge: a bright outline around a faint fill
  float across = (1.0 - abs(vCorner.x)) * 0.017;
  float along = min(vCorner.y, 1.0 - vCorner.y) * 0.1;
  float e = min(across, along);
  float outline = exp(-e / 0.0045) * 1.3;
  float locked = step(abs(vIdx - uLockIdx), 0.5) * uLock;
  vec3 col = mix(uColA, uThreat, locked) * (outline + 0.1 + locked * 0.35);
  gl_FragColor = vec4(col * uShow, 1.0);
}
`

export const frameVert = /* glsl */ `
uniform float uAspect;
uniform float uScale;
varying vec2 vP;

void main() {
  vP = position.xy * 0.75 * uScale;
  gl_Position = vec4(vP.x / uAspect, vP.y, 0.0, 1.0);
}
`

/** Ring circles, pupil rim and a faint iris haze. */
export const frameFrag = /* glsl */ `
uniform float uScale;
uniform float uShow;
uniform float uMorph;
uniform vec2 uGaze;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uRing;
varying vec2 vP;

void main() {
  float r = length(vP);
  float s = uScale * mix(1.12, 1.0, uShow);
  float circles = exp(-abs(r - 0.525 * s) / 0.0022) + exp(-abs(r - 0.638 * s) / 0.0022);
  float rp = length(vP - uGaze * 0.025);
  float rim = exp(-abs(rp - 0.135 * uScale) / 0.012);
  float haze = smoothstep(0.5 * uScale, 0.14 * uScale, r) * smoothstep(0.12 * uScale, 0.16 * uScale, rp);
  vec3 col = uRing * circles * 0.8 * uShow + uColB * rim * 0.7 * uMorph + uColA * haze * 0.16 * uMorph;
  gl_FragColor = vec4(col, 1.0);
}
`
