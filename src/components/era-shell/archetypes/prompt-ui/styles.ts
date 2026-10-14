/**
 * 2026 home stylesheet, scoped under .r26. A dark room, one eye, and the
 * lens its pupil opens into.
 */

export const CSS = `
.r26 {
  --room: var(--bg-main, #060606);
  --ink: var(--text-main, #ecebe8);
  --muted: var(--text-muted, #8d8a84);
  --line: var(--border-color, #232326);
  --ivory: #e9dcc6;
  --lens: #0e0e10;
  --lens-text: #ecebe8;
  --lens-say: #cfccc5;
  --lens-muted: #8d8a84;
  --lens-line: #232326;
  --iris: clamp(170px, 32vmin, 300px);
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  background: radial-gradient(60vmax 60vmax at 50% 50%, #0e0d0c 0%, var(--room) 60%);
  color: var(--ink);
  overflow: clip;
  font-family: var(--font-main);
}
.r26-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.r26-stage {
  /* main already reserves the eye lid, so the stage fills the rest of the viewport */
  height: calc(100dvh - var(--eye-lid-bottom, 58px));
  box-sizing: border-box;
  padding-top: var(--simple-game-nav-bottom, 56px);
  display: flex;
}
.r26-field {
  position: relative;
  flex: 1;
  min-height: 0;
}

/* ── the eye ───────────────────────────────────────────────────────── */
.r26-pupil {
  position: absolute;
  left: 50%;
  top: 46%;
  width: var(--iris);
  height: var(--iris);
  translate: -50% -50%;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.r26-pupil svg { display: block; width: 100%; height: 100%; overflow: visible; }
.r26-pupil:focus-visible {
  outline: 1px solid var(--ivory);
  outline-offset: 8px;
}
.r26-iris, .r26-glint {
  transition: transform 420ms var(--ease-out);
}
.r26-pupil-disc {
  transform: scale(var(--pupil, 1));
  transition: transform 520ms var(--ease-out);
}
/* hippus: a resting pupil is never perfectly still */
.r26-pupil[data-mode="resting"] .r26-pupil-disc circle {
  transform-origin: 0 0;
  animation: r26-hippus 6.4s ease-in-out infinite;
}
@keyframes r26-hippus {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(1.05); }
  70% { transform: scale(0.97); }
}
.r26-pupil[data-mode="thinking"] .r26-pupil-disc { transition-duration: 240ms; }

/* ── under the eye: the question line, the state word, suggestions ── */
.r26-under {
  position: absolute;
  left: 50%;
  top: calc(46% + var(--iris) / 2 + 22px);
  width: min(560px, calc(100vw - 32px));
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: opacity 160ms var(--ease-out);
}
.r26-under[data-hidden] { opacity: 0; pointer-events: none; }
.r26-under form { width: 100%; }
.r26-ask {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--ink);
  caret-color: var(--ivory);
  font: 400 18px/1.4 var(--font-main);
  text-align: center;
  padding: 4px 0;
  outline: none;
}
.r26-ask::placeholder { color: transparent; }
.r26-ask:focus::placeholder { color: var(--muted); }
.r26-state {
  margin: 0;
  min-height: 1em;
  font: 500 11px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: var(--muted);
}
.r26-suggest {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 240ms var(--ease-out), transform 240ms var(--ease-out);
  pointer-events: none;
}
.r26-suggest[data-show] { opacity: 1; transform: none; pointer-events: auto; }
.r26-suggest button,
.r26-next button {
  font: 400 14px/1 var(--font-main);
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: border-color 150ms var(--ease-out), background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
}
.r26-suggest button:active,
.r26-next button:active { transform: scale(0.97); }
.r26-suggest button:focus-visible,
.r26-next button:focus-visible,
.r26-close:focus-visible,
.r26-link:focus-visible,
.r26-send:focus-visible {
  outline: 1px solid var(--ivory);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  .r26-suggest button:hover,
  .r26-next button:hover { border-color: #4a4843; background: rgba(255, 255, 255, 0.03); }
  .r26-close:hover { color: var(--lens-text); background: var(--lens-line); }
  .r26-link:hover .r26-link-label { text-decoration-color: var(--ivory); }
}

/* ── the lens ───────────────────────────────────────────────────────── */
.r26-lens {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100% - 24px);
  translate: -50% -50%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 28px;
  background: var(--lens);
  color: var(--lens-text);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.07),
    0 30px 80px -20px rgba(0, 0, 0, 0.8);
  z-index: 2;
}
.r26-lens-body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 28px 28px 22px;
  scrollbar-width: thin;
  scrollbar-color: var(--lens-line) transparent;
}
.r26-lens-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.r26-lens h2 {
  margin: 0;
  font: 500 20px/1.3 var(--font-main);
  letter-spacing: -0.01em;
  text-wrap: balance;
  outline: none;
}
.r26-close {
  flex: none;
  width: 36px;
  height: 36px;
  margin: -6px -8px 0 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--lens-muted);
  font: 400 22px/1 var(--font-main);
  cursor: pointer;
}
.r26-say { margin-top: 14px; }
.r26-say p {
  margin: 0 0 12px;
  font: 400 16px/1.6 var(--font-main);
  color: var(--lens-say);
  text-wrap: pretty;
}
.r26-links {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  border-top: 1px solid var(--lens-line);
}
.r26-links li { border-bottom: 1px solid var(--lens-line); }
.r26-link {
  display: grid;
  justify-items: start;
  gap: 3px;
  padding: 12px 0;
  color: var(--lens-text);
  text-decoration: none;
}
.r26-link-label {
  font: 500 15px/1.4 var(--font-main);
  text-decoration: underline;
  text-decoration-color: rgba(233, 220, 198, 0.35);
  text-underline-offset: 4px;
  transition: text-decoration-color 150ms var(--ease-out);
}
.r26-link-note {
  font: 400 13px/1.45 var(--font-main);
  color: var(--lens-muted);
}
.r26-next {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}
.r26-heard {
  margin: 16px 0 0;
  font: 500 11px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  color: var(--lens-muted);
}

/* contact note inside the lens */
.r26-draft { margin-top: 16px; display: grid; gap: 12px; }
.r26-draft .r26-input { display: grid; gap: 6px; }
.r26-draft .r26-input span {
  font: 500 11px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  color: var(--lens-muted);
}
.r26-draft input,
.r26-draft textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--lens-line);
  border-radius: 12px;
  background: #151517;
  color: var(--lens-text);
  font: 400 16px/1.5 var(--font-main);
  padding: 10px 12px;
  resize: vertical;
}
.r26-draft input:focus-visible,
.r26-draft textarea:focus-visible { outline: 1px solid var(--ivory); outline-offset: 1px; }
.r26-draft-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; }
.r26-send {
  border: 0;
  border-radius: 999px;
  padding: 11px 20px;
  background: var(--ivory);
  color: #0e0e10;
  font: 600 15px/1 var(--font-main);
  cursor: pointer;
  transition: opacity 150ms var(--ease-out), transform 120ms var(--ease-out);
}
.r26-send:active { transform: scale(0.97); }
.r26-send:disabled { opacity: 0.35; cursor: not-allowed; }
.r26-quiet { color: var(--lens-muted); font: 400 13px/1.4 var(--font-main); text-underline-offset: 3px; }
.r26-sent { margin: 16px 0 0; color: var(--lens-text); font: 500 15px/1.5 var(--font-main); }
.r26-error { margin: 0; color: #e8a08a; font: 400 13px/1.4 var(--font-main); }

@media (max-width: 480px) {
  .r26-lens { border-radius: 24px; }
  .r26-lens-body { padding: 22px 20px 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .r26-pupil[data-mode="resting"] .r26-pupil-disc circle { animation: none; }
  .r26-iris, .r26-glint, .r26-pupil-disc, .r26-suggest, .r26-under { transition: none; }
}
`;
