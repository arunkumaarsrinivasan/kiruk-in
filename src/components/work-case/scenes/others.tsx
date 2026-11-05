"use client";

import { FileText, Layers, Printer, ShieldCheck, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { Bar, Phone, Stage, Window } from "@/components/stageshow";
import type { SceneProps } from "./types";
import "./others.css";

/*
 * HP and Square Bridge, as quiet stills until the real PNGs land
 * (docs/WORK_CASES_PLAN.md lists the files). HP screens are under NDA, so
 * its scenes stay abstract: bars where an internal screen would be, real
 * words only for what is public.
 */

const W = 560;
const H = 340;
const COMPACT = { below: 520, width: 358, height: 320 };

function Scene({ look, still: _still, kind, accent, children }: SceneProps & { kind: string; accent: string; children: ReactNode }) {
  return (
    <div className="ot-scene" data-kind={kind} data-look={look.mode} style={{ ...look.style, "--ot-accent": look.mode === "phosphor" ? "var(--sp-fg)" : accent } as React.CSSProperties}>
      <Stage width={W} height={H} compact={COMPACT} theme={look.theme} tokens={look.tokens}>
        {() => <>{children}</>}
      </Stage>
    </div>
  );
}

const HP = "#0096d6";
const SB = "#2f6fed";

function Nda() {
  return <span className="ot-nda">Abstract · screens under NDA</span>;
}

/* ── HP ─────────────────────────────────────────────────── */

export function HpTrust(props: SceneProps) {
  return (
    <Scene {...props} kind="trust" accent={HP}>
      <Window title="Print" className="ot-win ot-trust__win">
        <div className="ot-trust__body">
          <div className="ot-trust__page">
            <Bar w={120} h={8} tone={4} />
            <Bar w={170} h={6} tone={2} />
            <Bar w={150} h={6} tone={2} />
            <div className="ot-trust__img" />
            <Bar w={160} h={6} tone={2} />
            <Bar w={110} h={6} tone={2} />
          </div>
          <div className="ot-trust__side">
            <div className="ot-trust__note">
              <span className="ot-dot" />
              <Bar w={130} h={6} tone={3} />
            </div>
            <Bar w={150} h={6} tone={2} />
            <Bar w={120} h={6} tone={2} />
            <span className="ot-btn">
              <Printer size={13} strokeWidth={2} />
              Print
            </span>
          </div>
        </div>
      </Window>
      <Nda />
    </Scene>
  );
}

export function HpMudra(props: SceneProps) {
  const swatches = ["#0b1f3a", "#0096d6", "#5fc3ef", "#e9f5fb", "#f4f4f4", "#1d1d1f"];
  return (
    <Scene {...props} kind="mudra" accent={HP}>
      <Window title="Mudra" className="ot-win ot-mudra__win">
        <div className="ot-mudra__body">
          <div className="ot-mudra__swatches">
            {swatches.map((c) => (
              <span key={c} style={{ background: props.look.mode === "phosphor" ? "transparent" : c }} />
            ))}
          </div>
          <div className="ot-mudra__parts">
            <span className="ot-btn">Generate</span>
            <span className="ot-field">
              <Bar w={110} h={6} tone={2} />
            </span>
            <span className="ot-toggle" />
          </div>
          <div className="ot-mudra__grid">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="ot-tile" />
            ))}
          </div>
        </div>
      </Window>
      <Nda />
    </Scene>
  );
}

function PhoneScreen({ children, look }: { children: ReactNode; look: SceneProps["look"] }) {
  return (
    <Phone width={300} frame={look.mode === "phosphor" ? "outline" : "pro"} dark={look.mode !== "product-light"} wallpaper="var(--sp-bg)" className="ot-phone">
      <div className="ot-phone__screen">{children}</div>
    </Phone>
  );
}

export function HpPrints(props: SceneProps) {
  return (
    <Scene {...props} kind="prints" accent={HP}>
      <PhoneScreen look={props.look}>
        <div className="ot-prints__title">Get my Prints</div>
        <div className="ot-card ot-prints__file">
          <Upload size={15} strokeWidth={2} />
          <Bar w={120} h={7} tone={3} />
        </div>
        <div className="ot-card">
          <Bar w={90} h={6} tone={3} />
          <Bar w={150} h={6} tone={2} />
        </div>
        <div className="ot-card">
          <Bar w={110} h={6} tone={3} />
          <Bar w={70} h={6} tone={2} />
        </div>
        <span className="ot-btn ot-btn--wide">Deliver to my door</span>
      </PhoneScreen>
      <Nda />
    </Scene>
  );
}

