/**
 * The globe: a wet, lit ball in a socket, seen through the lids.
 *
 *  · Light. The era's screen is the key: in front of the face, up and to the
 *    left. Its colour is the screen's own 1×1 mip. The white is not chalk, so
 *    the light wraps past the terminator, red furthest, the way it does
 *    through any tissue that scatters.
 *  · The person. Vessels and mottling come from a per-person bake
 *    (bake/vessels.ts), looked up by the ball's own direction, so they turn
 *    with the gaze. Age yellows the exposed corners.
 *  · Wet. The tear film mirrors the screen: the reflected ray is traced to the
 *    screen's plane and the screen is sampled there, blurred by a mip bias for
 *    the roughness of conjunctiva under a tear film, weighted by Fresnel.
 *  · The socket. The upper lid rests on the ball and shades it; the lower lid
 *    a little; the corners are pockets almost no light reaches; the white
 *    reddens toward the lid margins. Measured from the same lid curves the
 *    lids are drawn with (lids.ts). At the inner corner the caruncle, the
 *    plica and their blush are laid over the white (canthus.ts).
 *
 * The iris and pupil here are a stand-in cap. P3 adds the cornea over them
 * and P4 replaces them with the refracted, baked iris.
 */

import { MeshBasicNodeMaterial, type RenderTarget } from "three/webgpu";
import { ANATOMY } from "../anatomy";
import { DEBUG_VIEWS, type EyeUniforms } from "../uniforms";
import { vesselNetUv, vesselUv, type VesselBake } from "../bake/vessels";
import { canthusField } from "./canthus";
import { inPanel, smoothstepDown, vnoise, type N } from "./common";
import { faceAngles, marginsAt, MARGIN_RADIUS, sideOf, socketShade3d } from "./margins";
import { sampleScreen, screenLight } from "./screen";
import { T } from "./tsl";

const {
  Fn,
  abs,
  atan,
  cameraPosition,
  clamp,
  dot,
  float,
  length,
  max,
  min,
  mix,
  normalLocal,
  normalWorld,
  positionWorld,
  pow,
  reflect,
  select,
  sin,
  smoothstep,
  sqrt,
  step,
  texture,
  vec2,
  vec3,
} = T;

const VIEW = (name: (typeof DEBUG_VIEWS)[number]) => DEBUG_VIEWS.indexOf(name);

