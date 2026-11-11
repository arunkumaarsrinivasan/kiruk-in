/**
 * The picture tube. The interface is drawn flat on a small 2D canvas (the
 * "surface"); this takes that picture and shows it the way a 1970s tube
 * would: bent on a convex glass, drawn in scan lines by a beam that blooms
 * where it is bright, on phosphor that keeps glowing a moment after the
 * picture has moved on.
 *
 * Passes, every frame:
 *   persist  surface + what the phosphor still holds  → the lit picture
 *   glow     the picture, blurred twice: a tight bloom and a wide halo
 *   tube     curve, scan lines, colour fringe, glow, fall-off, glass, housing
 */

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* The phosphor: each point keeps the brightest of what is drawn now and what
   it still holds, and what it holds fades. The pointer leaves a trail here. */
const PERSIST = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uSrc;
uniform sampler2D uPrev;
uniform sampler2D uArrow;
uniform vec3 uDecay;
uniform vec2 uSurf;
uniform vec3 uPtr;      // x, y in surface pixels; z > 0 when shown
uniform vec3 uPtrColor;
void main() {
  vec3 now = texture(uSrc, vUv).rgb;
  vec2 a = (vUv * uSurf - uPtr.xy) / vec2(24.0, 34.0);
  if (uPtr.z > 0.5 && a.x >= 0.0 && a.y >= 0.0 && a.x < 1.0 && a.y < 1.0) {
    now = max(now, uPtrColor * texture(uArrow, a).r * 0.8);
  }
  vec3 held = max(texture(uPrev, vUv).rgb * uDecay - 0.006, 0.0);
  o = vec4(max(now, held), 1.0);
}`;

const COPY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uSrc;
uniform vec2 uTexel;
void main() {
  vec3 c = texture(uSrc, vUv + uTexel * vec2(-0.5, -0.5)).rgb
         + texture(uSrc, vUv + uTexel * vec2( 0.5, -0.5)).rgb
         + texture(uSrc, vUv + uTexel * vec2(-0.5,  0.5)).rgb
         + texture(uSrc, vUv + uTexel * vec2( 0.5,  0.5)).rgb;
  o = vec4(c * 0.25, 1.0);
}`;

