/**
 * The cornea: the glass. A conic dome (7.8 mm at its apex, flattening toward
 * its edge, Q −0.25) seated on the globe at the limbus, standing ~2.5 mm proud
 * of it, turning with the gaze. The view refracts twice, into the cornea and
 * out of its back surface into the aqueous, and finds the iris 3.6 mm behind
 * the apex, where it appears 3.04 mm deep at ×1.13 (twin/optics.ts). The clear
 * dome shows as an ellipse, 11.7 × 10.6 mm: the sclera overlaps it more above
 * and below.
 *
 * It draws nothing of its own. It is a mirror and an emitter for the screen
 * in front of the face: the view ray is reflected off the dome (rippled by the
 * tear film) and traced to the screen's rectangle, so the page lands in it
 * mirrored, fisheyed by the curvature and Fresnel-weighted, with no fake
 * geometry. Ported from the live eye's dome math, which these numbers come
 * from:
 *  · dispersion: each channel refracts through the dome's own curvature, so
 *    fringes grow toward the rim and vanish at the apex;
 *  · roughness grows toward the limbus where the tear film thins;
 *  · a white page is compressed against its own highlight so its layout
 *    survives it;
 *  · the limbus shades inward and catches a thin rim; one streak tells you
 *    it is glass;
 *  · a faint second image off the back of the cornea (Purkinje P2), and in
 *    the pupil the lens's own two (P3 upright ×2 and deep, so soft; P4
 *    inverted ×0.77, near the pupil's plane), traced off Navarro's lens
 *    surfaces (twin/purkinje.ts) to the same screen, each 1/27 of P1;
 *  · a flash on the camera's axis (an era's lens) leaves a hard catchlight
 *    where the dome faces the lens;
 *  · the tear film (bake/tear.ts): its slope tilts the mirror, its dry spots
 *    after a long stare blur and dim it in patches, and on T3 its lipid
 *    layer tints the highlights with faint interference colours.
 *
 * Output is premultiplied: the reflection screens over the iris beneath, and
 * the limbal shade darkens it. The reflection alone also goes to the emissive
 * target, which is what the post chain blooms.
 */

import { MeshBasicNodeMaterial, type RenderTarget, type Texture } from "three/webgpu";
import { ANATOMY, CORNEA_APEX_Z, CORNEA_CENTER_Z, IRIS_Z_PUPIL, IRIS_Z_ROOT, LIMBUS_RADIUS } from "../anatomy";
import { DEBUG_VIEWS, type EyeUniforms } from "../uniforms";
import type { IrisBake } from "../bake/iris";
import { inPanel, lensScale, smoothstepDown, type N } from "./common";
import { hitIris, irisShade } from "./iris";
import { CORNEA_BACK_CZ, CORNEA_BACK_R, LENS, LENS_BACK_CZ, LENS_FRONT_CZ, PURKINJE_VS_P1 } from "../twin/purkinje";
import { faceAngles, marginsAt, MARGIN_RADIUS, sideOf, socketShade3d } from "./margins";
import { tube, screenTint } from "./room";
import { sampleScreen, screenLight } from "./screen";
import { T } from "./tsl";

const {
  Fn,
  abs,
  cameraPosition,
  clamp,
  cos,
  dot,
  float,
  mrt,
  property,
  length,
  max,
  min,
  mix,
  modelWorldMatrix,
  modelWorldMatrixInverse,
  normalize,
  positionLocal,
  positionWorld,
  pow,
  reflect,
  refract,
  select,
  sin,
  smoothstep,
  sqrt,
  step,
  texture,
  vec2,
  vec3,
  vec4,
} = T;

// The cornea's own frame is its mesh's: the cap of a sphere centred
// CORNEA_CENTER_Z in front of the globe's centre. The vertex stage lays each
// point onto the conic, apex APEX_L out along the axis; the back surface is a
// sphere CORNEA_THICK behind the apex.
const APEX_L = CORNEA_APEX_Z - CORNEA_CENTER_Z;
const CONIC_K = 1 + ANATOMY.corneaAsphericity;
const BACK_R = ANATOMY.corneaPosteriorRadius;
const BACK_CZ = APEX_L - ANATOMY.corneaThickness - BACK_R;