export function scleraMaterial(Ux: EyeUniforms, screen: RenderTarget, vessels: VesselBake) {
  const U: N = Ux;

  const shade = Fn(() => {
    const nO = normalLocal.normalize().toVar(); // the ball's own frame: turns with the gaze
    const nW = normalWorld.normalize().toVar();
    const V = cameraPosition.sub(positionWorld).normalize().toVar();
    const NV = max(dot(nW, V), 0).toVar();

    // ---- the socket, measured from the lids' own margins ----------------------
    const sock = socketShade3d(positionWorld, Ux);
    const toRim = sock.toRim.toVar();
    const occl = sock.shade.toVar();

    // ---- the person's white ------------------------------------------------
    const ves = texture(vessels.target.texture, vesselUv(nO)).toVar();
    // the grown vessels (bake/vessel-net.ts): R deep, G on the surface
    const net = texture(vessels.net, vesselNetUv(nO)).toVar();
    const vesAmt = U.sclera.vessels.mul(toRim.mul(0.8).add(0.6)).mul(mix(float(1), float(1.3), smoothstepDown(-5, -10, positionWorld.x)));
    const albedo = vec3(U.sclera.tint).toVar();
    albedo.assign(mix(albedo, vec3(0.86, 0.8, 0.64), U.sclera.age.mul(0.35).mul(smoothstep(0.2, 0.8, abs(nO.x)))));
    albedo.mulAssign(ves.b.mul(0.12).add(0.94));
    // patchy brown melanosis near the limbus (bake/vessels.ts R)
    albedo.assign(mix(albedo, vec3(0.5, 0.36, 0.24), ves.r.mul(U.sclera.pigment).mul(0.6)));
    // (muted at the source, violet-red and brick red, so 1995's and 2003's
    // saturation never turns them neon: eye-anatomy rule 5)
    albedo.assign(mix(albedo, vec3(0.66, 0.4, 0.43), clamp(net.r.mul(vesAmt).mul(1.1), 0, 0.5))); // deep, broad, soft
    albedo.assign(mix(albedo, vec3(0.6, 0.13, 0.11), clamp(net.g.mul(vesAmt).mul(1.9), 0, 0.85))); // fine, red, sharp
    albedo.assign(mix(albedo, vec3(0.5, 0.4, 0.39), toRim.mul(0.55)));
    // the inner corner (canthus.ts): a pink blush on the white before the plica,
    // and the caruncle and the plica themselves, laid over the white at the end
    const corner = canthusField(positionWorld, Ux, screen);
    albedo.mulAssign(corner.blush);

    // ---- stand-in iris (P4 replaces) ----------------------------------------
    const rad = sqrt(max(float(1).sub(nO.z.mul(nO.z)), 0)).mul(U.ballRadius).div(ANATOMY.irisRadius).toVar();
    // The visible limbus is an ellipse (11.7 × 10.6 mm): the sclera overlaps
    // the cornea more above and below. The edge of the iris follows it; the
    // cornea's clear dome fades out over the same line (cornea.ts).
    const radE = length(vec2(nO.x, nO.y.div(ANATOMY.limbusAspect))).mul(U.ballRadius).div(ANATOMY.irisRadius).toVar();
    const front = step(0, nO.z);
    // R3: the limbus is a soft ramp, not a drawn ring. The sclera thins over
    // the dark uvea as it overlaps the cornea, so from just inside the iris's
    // edge to ~1.1 radii the white comes up out of the iris's own dark (the
    // user's photo: L* 18 → 24 → 34 → 56 → 73 over 0.90–1.10 R). The dark ring
    // and blue-grey halo that were here read as an outline.
    const irisMask = float(1).sub(smoothstep(0.94, 1.1, radE)).mul(front).toVar();
    // (the iris's own dark brown at its edge, as bright as the K–M body
    // renders through the cornea, so no ring darker than the iris shows where
    // the cornea fades into this)
    const iris = mix(vec3(0.03, 0.016, 0.01), vec3(0.075, 0.04, 0.022), smoothstep(U.pupil, 1, rad)).toVar();
    // the thin sclera over the uvea is a cool grey before it is white
    iris.assign(mix(iris, vec3(0.24, 0.23, 0.23), smoothstep(0.96, 1.06, radE).mul(0.7)));
    const pupil = float(1).sub(smoothstep(U.pupil.sub(0.012), U.pupil.add(0.012), rad)).mul(front);
    const base = mix(albedo, iris, irisMask).toVar();
    base.assign(mix(base, vec3(0.008), pupil));
    // Pigment at the limbus, as dark eyes carry it: a faint warm band, and
    // above and below the palisades of Vogt, fine radial ridges of it reaching
    // a little way onto the white (strongest where the sclera overlaps most).
    {
      const band = smoothstep(0.99, 1.02, radE).mul(float(1).sub(smoothstep(1.03, 1.13, radE))).mul(front);
      const ang = atan(nO.y, nO.x);
      const vertical = smoothstep(0.35, 0.95, abs(sin(ang)));
      const ridges = smoothstep(0.5, 0.9, vnoise(vec2(ang.mul(70), radE.mul(9))));
      const reach = float(1).sub(smoothstep(1.02, mix(1.06, 1.13, ridges), radE));
      base.assign(mix(base, vec3(0.42, 0.32, 0.25), band.mul(0.22).add(ridges.mul(vertical).mul(reach).mul(front).mul(0.26))));
    }

    // ---- light ----------------------------------------------------------------
    const D = U.light.dir;
    const NL = dot(nW, D);
    // (R11 area light: wraps further under a big device, as on the skin)
    const wrapW = vec3(0.42, 0.3, 0.24).mul(mix(float(0.8), float(1.3), smoothstep(0.15, 0.8, U.light.penumbra)));
    const diff = pow(clamp(vec3(NL).add(wrapW).div(wrapW.add(1)), 0, 1), vec3(1.6));
    const avg = screenLight(screen).toVar();
    const hue = avg.div(max(max(avg.r, avg.g), max(avg.b, 0.001)));
    const lum = U.screenLum;
    // Kept under 1 at its brightest: the filmic curve is for the screen's
    // reflection, and a white that already sits on the shoulder loses every
    // shadow the lids lay on it.
    // R3: the era's page is the light. As on the skin (lid-mesh.ts) and the
    // iris, its blurred picture in front of this point, mirrored, tints the
    // key where the white faces the screen.
    const avgLum = max(dot(avg, vec3(0.3, 0.55, 0.15)), 0.04);
    const throwUv = vec2(float(0.5).sub(positionWorld.x.div(72)), positionWorld.y.div(44).add(0.5));
    const thrown = clamp(sampleScreen(screen, clamp(throwUv, 0.02, 0.98), float(8).add(U.mip)).div(avgLum), 0.45, 2.2);
    const facesScreen = clamp(dot(nW, U.light.normal).negate().mul(2.5), 0, 1);
    const key = mix(vec3(1), hue, 0.3).mul(lum.mul(0.22).add(0.54)).mul(mix(vec3(1), thrown, facesScreen.mul(0.25)));
    const amb = mix(vec3(1), hue, 0.5).mul(lum.mul(0.1).add(0.07));
    // the globe falls into the socket's shadow toward its silhouette
    const socket = smoothstep(0.05, 0.75, NV).mul(0.5).add(0.5);
    // and the era's second light, if it has one
    const fill = vec3(U.fill.color).mul(clamp(dot(nW, U.fill.dir), 0, 1));
    const light = amb.add(key.mul(diff)).add(fill).mul(socket).mul(occl).toVar();

    // The cornea stands proud of the ball, so it shades the white beside it on
    // the side away from the screen and lends it a thin bright rim on the side
    // toward it. Without this the iris is a circle drawn on a ball.
    const cRad = rad.mul(ANATOMY.irisRadius / ANATOMY.corneaRadius);
    const beside = smoothstep(0.97, 1.3, cRad).mul(float(1).sub(smoothstep(1.3, 1.85, cRad))).mul(front);
    const towardKey = dot(nO.xy.normalize(), D.xy.normalize());
    // (gently: at 0.34 it laid a grey band on the white under the iris, which
    // the user's photo doesn't have)
    light.mulAssign(float(1).sub(beside.mul(clamp(towardKey.negate(), 0, 1)).mul(0.16)));
    light.addAssign(vec3(0.9, 0.92, 1).mul(beside).mul(clamp(towardKey, 0, 1)).mul(0.05));

    // ---- wet: the screen, mirrored --------------------------------------------
    // traced to the screen's rectangle, as the cornea does
    const R = reflect(V.negate(), nW);
    const Nn = U.light.normal;
    const denom = dot(R, Nn);
    const tHit = dot(U.light.center.sub(positionWorld), Nn).div(min(denom, -0.02));
    const hit = positionWorld.add(R.mul(tHit)).sub(U.light.center);
    const suv = vec2(
      dot(hit, U.light.right).div(U.light.size.x).add(0.5),
      dot(hit, U.light.up).div(U.light.size.y).add(0.5),
    ).toVar();
    const onPanel = inPanel(suv, 0.06).mul(step(denom, -0.02));
    // R11 near reflections, as in the cornea: off the page, a mirror ray may meet
    // the lids first; their skin, lit by the same screen, and the lash line's comb
    const rLid = MARGIN_RADIUS + 0.4;
    const pb = dot(R, positionWorld);
    const lidT = pb.negate().add(sqrt(max(pb.mul(pb).sub(dot(positionWorld, positionWorld).sub(rLid * rLid)), 0)));
    const lidAt = faceAngles(positionWorld.add(R.mul(lidT)));
    const lidM = marginsAt(sideOf(lidAt.phi, Ux), Ux);
    const lashOut = max(lidAt.theta.sub(lidM.up), lidM.lo.sub(lidAt.theta)).mul(rLid);
    const onLid = smoothstep(-0.1, 0.25, lashOut);
    const comb = smoothstep(0.3, 0.9, sin(lidAt.phi.mul(ANATOMY.eyeballRadius / 0.22)).mul(0.5).add(0.5));
    const lashLine = smoothstepDown(2.5, 0.2, lashOut).mul(mix(float(0.55), float(1), comb));
    const lidSkin = vec3(0.1, 0.062, 0.046).mul(key).mul(0.55).mul(float(1).sub(lashLine.mul(0.8)));
    const mirror = mix(lidSkin.mul(onLid), sampleScreen(screen, suv, float(4.2).add(U.mip)), onPanel);
    const F0 = 0.025;
    const fres = float(F0).add(pow(float(1).sub(NV), 5).mul(1 - F0));
    // the stand-in iris is not wet: P3's cornea carries its reflection
    const spec = mirror
      .mul(fres.mul(3).add(0.35))
      .mul(U.reflect)
      .mul(0.3)
      .mul(occl)
      .mul(float(1).sub(irisMask))
      .toVar();

    const final = mix(base.mul(light).add(spec).mul(U.fade), corner.rgb, corner.tissue.mul(float(1).sub(irisMask)));
    const view = U.debugView;
    return select(
      view.equal(VIEW("normal")),
      nW.mul(0.5).add(0.5),
      select(
        view.equal(VIEW("lit")),
        light,
        select(
          view.equal(VIEW("masks")),
          vec3(net.r, net.g, ves.b),
          select(
            view.equal(VIEW("spec")),
            spec.mul(4),
            select(view.equal(VIEW("socket")), vec3(occl, toRim, 0), final),
          ),
        ),
      ),
    );
  });

  const material = new MeshBasicNodeMaterial();
  material.name = "Sclera";
  material.colorNode = shade();
  return material;
}