const BLUR = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uSrc;
uniform vec2 uStep;
void main() {
  vec3 c = texture(uSrc, vUv).rgb * 0.227027;
  c += (texture(uSrc, vUv + uStep * 1.0).rgb + texture(uSrc, vUv - uStep * 1.0).rgb) * 0.1945946;
  c += (texture(uSrc, vUv + uStep * 2.0).rgb + texture(uSrc, vUv - uStep * 2.0).rgb) * 0.1216216;
  c += (texture(uSrc, vUv + uStep * 3.0).rgb + texture(uSrc, vUv - uStep * 3.0).rgb) * 0.054054;
  c += (texture(uSrc, vUv + uStep * 4.0).rgb + texture(uSrc, vUv - uStep * 4.0).rgb) * 0.016216;
  o = vec4(c, 1.0);
}`;

const TUBE = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uPic;
uniform sampler2D uGlowS;
uniform sampler2D uGlowL;
uniform sampler2D uArrow;
uniform vec2 uRes;       // canvas, device pixels
uniform vec4 uRect;      // the picture: x0, y0, x1, y1 in device pixels, origin top left
uniform vec2 uSurf;      // surface size in its own pixels
uniform float uK;        // how far the middle of the glass swells
uniform float uRadius;   // corner radius, device pixels
uniform float uTime;
uniform float uWarm;     // 0 cold … 1 warm
uniform float uMotion;   // 0 for a still picture (reduced motion)
uniform vec3 uTint;      // the phosphor's own colour, for the raster's faint glow
uniform vec3 uPtr;
uniform vec3 uPtrColor;
uniform vec2 uLook;      // pointer, -1…1, for the light on the glass
uniform float uGain;     // brightness of the beam
uniform float uGlow;     // strength of the bloom
uniform float uScan;     // 1 with scan lines, 0 without

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

/* The halo is not the colour of the beam: the wide bloom runs warmer. */
vec3 halo(vec3 c) {
  return c * vec3(1.0, 0.82, 0.9) + vec3(c.g * 0.12, 0.0, c.r * 0.26 + c.g * 0.05);
}

/* Too much light keeps its colour: a big lit field stays amber, and only the
   hottest cores run toward white. */
vec3 knee(vec3 x) {
  float m = max(x.r, max(x.g, x.b));
  if (m <= 1.0) return x;
  return mix(x / m, vec3(1.0), smoothstep(1.0, 3.2, m) * 0.5);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 mid = (uRect.xy + uRect.zw) * 0.5;
  vec2 halfSize = (uRect.zw - uRect.xy) * 0.5;
  vec2 p = (frag - mid) / halfSize;
  float r2 = dot(p, p);

  // the curve of the glass: the middle swells, the middle of each edge stays put
  vec2 s = p * (1.0 + uK * r2) / (1.0 + uK);

  // warming up: the picture opens from a line
  float open = mix(0.006, 1.0, smoothstep(0.08, 0.62, uWarm));
  s.y /= open;

  // distance to the rounded edge of the picture, device pixels (negative inside)
  vec2 q = abs(s) * halfSize - (halfSize - uRadius);
  float edge = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float inside = 1.0 - smoothstep(-1.0, 1.0, edge);

  vec2 uv = s * 0.5 + 0.5;
  float line = uv.y * uSurf.y * 0.5;

  // a beam is never quite steady: each line sits a hair left or right
  uv.x += (hash(vec2(floor(line), floor(uTime * 24.0))) - 0.5) * 0.0007 * uMotion;

  // the three colours do not land in quite the same place off axis
  vec2 fringe = (uv - 0.5) * r2 * 0.0042;
  vec3 pic = vec3(texture(uPic, uv + fringe).r, texture(uPic, uv).g, texture(uPic, uv - fringe).b);

  // the tube's own pointer, drawn last so it reads over anything lit
  vec2 a = (uv * uSurf - uPtr.xy) / vec2(24.0, 34.0);
  if (uPtr.z > 0.5 && a.x >= 0.0 && a.y >= 0.0 && a.x < 1.0 && a.y < 1.0) {
    vec4 arrow = texture(uArrow, a);
    pic = mix(pic, vec3(0.0), arrow.g);
    pic = mix(pic, uPtrColor, arrow.r);
  }

  // scan lines: one for every two rows of the surface, each a bright core and
  // a dark gap; a bright beam is fatter and closes the gap
  float beam = 0.5 + 0.5 * cos(6.28318 * (line - 0.5));
  float fine = clamp(1.0 - fwidth(line) * 1.35, 0.0, 1.0);
  float lum = max(pic.r, max(pic.g, pic.b));
  float scan = mix(1.0, mix(0.34, 1.0, beam), fine * (1.0 - lum * 0.42) * uScan);

  vec3 glowS = texture(uGlowS, uv).rgb;
  vec3 glowL = texture(uGlowL, uv).rgb;
  // Bloom belongs to edges and thin strokes. Inside a wide lit field it would
  // only wash out the dark ink written on it, so it is held back there.
  float field = smoothstep(0.3, 0.72, max(glowL.r, max(glowL.g, glowL.b)));
  vec3 col = (pic * scan * 1.08 + (glowS * 0.5 + halo(glowL) * 0.72) * mix(1.0, 0.16, field) * uGlow) * uGain;

  // the raster is never quite black
  col += uTint * (0.014 + 0.012 * beam * fine * uScan);

  // the picture falls off toward the rim of a deep tube
  col *= mix(1.0, 0.52, smoothstep(0.55, 2.0, r2));
  col *= 0.72 + 0.28 * smoothstep(0.0, 16.0, -edge);

  // mains hum, flicker and grain
  float bar = fract(uv.y * 0.55 - uTime * 0.06);
  col *= 1.0 + uMotion * (0.05 * smoothstep(0.0, 0.1, bar) * smoothstep(0.4, 0.1, bar) + 0.012 * sin(uTime * 113.0));
  col += (hash(frag + fract(uTime) * 71.0) - 0.5) * 0.028 * uMotion;
  col *= 1.0 + (1.0 - smoothstep(0.3, 1.0, uWarm)) * 2.4;

  // the housing: dark, with the picture's light spilling a little onto its lip
  vec3 spill = halo(texture(uGlowL, clamp(uv, 0.0, 1.0)).rgb);
  vec3 housing = vec3(0.016, 0.018, 0.017) * (1.0 - 0.5 * smoothstep(0.0, 60.0, edge))
    + spill * 0.5 * exp(-max(edge, 0.0) * 0.045)
    + vec3(0.05) * smoothstep(3.0, 0.0, abs(edge - 2.0));
  col = mix(housing, col, inside);

  col = knee(max(col, 0.0));

  // the room on the glass: a soft light high on the left, sliding against the eye
  vec2 g = (p - vec2(-0.5, -0.86) + uLook * 0.07) / vec2(0.62, 0.3);
  col += inside * 0.05 * exp(-dot(g, g));

  o = vec4(col, 1.0);
}`;

