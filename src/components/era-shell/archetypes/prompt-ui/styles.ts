/**
 * 2026 home stylesheet, scoped under .r26. A dark room, one dotted pupil,
 * and the answer it composes beneath itself.
 */

export const CSS = `
.r26 {
  --room: var(--bg-main, #fafafa);
  --ink: var(--text-main, #0b0b0b);
  --muted: var(--text-muted, #6b6863);
  --line: var(--border-color, #e2dfda);
  --mark: #0b0b0b;
  --say: #2d2b28;
  --eye-rest: 1;
  --eye-up: 0.5;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  /* the white of the eye: brightest where the pupil sits, a little shadow toward the lids */
  background: radial-gradient(120vmax 80vmax at 50% 42%, #ffffff 0%, #fbfbfa 42%, #eceae6 100%);
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

/* ── the pupil ─────────────────────────────────────────────────────── */
.r26-eye {
  position: absolute;
  left: 50%;
  top: 42%;
  width: var(--eye-w);
  height: var(--eye-h);
  transform: translate(-50%, -50%) scale(var(--eye-rest));
  transition: top 460ms var(--ease-out), transform 460ms var(--ease-out);
  z-index: 1;
}
/* In a conversation: the pupil rises to the top and shrinks to watch the answers. */
.r26-field[data-chatting] .r26-eye {
  top: 0;
  transform: translate(-50%, calc((var(--eye-h) * var(--eye-up) - var(--eye-h)) / 2)) scale(var(--eye-up));
}
.r26-pupil-hit {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 96px;
  height: 96px;
  margin: -48px 0 0 -48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.r26-pupil-hit:focus-visible {
  outline: 1px solid var(--mark);
  outline-offset: 6px;
}

/* ── the ask box ───────────────────────────────────────────────────── */
.r26-composer {
  position: absolute;
  left: 50%;
  top: calc(42% + var(--eye-h) * var(--eye-rest) / 2 - 18px);
  width: min(600px, calc(100vw - 32px));
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 3;
}
/* In a conversation it sits at the bottom of the eye, follow-ups above it. */
.r26-composer[data-docked] {
  top: auto;
  bottom: 12px;
  flex-direction: column-reverse;
  gap: 10px;
}
.r26-composer[data-docked]::before {
  /* the thread fades out under the box instead of being cut */
  content: "";
  position: absolute;
  inset: -56px -40px -14px;
  background: linear-gradient(to bottom, rgba(250, 250, 250, 0) 0, rgba(250, 250, 250, 0.97) 34%, #fafafa 100%);
  pointer-events: none;
  z-index: -1;
}
.r26-askbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 7px 0 18px;
  border: 1px solid #d9d6d0;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px -16px rgba(0, 0, 0, 0.18);
  transition: border-color 180ms var(--ease-out), box-shadow 220ms var(--ease-out);
}
.r26-askbar:focus-within {
  border-color: var(--mark);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 14px 32px -18px rgba(0, 0, 0, 0.35);
}
/* a tiny pupil at the start of the box: this is where you talk to it */
.r26-askbar-mark {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--mark) 0 2.2px, transparent 2.6px) 0 0 / 5px 5px;
  opacity: 0.85;
}
.r26-ask {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--ink);
  caret-color: var(--mark);
  font: 400 16px/1.4 var(--font-main);
  outline: none;
}
.r26-ask::placeholder { color: #9b978f; transition: color 180ms var(--ease-out); }
.r26-ask:focus::placeholder { color: #b9b5ad; }
.r26-send-btn {
  flex: none;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: var(--mark);
  color: #fafafa;
  cursor: pointer;
  transition: transform 120ms var(--ease-out);
}
.r26-send-btn:active { transform: scale(0.92); }
.r26-chiprow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.r26-composer[data-docked] .r26-chiprow { justify-content: space-between; }
.r26-suggest {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.r26-composer[data-docked] .r26-suggest { justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
.r26-end {
  flex: none;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: 500 12.5px/1 var(--font-main);
  padding: 8px 4px;
  cursor: pointer;
  transition: color 150ms var(--ease-out);
}

/* shared pill buttons */
.r26-suggest button,
.r26-chips button,
.r26-from button {
  flex: none;
  font: 400 14px/1 var(--font-main);
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--ink);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 150ms var(--ease-out), background-color 150ms var(--ease-out), box-shadow 180ms var(--ease-out), transform 160ms var(--ease-out);
}
.r26-suggest button:disabled { opacity: 0.45; cursor: default; }
.r26-suggest button:active,
.r26-chips button:active,
.r26-from button:active { transform: scale(0.97); }
.r26 button:focus-visible,
.r26 a:focus-visible {
  outline: 1px solid var(--mark);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  .r26-suggest button:not(:disabled):hover,
  .r26-chips button:hover,
  .r26-from button:hover { border-color: #8f8b84; transform: translateY(-1px); box-shadow: 0 6px 14px -10px rgba(0, 0, 0, 0.35); }
  .r26-item-main:hover .r26-item-title { text-decoration-color: var(--mark); }
  .r26-item-main:hover .r26-item-go { opacity: 1; transform: none; }
  .r26-item:hover { background: #f4f3f0; }
  .r26-open:hover { color: var(--ink); }
  .r26-close:hover { color: var(--ink); background: var(--line); transform: rotate(90deg); }
  .r26-end:hover { color: var(--ink); }
  .r26-summary:hover { border-color: #8f8b84; }
  .r26-fold:hover { color: var(--ink); }
}

/* ── the conversation ──────────────────────────────────────────────── */
.r26-thread {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--eye-h) * var(--eye-up) - 10px);
  bottom: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-padding-top: 8px;
  /* folding an old answer must not drag the view: we place it ourselves */
  overflow-anchor: none;
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
  padding: 4px 16px 150px;
  z-index: 2;
}
.r26-turn {
  width: min(640px, 100%);
  margin: 0 auto 26px;
  scroll-margin-top: 8px;
}
/* the visitor's words: right, in a dark bubble */
.r26-q {
  width: fit-content;
  max-width: min(78%, 460px);
  margin: 0 0 14px auto;
  padding: 10px 15px;
  border-radius: 18px 18px 5px 18px;
  background: var(--mark);
  color: #fafafa;
  font: 400 15px/1.45 var(--font-main);
  overflow-wrap: anywhere;
}
/* the pupil thinking: three dots breathing */
.r26-thinking {
  display: flex;
  gap: 6px;
  padding: 10px 2px;
}
.r26-thinking span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mark);
  animation: r26-breathe 900ms var(--ease-out) infinite;
}
@keyframes r26-breathe {
  0%, 100% { transform: scale(0.55); opacity: 0.35; }
  45% { transform: scale(1); opacity: 1; }
}
/* an older answer, folded to one line */
.r26-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #ffffff;
  color: var(--ink);
  font: 500 14.5px/1.3 var(--font-main);
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms var(--ease-out);
}
.r26-summary-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mark);
}
.r26-summary-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.r26-summary-title::first-letter { text-transform: uppercase; }
.r26-summary-open {
  font: 500 11px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.r26-fold {
  margin-top: 4px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: 500 12.5px/1 var(--font-main);
  padding: 6px 0;
  cursor: pointer;
}

/* ── an answer ─────────────────────────────────────────────────────── */
.r26-surface {
  width: 100%;
}
.r26-surface-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.r26-surface h2 {
  margin: 0;
  font: 500 22px/1.25 var(--font-main);
  letter-spacing: -0.01em;
  text-wrap: balance;
  outline: none;
}
.r26-surface h2::first-letter { text-transform: uppercase; }
.r26-close {
  flex: none;
  width: 36px;
  height: 36px;
  margin: -6px -8px 0 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  font: 400 22px/1 var(--font-main);
  cursor: pointer;
}
.r26-trace {
  margin: 8px 0 18px;
  font: 500 11px/1.5 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.r26-node {
  margin-bottom: 16px;
  animation: r26-in 300ms var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * 70ms);
}
@keyframes r26-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.r26-section {
  margin: 18px 0 0;
  padding-top: 18px;
  border-top: 1px dashed var(--line);
  font: 500 18px/1.3 var(--font-main);
}
.r26-section::first-letter { text-transform: uppercase; }
.r26-text { margin: 0; font: 400 16px/1.6 var(--font-main); color: var(--say); text-wrap: pretty; }
.r26-text-lead { font-size: 17px; color: var(--ink); }
.r26-text-note { font-size: 14px; color: var(--muted); }
.r26-quote {
  margin: 0;
  padding: 2px 0 2px 16px;
  border-left: 1px solid var(--mark);
  font: 400 17px/1.6 var(--font-main);
  color: var(--ink);
  text-wrap: pretty;
}
.r26-entity {
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #ffffff;
}
.r26-entity h3 { margin: 0; font: 500 17px/1.3 var(--font-main); }
.r26-entity-sub { margin: 6px 0 0; font: 400 15px/1.55 var(--font-main); color: var(--say); }
.r26-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  margin: 12px 0 0;
}
.r26-facts-block { margin: 0; }
.r26-facts dt {
  font: 500 10.5px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.r26-facts dd { margin: 4px 0 0; font: 400 14px/1.4 var(--font-main); color: var(--ink); }
.r26-entity-links { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 12px; }
.r26-open {
  font: 400 13px/1.4 var(--font-main);
  color: var(--muted);
  text-decoration: underline;
  text-decoration-color: rgba(11, 11, 11, 0.28);
  text-underline-offset: 3px;
}
.r26-list h4,
.r26-chips-label {
  margin: 0 0 6px;
  font: 500 10.5px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.r26-list ul,
.r26-list ol { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.r26-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 -10px;
  padding: 0 10px;
  border-bottom: 1px solid var(--line);
  border-radius: 10px;
  transition: background-color 150ms var(--ease-out);
}
.r26-item-go {
  position: absolute;
  right: 2px;
  top: 50%;
  margin-top: -10px;
  font: 400 15px/20px var(--font-main);
  color: var(--ink);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 160ms var(--ease-out), transform 200ms var(--ease-out);
}
.r26-item-main {
  position: relative;
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
  padding: 11px 24px 11px 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
}
div.r26-item-main { cursor: default; }
.r26-item-title {
  font: 500 15px/1.4 var(--font-main);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: text-decoration-color 150ms var(--ease-out);
}
.r26-item-note { font: 400 13.5px/1.45 var(--font-main); color: var(--muted); }
.r26-item-meta, .r26-when {
  font: 500 11px/1.4 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  color: var(--muted);
  white-space: nowrap;
}
.r26-chips, .r26-from { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.r26-chips-label { margin: 0 4px 0 0; }
.r26-from { animation: r26-in 300ms var(--ease-out) both; animation-delay: calc(var(--i, 0) * 70ms); margin-top: 22px; padding-top: 14px; border-top: 1px dashed var(--line); }
.r26-from button { font-size: 12.5px; padding: 6px 10px; color: var(--muted); }
.r26-compare { display: grid; border-top: 1px solid var(--line); }
.r26-compare > div {
  display: grid;
  grid-template-columns: minmax(70px, 0.6fr) 1fr 1fr;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font: 400 14px/1.45 var(--font-main);
  color: var(--say);
}
.r26-compare-head { color: var(--ink) !important; font-weight: 500 !important; }
.r26-compare [role="rowheader"] {
  font: 500 10.5px/1.6 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

/* contact note */
.r26-draft { margin-top: 16px; display: grid; gap: 12px; }
.r26-input { display: grid; gap: 6px; }
.r26-input span {
  font: 500 11px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.r26-draft input,
.r26-draft textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #ffffff;
  color: var(--ink);
  font: 400 16px/1.5 var(--font-main);
  padding: 10px 12px;
  resize: vertical;
}
.r26-draft-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; }
.r26-send {
  border: 0;
  border-radius: 999px;
  padding: 11px 20px;
  background: var(--mark);
  color: #fafafa;
  font: 600 15px/1 var(--font-main);
  cursor: pointer;
  transition: opacity 150ms var(--ease-out), transform 120ms var(--ease-out);
}
.r26-send:active { transform: scale(0.97); }
.r26-send:disabled { opacity: 0.35; cursor: not-allowed; }
.r26-quiet { color: var(--muted); font: 400 13px/1.4 var(--font-main); text-underline-offset: 3px; }
.r26-sent { margin: 16px 0 0; color: var(--ink); font: 500 15px/1.5 var(--font-main); }
.r26-error { margin: 0; color: #a83a22; font: 400 13px/1.4 var(--font-main); }

/* short screens: keep the eye, the question line and the suggestions between the lids */
@media (max-height: 800px) and (min-width: 481px) {
  /* short screens: smaller pupil while chatting, more room to read */
  .r26 { --eye-rest: 0.74; --eye-up: 0.36; }
}
@media (max-width: 760px) and (min-width: 481px) {
  .r26 { --eye-rest: 0.85; }
}
@media (max-width: 480px) {
  .r26 { --eye-rest: 0.6; --eye-up: 0.42; }
  .r26-surface h2 { font-size: 20px; }
  .r26-compare > div { grid-template-columns: 1fr 1fr; }
  .r26-compare [role="rowheader"] { grid-column: 1 / -1; }
}

@media (prefers-reduced-motion: reduce) {
  .r26-eye, .r26-askbar, .r26-item, .r26-item-go, .r26-suggest button { transition: none; }
  .r26-thinking span { animation: none; opacity: 0.6; transform: none; }
  .r26-node, .r26-from { animation: none; }
}
`;
