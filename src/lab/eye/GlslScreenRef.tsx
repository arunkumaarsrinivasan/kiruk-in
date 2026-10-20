"use client";

/**
 * The live eye's screen pass (ERA_UI_FRAG), run on its own WebGL canvas at the
 * screen's exact resolution, from the same ScreenDriver state the TSL stage
 * uses. Laid over the TSL stage's "screen" view, it is the parity check for
 * P1: flip between them, or difference them and look for anything not black.
 *
 * Both sides show the pass as stored, with no grade, so they compare raw.
 */

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ThemeConfig } from "@/data/portfolio-data";
import { ERA_EYE_VERT, ERA_UI_FRAG } from "@/components/three/era-eye-shader";
import { createEraScreenTexture } from "@/components/three/era-screen-texture";
import { getEraVisual } from "@/lib/era-visuals";
import { ScreenDriver, type ScreenState } from "@/components/three/eye/rig/screen";
import { eraPalette, paletteColors } from "@/components/three/eye/look";
import { UI_H, UI_W } from "@/components/three/eye/nodes/screen";

interface Props {
  era: ThemeConfig;
  reduce: boolean;
  /**
   * The TSL stage's own screen state. When it is there the reference copies
   * it rather than running a clock of its own, so scroll, caret and every
   * damped amount are the same frame on both sides.
   */
  source?: () => ScreenState | null;
  style?: React.CSSProperties;
}

export default function GlslScreenRef({ era, reduce, source, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const live = useRef({ era, reduce, source });
  live.current = { era, reduce, source };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(1);
    renderer.setSize(UI_W, UI_H, false);

    const code = createEraScreenTexture();
    const driver = new ScreenDriver();
    const uniforms = {
      uCodeTex: { value: code.texture },
      uTime: { value: 0 },
      uUiBg: { value: new THREE.Color() },
      uUiInk: { value: new THREE.Color() },
      uUiPanel: { value: new THREE.Color() },
      uUiAccent: { value: new THREE.Color() },
      uUiBar: { value: new THREE.Color() },
      uStyleA: { value: 2 },
      uStyleB: { value: 2 },
      uStyleMix: { value: 1 },
      uScroll: { value: 0 },
      uUiScan: { value: 0 },
      uUiPixel: { value: 0 },
      uUiDither: { value: 0 },
      uUiPosterize: { value: 0 },
      uUiGlow: { value: 0 },
      uUiWobble: { value: 0 },
      uUiWarp: { value: 0 },
      uUiTech: { value: 0 },
      uUiPx: { value: new THREE.Vector2(1 / UI_W, 1 / UI_H) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: ERA_EYE_VERT,
      fragmentShader: ERA_UI_FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let painted = "";
    let raf = 0;
    let last = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { era: e, reduce: r, source: src } = live.current;
      const pal = eraPalette(e);
      if (painted !== e.id) {
        painted = e.id;
        code.update(e.id, pal);
      }
      const shared = src?.() ?? null;
      if (!shared) driver.update(dt, getEraVisual(e.id), paletteColors(pal), r);
      const s = shared ?? driver.state;
      uniforms.uTime.value = s.time;
      uniforms.uUiBg.value.copy(s.bg);
      uniforms.uUiInk.value.copy(s.ink);
      uniforms.uUiPanel.value.copy(s.panel);
      uniforms.uUiAccent.value.copy(s.accent);
      uniforms.uUiBar.value.copy(s.bar);
      uniforms.uStyleA.value = s.styleA;
      uniforms.uStyleB.value = s.styleB;
      uniforms.uStyleMix.value = s.styleMix;
      uniforms.uScroll.value = s.scroll;
      uniforms.uUiScan.value = s.scan;
      uniforms.uUiPixel.value = s.pixel;
      uniforms.uUiDither.value = s.dither;
      uniforms.uUiPosterize.value = s.posterize;
      uniforms.uUiGlow.value = s.glow;
      uniforms.uUiWobble.value = s.wobble;
      uniforms.uUiWarp.value = s.warp;
      uniforms.uUiTech.value = s.tech;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      code.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={style}
    />
  );
}