export interface CrtGeometry {
  /** Canvas size, CSS pixels. */
  w: number;
  h: number;
  /** The picture's box inside the canvas, CSS pixels. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** How far the middle swells: 0 flat, 0.12 a deep tube. */
  k: number;
  /** Corner radius of the picture, CSS pixels. */
  radius: number;
}

export interface CrtFrame {
  time: number;
  dt: number;
  /** The surface changed since the last frame and has to be uploaded again. */
  dirty: boolean;
  /** Pointer in surface pixels, or null when it is off the glass. */
  pointer: { x: number; y: number } | null;
  pointerColor: [number, number, number];
  tint: [number, number, number];
  /** Pointer across the canvas, -1…1. */
  look: [number, number];
  warm: number;
  motion: boolean;
  /** Brightness of the beam and strength of the bloom, 1 as built; scan lines on or off. */
  gain: number;
  glow: number;
  scan: boolean;
}

interface Target {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
}

type Uniforms = Record<string, WebGLUniformLocation | null>;

interface Program {
  prog: WebGLProgram;
  u: Uniforms;
}

/** Where a point of the glass falls on the flat picture: -1…1 in, -1…1 out. */
export function bend(px: number, py: number, k: number): [number, number] {
  const f = (1 + k * (px * px + py * py)) / (1 + k);
  return [px * f, py * f];
}

/** The other way: where a point of the flat picture shows on the glass. */
export function unbend(sx: number, sy: number, k: number): [number, number] {
  let px = sx;
  let py = sy;
  for (let i = 0; i < 8; i += 1) {
    const f = (1 + k) / (1 + k * (px * px + py * py));
    px = sx * f;
    py = sy * f;
  }
  return [px, py];
}