export function HpPlc(props: SceneProps) {
  return (
    <Scene {...props} kind="plc" accent="#25d366">
      <PhoneScreen look={props.look}>
        <div className="ot-plc__head">Print Learn Center</div>
        <div className="ot-plc__thread">
          <div className="ot-bubble ot-bubble--me">Worksheet for class 2</div>
          <div className="ot-bubble">
            <span className="ot-plc__pdf">
              <FileText size={16} strokeWidth={2} />
              <Bar w={96} h={6} tone={3} />
            </span>
          </div>
          <div className="ot-bubble">
            <Bar w={140} h={6} tone={2} />
          </div>
        </div>
      </PhoneScreen>
    </Scene>
  );
}

/* ── Square Bridge ──────────────────────────────────────── */

export function SbPersonas(props: SceneProps) {
  const people = ["Student", "Recruiter", "Placement officer"];
  return (
    <Scene {...props} kind="personas" accent={SB}>
      <div className="ot-personas">
        {people.map((p) => (
          <div key={p} className="ot-card ot-persona">
            <span className="ot-avatar" />
            {p}
          </div>
        ))}
        <svg className="ot-personas__lines" viewBox="0 0 560 340" aria-hidden>
          <path d="M190 78 C 260 78, 260 170, 300 170" />
          <path d="M190 170 L 300 170" />
          <path d="M190 262 C 260 262, 260 170, 300 170" />
        </svg>
        <div className="ot-card ot-bridge">
          <Layers size={16} strokeWidth={2} />
          Square Bridge
        </div>
      </div>
    </Scene>
  );
}

export function SbResearch(props: SceneProps) {
  return (
    <Scene {...props} kind="research" accent={SB}>
      <div className="ot-research">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="ot-session" data-focus={i === 9 || undefined}>
            <span className="ot-avatar ot-avatar--sm" />
            {i === 9 ? <Bar w={60} h={6} tone={3} /> : null}
          </span>
        ))}
        <div className="ot-research__big">
          <b>200+</b>
          <span>candidates tested</span>
        </div>
      </div>
    </Scene>
  );
}

export function SbPortfolio(props: SceneProps) {
  return (
    <Scene {...props} kind="portfolio" accent={SB}>
      <Window title="Portfolio builder" className="ot-win ot-portfolio__win">
        <div className="ot-portfolio__body">
          <div className="ot-portfolio__who">
            <span className="ot-avatar ot-avatar--lg" />
            <div>
              <Bar w={120} h={8} tone={4} />
              <Bar w={80} h={6} tone={2} />
            </div>
          </div>
          {[150, 120, 170].map((w, i) => (
            <div key={w} className="ot-card ot-portfolio__item">
              <Bar w={w} h={6} tone={3} />
              {i < 2 ? (
                <span className="ot-verified">
                  <ShieldCheck size={12} strokeWidth={2.2} />
                  Verified
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Window>
    </Scene>
  );
}

export function SbSystem(props: SceneProps) {
  return (
    <Scene {...props} kind="system" accent={SB}>
      <div className="ot-system">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="ot-screen">
            <Bar w={40 + ((i * 17) % 40)} h={5} tone={3} />
            <Bar w={60 + ((i * 23) % 30)} h={4} tone={2} />
            <span className="ot-screen__block" />
          </div>
        ))}
        <div className="ot-research__big ot-system__big">
          <b>150+</b>
          <span>screens, one system</span>
        </div>
      </div>
    </Scene>
  );
}

export function SbShip(props: SceneProps) {
  const kpis = [
    ["45%", "student engagement"],
    ["40%", "faster discovery"],
    ["35%", "less officer workload"],
  ];
  return (
    <Scene {...props} kind="sbship" accent={SB}>
      <Window title="Placement dashboard" className="ot-win ot-sbship__win">
        <div className="ot-sbship__kpis">
          {kpis.map(([v, l]) => (
            <div key={l} className="ot-card ot-kpi">
              <b>{v}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <div className="ot-sbship__rows">
          {[160, 120, 140].map((w) => (
            <div key={w} className="ot-sbship__row">
              <span className="ot-avatar ot-avatar--sm" />
              <Bar w={w} h={6} tone={3} />
              <span className="ot-verified">
                <ShieldCheck size={12} strokeWidth={2.2} />
              </span>
            </div>
          ))}
        </div>
      </Window>
    </Scene>
  );
}