/** The conic's sag at r² from the axis (anatomy.ts `corneaSag`). */
function conicSag(r2: N): N {
  const R = ANATOMY.corneaRadius;
  return r2.div(float(R).mul(float(1).add(sqrt(max(float(1).sub(r2.mul(CONIC_K / (R * R))), 0)))));
}

/** The conic's outward normal at (x, y), its own frame: −∇ of z = apex − sag(r). */
function conicNormal(p: N): N {
  const R = ANATOMY.corneaRadius;
  const s = float(1).div(float(R).mul(sqrt(max(float(1).sub(dot(p.xy, p.xy).mul(CONIC_K / (R * R))), 1e-4))));
  return normalize(vec3(p.x.mul(s), p.y.mul(s), 1));
}

const SPEC_VIEW = DEBUG_VIEWS.indexOf("spec");
const IRIS_VIEW = DEBUG_VIEWS.indexOf("iris");
const TEAR_VIEW = DEBUG_VIEWS.indexOf("tear");

/**
 * @param tear     the tear film's map (bake/tear.ts)
 * @param thinFilm the lipid layer's interference colours (T3)
 * @param emissive whether the post pass has an emissive target to bloom (WebGPU)
 */
export function corneaMaterial(
  Ux: EyeUniforms,
  screen: RenderTarget,
  irisBake: IrisBake,
  tear: RenderTarget,
  thinFilm: boolean,
  emissive: boolean,
) {
  const U: N = Ux;
  const S: N = U.screen;

  const material = new MeshBasicNodeMaterial();
  material.name = "Cornea";
  // the mesh is a ball's cap: each point laid onto the conic along the axis
  material.positionNode = vec3(positionLocal.x, positionLocal.y, float(APEX_L).sub(conicSag(dot(positionLocal.xy, positionLocal.xy))));
  // With the emissive target (WebGPU), the reflection also goes there: the
  // shader is the material's outputNode and its mrtNode carries the glow, so
  // three merges both into the pass's MRT. On WebGL2 that path fails inside
  // three, so there the cornea is a plain fragment and nothing blooms.
  const glowOut = emissive ? property("vec4", "corneaGlow") : null;
  const shade = Fn(() => {
    const t = S.time;
    const lum = U.screenLum;
    const local = positionLocal.toVar();
    // 0 at the apex, 1 at the limbus (the dome's optics: round)
    const cd = clamp(length(local.xy).div(LIMBUS_RADIUS), 0, 1).toVar();
    // and 1 where the clear dome stops showing: an ellipse, the sclera
    // overlapping it above and below (what the mask, the limbal shade and the
    // rim follow)
    const ce = length(vec2(local.x, local.y.div(ANATOMY.limbusAspect))).div(LIMBUS_RADIUS).toVar();
    // (fading over the outer 7 %: the limbus is a ramp into the white, which
    // the sclera continues, never a cut edge; R3)
    const mask = float(1).sub(smoothstep(0.93, 1, ce)).toVar();
    // the dome's own normal, analytic (the mesh is a ball laid onto the conic)
    const Nc = conicNormal(local).toVar();

    // The tear film over the dome, from its map (film coordinates: ±1 at the
    // limbus, y up; the map's rows run top-down). Its slope tilts the mirror;
    // where it has broken up, the surface goes irregular.
    const filmUv = vec2(local.x.div(LIMBUS_RADIUS).mul(0.5).add(0.5), float(0.5).sub(local.y.div(LIMBUS_RADIUS).mul(0.5))).toVar();
    const tearTex = tear.texture as Texture;
    const film = texture(tearTex, filmUv).toVar();
    const slope = vec2(
      texture(tearTex, filmUv.add(vec2(0.012, 0))).r.sub(film.r),
      texture(tearTex, filmUv.sub(vec2(0, 0.012))).r.sub(film.r),
    );
    const dry = smoothstepDown(0.42, 0.1, film.r).toVar();
    // a slow, shallow ripple, so the glass is never perfect, rougher where dry
    // (the film's own lipid pattern is the ripple: it drifts up after a blink
    // and then holds still, which is what a living tear film does; two fbm
    // noises per pixel used to do this, at real cost now the eye fills the frame)
    const tear_ = vec2(film.g.sub(0.5), film.b.sub(0.5).mul(0.6))
      .mul(0.55)
      .mul(dry.mul(2.5).add(1))
      .sub(slope.mul(6))
      .toVar();
    const Nw = normalize(modelWorldMatrix.mul(vec4(Nc, 0)).xyz);
    const N_ = Nw.add(vec3(tear_.mul(0.08), 0)).normalize().toVar();
    const V = cameraPosition.sub(positionWorld).normalize().toVar();

    // ---- through the glass: refract into the eye and find the iris --------------
    // All in the eye's own frame (the cornea's local space, shifted to the
    // globe's centre), so the iris turns with the gaze. Into the cornea at the
    // front, out into the aqueous at the back; where the back surface is
    // missed or reflects the ray whole (near the rim), one refraction straight
    // into the aqueous stands in.
    const camLocal = modelWorldMatrixInverse.mul(vec4(cameraPosition, 1)).xyz;
    const Vl = camLocal.sub(local).normalize();
    const Nl = Nc.add(vec3(tear_.mul(0.08), 0)).normalize();
    const into = refract(Vl.negate(), Nl, 1 / ANATOMY.iorCornea).toVar();
    const oc = local.sub(vec3(0, 0, BACK_CZ));
    const b = dot(into, oc);
    const disc = b.mul(b).sub(dot(oc, oc).sub(BACK_R * BACK_R));
    const tb = b.negate().sub(sqrt(max(disc, 0)));
    const back = local.add(into.mul(max(tb, 0))).toVar();
    const out = refract(into, normalize(back.sub(vec3(0, 0, BACK_CZ))), ANATOMY.iorCornea / ANATOMY.iorAqueous).toVar();
    const twice = disc.greaterThan(0).and(tb.greaterThan(0)).and(length(out).greaterThan(0.5));
    const ray = select(twice, out, refract(Vl.negate(), Nl, 1 / ANATOMY.iorAqueous)).toVar();
    const origin = select(twice, back, local).add(vec3(0, 0, CORNEA_CENTER_Z));
    const hit = hitIris(origin, ray, IRIS_Z_ROOT, IRIS_Z_PUPIL);
    const lightLocal = modelWorldMatrixInverse.mul(vec4(U.light.dir, 0)).xyz.normalize();

    // the same light as the white: the screen's own colour, kept under 1
    const avg = screenLight(screen).toVar();
    const hue = avg.div(max(max(avg.r, avg.g), max(avg.b, 0.001)));
    // R3: the era's page is the light, not a lamp's even glow. As on the skin
    // (lid-mesh.ts), the blurred picture in front of this point, mirrored,
    // tints the key: a page bright on one side lights that side of the iris.
    const avgLum = max(dot(avg, vec3(0.3, 0.55, 0.15)), 0.04);
    const throwUv = vec2(float(0.5).sub(positionWorld.x.div(72)), positionWorld.y.div(44).add(0.5));
    const thrown = clamp(sampleScreen(screen, clamp(throwUv, 0.02, 0.98), float(8).add(U.mip)).div(avgLum), 0.45, 2.2);
    const key = mix(vec3(1), hue, 0.3).mul(lum.mul(0.25).add(0.62)).mul(mix(vec3(1), thrown, 0.3));
    const amb = mix(vec3(1), hue, 0.5).mul(lum.mul(0.1).add(0.07));
    const socket = socketShade3d(positionWorld, Ux).shade;
    const iris = irisShade(Ux, irisBake, screen, { hit, ray, light: lightLocal, key, amb, socket, avgLum });

    // ---- trace the reflected ray to the screen --------------------------------
    const R = reflect(V.negate(), N_);
    const C = U.light.center;
    const Nn = U.light.normal;
    const denom = dot(R, Nn);
    const facing = step(denom, -0.02);
    const tHit = dot(C.sub(positionWorld), Nn).div(min(denom, -0.02));
    const h = positionWorld.add(R.mul(tHit)).sub(C);
    const ruv = vec2(
      dot(h, U.light.right).div(U.light.size.x).add(0.5),
      dot(h, U.light.up).div(U.light.size.y).add(0.5),
    ).toVar();

    // the dome is the lens: each wavelength its own index, fringes at the rim
    const rc = ruv.mul(2).sub(1);
    const r2 = clamp(dot(rc, rc), 0, 2).toVar();
    const ior = cd.mul(0.7).add(0.3).mul(-0.13);
    const uvR = ruv.sub(0.5).mul(lensScale(ior.mul(1.07), r2)).add(0.5);
    const uvG = ruv.sub(0.5).mul(lensScale(ior, r2)).add(0.5).toVar();
    const uvB = ruv.sub(0.5).mul(lensScale(ior.mul(0.93), r2)).add(0.5);

    // crisp across the middle of the dome, softening toward the limbus
    const blown = smoothstep(0.3, 0.92, lum).toVar();
    // The live eye stopped bright pages down hard because its output was
    // encoded twice and ran hot; this pipeline encodes once, so it needs less.
    const calm = float(1).sub(blown.mul(0.25));
    const soft = cd.mul(0.022).add(0.004);
    const onRefl = inPanel(uvG, soft).mul(facing).toVar();
    const rough = cd
      .pow(3)
      .mul(3.2)
      .add(0.45)
      .add(r2.mul(r2).mul(0.8))
      .add(length(tear_).mul(1.1))
      .add(dry.mul(2.4))
      .mul(float(1).sub(blown.mul(0.5)))
      .add(U.mip);
    const refl = vec3(
      sampleScreen(screen, uvR, rough).r,
      sampleScreen(screen, uvG, rough).g,
      sampleScreen(screen, uvB, rough).b,
    ).toVar();
    refl.assign(tube(refl, uvG, S.crt.mul(0.45), t));
    if (thinFilm) {
      // the lipid layer, a tenth of a micron: faint interference colours in
      // the highlight, drifting up with the film after a blink
      const phase = film.g.mul(1.6).add(film.r.mul(0.4));
      const fringe = cos(vec3(0, 0.33, 0.67).add(phase).mul(6.283)).mul(0.5).add(0.5);
      refl.mulAssign(mix(vec3(1), fringe.mul(0.5).add(0.6), float(0.16).mul(float(1).sub(dry))));
    }
    // thick glass gathers light in the middle and shades into its own edge
    refl.mulAssign(float(1).sub(cd.mul(cd)).mul(0.55).add(0.75));
    // a white page is compressed against its highlight, then its midtones
    // pulled apart again: what survives a highlight is contrast, not light
    refl.assign(mix(refl, refl.div(refl.mul(0.9).add(1)), blown.mul(0.8)));
    refl.assign(mix(refl, clamp(refl.sub(0.5).mul(1.5).add(0.42), 0, 1), blown.mul(0.7)));

    // the monitor's body around the panel, then the dark room past it
    const body = inPanel(uvG.sub(0.5).mul(0.86).add(0.5), soft);
    // R11 near reflections: a mirror ray that doesn't reach the page may meet
    // the lids first. Traced to a shell just off the lids' front (the margin's
    // sphere + 0.4 mm), it lands above the upper margin or below the lower one:
    // the lid's skin, lit by the same screen, with the lash line along the
    // margin a darker comb. Dark, and never over the page: the page in the
    // cornea is each era's concept (reflection per era), so the lids only
    // replace the dark room around it.
    const rLid = MARGIN_RADIUS + 0.4;
    const pb = dot(R, positionWorld);
    const pc = dot(positionWorld, positionWorld);
    const lidT = pb.negate().add(sqrt(max(pb.mul(pb).sub(pc.sub(rLid * rLid)), 0)));
    const lidHit = positionWorld.add(R.mul(lidT));
    const lidAt = faceAngles(lidHit);
    const lidM = marginsAt(sideOf(lidAt.phi, Ux), Ux);
    const overUp = lidAt.theta.sub(lidM.up).mul(rLid); // mm past the upper margin
    const underLo = lidM.lo.sub(lidAt.theta).mul(rLid); // mm past the lower one
    const onLid = smoothstep(-0.1, 0.25, max(overUp, underLo));
    // the lash line: 0–2.5 mm out from the margin, densest at the root, a comb of strands (~4.5/mm)
    const lashOut = max(overUp, underLo);
    const comb = smoothstep(0.3, 0.9, sin(lidAt.phi.mul(ANATOMY.eyeballRadius / 0.22)).mul(0.5).add(0.5));
    const lashLine = smoothstepDown(2.5, 0.2, lashOut).mul(mix(float(0.55), float(1), comb));
    const lidSkin = vec3(0.1, 0.062, 0.046).mul(key).mul(0.55).mul(float(1).sub(lashLine.mul(0.8)));
    const room = mix(mix(vec3(0.008, 0.009, 0.012), vec3(0.03, 0.031, 0.036), body), lidSkin, onLid);
    const mirrored = mix(room, refl, onRefl);

    // Schlick against the rippled dome; the screen is far brighter than the
    // eye it lights, so the source carries most of its own weight
    const f0 = 0.035;
    const fres = float(f0).add(pow(float(1).sub(max(dot(N_, V), 0)), 5).mul(1 - f0));
    const source = lum.mul(-0.22).add(0.86);
    const k = clamp(
      U.reflect
        .mul(source)
        .mul(fres.mul(3.6).add(0.7))
        .mul(mask)
        .mul(mix(0.16, 1, onRefl))
        .mul(float(1).sub(lum.mul(0.2)))
        .mul(calm)
        .mul(0.5)
        .mul(float(1).sub(dry.mul(0.3))),
      0,
      1,
    );
    const screened = mirrored.mul(k).toVar();

    // the era's second light, mirrored: a fluorescent bar overhead, a lamp's
    // disc to the side, traced to its own small shape as the screen is
    const F = U.fill;
    const fDen = dot(R, F.normal);
    const fT = dot(F.center.sub(positionWorld), F.normal).div(min(fDen, -0.02));
    const fH = positionWorld.add(R.mul(fT)).sub(F.center);
    const fUv = vec2(dot(fH, F.right).div(F.size.x), dot(fH, F.up).div(F.size.y)).mul(2);
    const corner = mix(float(0.05), float(1), F.round);
    const fDist = length(max(abs(fUv).sub(float(1).sub(corner)), 0)).sub(corner);
    const fMask = smoothstepDown(cd.mul(0.25).add(0.06), 0, fDist).mul(step(fDen, -0.02)).mul(mask);
    screened.addAssign(vec3(F.color).mul(fMask).mul(fres.mul(3).add(0.6)).mul(U.reflect).mul(2.6).mul(F.catchlight));

    // the panel as an emitter, and its blown-out middle
    // A white page reflected at a few percent is dimmer than the lit iris under
    // it; what keeps the page readable is its contrast, not its light.
    const emit = refl.mul(onRefl).mul(mask).mul(U.reflect).mul(lum.mul(-0.08).add(0.2)).mul(calm);
    const coreDist = max(abs(uvG.x.sub(0.5)), abs(uvG.y.sub(0.5))).sub(0.18);
    const core = onRefl.mul(smoothstepDown(0.3, 0, coreDist));
    const coreGlow = screenTint(S).mul(core).mul(mask).mul(lum.mul(0.03).add(0.07)).mul(calm);

    // Purkinje P2: the back of the cornea mirrors the screen too, a little
    // smaller and far dimmer, almost on top of the first image
    const uvP2 = uvG.sub(0.5).mul(1.09).add(0.5);
    const p2 = sampleScreen(screen, uvP2, rough.add(1)).mul(inPanel(uvP2, 0.03)).mul(facing).mul(mask).mul(0.05);

    // the limbus: the rim of the lens catching light, the shade just inside it
    // (gentle: at 0.24 it laid a ring darker than the iris inside the limbus)
    const limbShade = smoothstep(0.75, 1, ce).mul(0.1).mul(mask);
    const rim = vec3(1).mul(smoothstep(0.94, 1, ce)).mul(mask).mul(lum.mul(0.09).add(0.05));
    // one streak across the top-left of the dome: glass, not paint
    const across = dot(local.xy.div(ANATOMY.corneaRadius), vec2(0.722, 0.692)).add(0.42);
    const streak = vec3(1)
      .mul(smoothstepDown(0.06, 0, abs(across)))
      .mul(mask)
      .mul(float(1).sub(cd.mul(cd)))
      .mul(lum.mul(0.13).add(0.09));

    // a flash on the camera's axis: a hard dot where the dome looks straight back at the lens
    const facingLens = float(1).sub(max(dot(N_, V), 0));
    const catchlight = vec3(1)
      .mul(smoothstepDown(0.0013, 0.0006, facingLens))
      .mul(U.lens.catchlight)
      .mul(mask)
      .mul(2.2);

    // ---- R4: the lens's own mirrors in the pupil, P3 and P4 --------------------
    // The view ray goes on past the pupil to the lens, is mirrored by its front
    // (P3) or, inside it, by its back (P4), and leaves through the cornea; it is
    // traced to the screen like P1 (twin/purkinje.ts holds the same path to the
    // published images: P3 upright, ×2, 10.8 mm deep; P4 inverted, ×0.77, 4.3).
    const sphere = (o: N, d: N, cz: number, r: number, far: boolean) => {
      const oc = o.sub(vec3(0, 0, cz));
      const bb = dot(d, oc);
      const dd = bb.mul(bb).sub(dot(oc, oc).sub(r * r));
      const tt = far ? bb.negate().add(sqrt(max(dd, 0))) : bb.negate().sub(sqrt(max(dd, 0)));
      return { p: o.add(d.mul(tt)), ok: dd.greaterThan(0).and(tt.greaterThan(0)) };
    };
    const away = (p: N, cz: number) => normalize(p.sub(vec3(0, 0, cz)));
    const outOf = (o: N, d: N) => {
      // out through the cornea's back, then its front (a sphere this near the axis)
      const cb = sphere(o, d, CORNEA_BACK_CZ, CORNEA_BACK_R, true);
      const d1 = refract(d, away(cb.p, CORNEA_BACK_CZ).negate(), ANATOMY.iorAqueous / ANATOMY.iorCornea);
      const cf = sphere(cb.p, d1, CORNEA_CENTER_Z, ANATOMY.corneaRadius, true);
      const d2 = refract(d1, away(cf.p, CORNEA_CENTER_Z).negate(), ANATOMY.iorCornea);
      return { p: cf.p, d: d2, ok: cb.ok.and(cf.ok).and(length(d2).greaterThan(0.5)) };
    };
    const toScreen = (pG: N, dG: N, bias: N) => {
      const pW = modelWorldMatrix.mul(vec4(pG.sub(vec3(0, 0, CORNEA_CENTER_Z)), 1)).xyz;
      const dW = normalize(modelWorldMatrix.mul(vec4(dG, 0)).xyz);
      const den = dot(dW, Nn);
      const tS = dot(C.sub(pW), Nn).div(min(den, -0.02));
      const hS = pW.add(dW.mul(tS)).sub(C);
      const uv = vec2(dot(hS, U.light.right).div(U.light.size.x).add(0.5), dot(hS, U.light.up).div(U.light.size.y).add(0.5)).toVar();
      const on = inPanel(uv, 0.04).mul(step(den, -0.02));
      // the panel, else the monitor's body and the dark room
      return mix(vec3(0.008, 0.009, 0.012), sampleScreen(screen, clamp(uv, 0.01, 0.99), bias), on);
    };
    const pupilP = hit.sub(ray.mul(0.6)); // just in front of the lens, on the view ray
    const lf = sphere(pupilP, ray, LENS_FRONT_CZ, LENS.front, false);
    const nLf = away(lf.p, LENS_FRONT_CZ);
    // P3: off the lens's front; 7 mm behind the iris's focus, so soft
    const e3 = outOf(lf.p, reflect(ray, nLf));
    const p3 = toScreen(e3.p, e3.d, float(5.5).add(U.mip)).mul(select(lf.ok.and(e3.ok), float(1), float(0)));
    // P4: into the lens, off its back, out again; near the pupil's plane, sharper
    const inL = refract(ray, nLf, ANATOMY.iorAqueous / LENS.n);
    const lb = sphere(lf.p, inL, LENS_BACK_CZ, LENS.back, true);
    const backR = reflect(inL, away(lb.p, LENS_BACK_CZ));
    const lf2 = sphere(lb.p, backR, LENS_FRONT_CZ, LENS.front, true);
    const outL = refract(backR, away(lf2.p, LENS_FRONT_CZ).negate(), LENS.n / ANATOMY.iorAqueous);
    const e4 = outOf(lf2.p, outL);
    const p4 = toScreen(e4.p, e4.d, float(3.5).add(U.mip)).mul(select(lf.ok.and(lb.ok).and(lf2.ok).and(e4.ok), float(1), float(0)));
    // as bright against P1 as Fresnel makes them (P1's weight at the dome's middle)
    const kP = U.reflect.mul(source).mul(calm).mul(0.5 * (0.035 * 3.6 + 0.7) * PURKINJE_VS_P1);
    const purkinje = p3.add(p4).mul(kP).mul(iris.throughPupil);

    // the mirror screens over the iris, the panel glows on top, the limbus shades
    // all of it, and the rim, the streak and P2 sit on the surface
    const under = iris.color.add(purkinje);
    const mirrored_ = under.add(screened.mul(float(1).sub(under)));
    const lit = mirrored_
      .add(emit)
      .add(coreGlow)
      .mul(float(1).sub(limbShade))
      .add(p2)
      .add(rim)
      .add(streak)
      .add(catchlight)
      .mul(U.fade);
    const reflectionOnly = screened.add(emit).add(coreGlow).add(p2).add(rim).add(streak).add(catchlight).toVar();
    if (glowOut) glowOut.assign(vec4(reflectionOnly.mul(mask).mul(U.fade), mask));

    // the film: thickness in grey, broken-up spots in red, the lipid layer's drift in blue
    const tearView = mix(vec3(film.r.mul(0.8)), vec3(1, 0.15, 0.1), dry).add(vec3(0, 0, film.g.mul(0.25)));

    const view = U.debugView;
    return select(
      view.equal(SPEC_VIEW),
      vec4(reflectionOnly, 1),
      select(
        view.equal(IRIS_VIEW),
        vec4(iris.albedo.mul(mask), mask),
        select(view.equal(TEAR_VIEW), vec4(tearView.mul(mask), mask), vec4(lit.mul(mask), mask)),
      ),
    );
  })();
  if (glowOut) {
    material.outputNode = shade;
    material.mrtNode = mrt({ emissive: glowOut });
  } else {
    material.fragmentNode = shade;
  }
  material.transparent = true;
  material.premultipliedAlpha = true;
  material.depthWrite = false;
  return material;
}