export class Crt {
  private readonly gl: WebGL2RenderingContext;
  private readonly persist: Program;
  private readonly copy: Program;
  private readonly blur: Program;
  private readonly tube: Program;
  private readonly vao: WebGLVertexArrayObject;
  private readonly srcTex: WebGLTexture;
  private readonly arrowTex: WebGLTexture;
  private held: [Target, Target] | null = null;
  private half: [Target, Target] | null = null;
  private quarter: [Target, Target] | null = null;
  private geo: CrtGeometry | null = null;
  private dpr = 1;
  private surfW = 0;
  private surfH = 0;
  private flip = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    arrow: { fill: readonly string[]; width: number; height: number },
  ) {
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("webgl2 unavailable");
    this.gl = gl;
    this.persist = this.program(PERSIST);
    this.copy = this.program(COPY);
    this.blur = this.program(BLUR);
    this.tube = this.program(TUBE);

    const vao = gl.createVertexArray();
    const buf = gl.createBuffer();
    if (!vao || !buf) throw new Error("webgl2 buffers");
    this.vao = vao;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    for (const p of [this.persist, this.copy, this.blur, this.tube]) {
      const loc = gl.getAttribLocation(p.prog, "aPos");
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      }
    }

    this.srcTex = this.texture(gl.LINEAR);

    // The pointer, as a tiny picture: red is its fill, green its dark edge.
    this.arrowTex = this.texture(gl.NEAREST);
    const data = new Uint8Array(arrow.width * arrow.height * 4);
    arrow.fill.forEach((row, y) => {
      for (let x = 0; x < arrow.width; x += 1) {
        const o = (y * arrow.width + x) * 4;
        data[o] = row[x] === "o" ? 255 : 0;
        data[o + 1] = row[x] === "#" ? 255 : 0;
        data[o + 3] = 255;
      }
    });
    gl.bindTexture(gl.TEXTURE_2D, this.arrowTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, arrow.width, arrow.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  private program(frag: string): Program {
    const gl = this.gl;
    const make = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) throw new Error("shader");
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader compile");
      return sh;
    };
    const prog = gl.createProgram();
    if (!prog) throw new Error("program");
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "program link");
    const u: Uniforms = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i += 1) {
      const info = gl.getActiveUniform(prog, i);
      if (info) u[info.name] = gl.getUniformLocation(prog, info.name);
    }
    return { prog, u };
  }

  private texture(filter: number): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error("texture");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  private target(w: number, h: number): Target {
    const gl = this.gl;
    const tex = this.texture(gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer();
    if (!fbo) throw new Error("framebuffer");
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  }

  private free(pair: [Target, Target] | null) {
    pair?.forEach((t) => {
      this.gl.deleteTexture(t.tex);
      this.gl.deleteFramebuffer(t.fbo);
    });
  }

  /** Fit the tube to its canvas and to the size of the picture it shows. */
  resize(geo: CrtGeometry, surfW: number, surfH: number) {
    this.geo = geo;
    // A tube is soft by nature; past 1.75 device pixels the extra fill buys nothing.
    this.dpr = Math.min(globalThis.devicePixelRatio || 1, 1.75);
    const cw = Math.max(1, Math.round(geo.w * this.dpr));
    const ch = Math.max(1, Math.round(geo.h * this.dpr));
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }
    if (surfW !== this.surfW || surfH !== this.surfH) {
      this.surfW = surfW;
      this.surfH = surfH;
      this.free(this.held);
      this.free(this.half);
      this.free(this.quarter);
      const pair = (w: number, h: number): [Target, Target] => [this.target(w, h), this.target(w, h)];
      this.held = pair(surfW, surfH);
      this.half = pair(Math.max(1, surfW >> 1), Math.max(1, surfH >> 1));
      this.quarter = pair(Math.max(1, surfW >> 2), Math.max(1, surfH >> 2));
    }
  }

  /** A point of the canvas (CSS pixels) as a point of the surface, and whether it is on the picture. */
  map(x: number, y: number): { x: number; y: number; inside: boolean } {
    const g = this.geo;
    if (!g) return { x: 0, y: 0, inside: false };
    const px = (x - (g.x0 + g.x1) / 2) / ((g.x1 - g.x0) / 2);
    const py = (y - (g.y0 + g.y1) / 2) / ((g.y1 - g.y0) / 2);
    const [sx, sy] = bend(px, py, g.k);
    return {
      x: (sx * 0.5 + 0.5) * this.surfW,
      y: (sy * 0.5 + 0.5) * this.surfH,
      inside: Math.abs(sx) <= 1 && Math.abs(sy) <= 1,
    };
  }

  private pass(p: Program, to: Target | null, w: number, h: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, to ? to.fbo : null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(p.prog);
  }

  private bind(unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, unit);
  }

  draw(surface: HTMLCanvasElement, f: CrtFrame) {
    const gl = this.gl;
    const g = this.geo;
    if (!g || !this.held || !this.half || !this.quarter || gl.isContextLost()) return;
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);

    if (f.dirty) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
    }

    const ptr: [number, number, number] = f.pointer ? [f.pointer.x, f.pointer.y, 1] : [0, 0, 0];

    // phosphor
    const prev = this.held[this.flip];
    const next = this.held[1 - this.flip];
    this.flip = 1 - this.flip;
    this.pass(this.persist, next, next.w, next.h);
    this.bind(0, this.srcTex, this.persist.u.uSrc);
    this.bind(1, prev.tex, this.persist.u.uPrev);
    this.bind(2, this.arrowTex, this.persist.u.uArrow);
    // by the clock, not by the frame: a slow or throttled page must not leave ghosts
    const frames = Math.max(0.25, f.dt * 60);
    gl.uniform3f(this.persist.u.uDecay, 0.7 ** frames, 0.8 ** frames, 0.74 ** frames);
    gl.uniform2f(this.persist.u.uSurf, this.surfW, this.surfH);
    gl.uniform3f(this.persist.u.uPtr, ptr[0], ptr[1], ptr[2]);
    gl.uniform3f(this.persist.u.uPtrColor, f.pointerColor[0], f.pointerColor[1], f.pointerColor[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // tight bloom at half size
    const [hA, hB] = this.half;
    this.pass(this.copy, hA, hA.w, hA.h);
    this.bind(0, next.tex, this.copy.u.uSrc);
    gl.uniform2f(this.copy.u.uTexel, 1 / next.w, 1 / next.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.pass(this.blur, hB, hB.w, hB.h);
    this.bind(0, hA.tex, this.blur.u.uSrc);
    gl.uniform2f(this.blur.u.uStep, 1.2 / hA.w, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.pass(this.blur, hA, hA.w, hA.h);
    this.bind(0, hB.tex, this.blur.u.uSrc);
    gl.uniform2f(this.blur.u.uStep, 0, 1.2 / hA.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // wide halo at quarter size
    const [qA, qB] = this.quarter;
    this.pass(this.copy, qA, qA.w, qA.h);
    this.bind(0, hA.tex, this.copy.u.uSrc);
    gl.uniform2f(this.copy.u.uTexel, 1 / hA.w, 1 / hA.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    for (let i = 0; i < 2; i += 1) {
      this.pass(this.blur, qB, qB.w, qB.h);
      this.bind(0, qA.tex, this.blur.u.uSrc);
      gl.uniform2f(this.blur.u.uStep, (1.6 + i) / qA.w, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.pass(this.blur, qA, qA.w, qA.h);
      this.bind(0, qB.tex, this.blur.u.uSrc);
      gl.uniform2f(this.blur.u.uStep, 0, (1.6 + i) / qA.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // the tube
    const u = this.tube.u;
    const d = this.dpr;
    this.pass(this.tube, null, this.canvas.width, this.canvas.height);
    this.bind(0, next.tex, u.uPic);
    this.bind(1, hA.tex, u.uGlowS);
    this.bind(2, qA.tex, u.uGlowL);
    this.bind(3, this.arrowTex, u.uArrow);
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform4f(u.uRect, g.x0 * d, g.y0 * d, g.x1 * d, g.y1 * d);
    gl.uniform2f(u.uSurf, this.surfW, this.surfH);
    gl.uniform1f(u.uK, g.k);
    gl.uniform1f(u.uRadius, g.radius * d);
    gl.uniform1f(u.uTime, f.time % 600);
    gl.uniform1f(u.uWarm, f.warm);
    gl.uniform1f(u.uMotion, f.motion ? 1 : 0);
    gl.uniform3f(u.uTint, f.tint[0], f.tint[1], f.tint[2]);
    gl.uniform3f(u.uPtr, ptr[0], ptr[1], ptr[2]);
    gl.uniform3f(u.uPtrColor, f.pointerColor[0], f.pointerColor[1], f.pointerColor[2]);
    gl.uniform2f(u.uLook, f.look[0], f.look[1]);
    gl.uniform1f(u.uGain, f.gain);
    gl.uniform1f(u.uGlow, f.glow);
    gl.uniform1f(u.uScan, f.scan ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    this.free(this.held);
    this.free(this.half);
    this.free(this.quarter);
    this.gl.deleteTexture(this.srcTex);
    this.gl.deleteTexture(this.arrowTex);
    this.gl.deleteVertexArray(this.vao);
    for (const p of [this.persist, this.copy, this.blur, this.tube]) this.gl.deleteProgram(p.prog);
    // The context itself is kept: the same canvas may be mounted again.
  }
}
