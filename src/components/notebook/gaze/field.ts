"use client";

export type FieldMode = "dock";

export type GazeZone =
  | "lamp"
  | "title"
  | "meta"
  | "search"
  | "tty"
  | "banner"
  | "kicker"
  | "back"
  | "excerpt"
  | "prose"
  | "void";

const ZONES: GazeZone[] = [
  "lamp",
  "title",
  "meta",
  "search",
  "tty",
  "banner",
  "kicker",
  "back",
  "excerpt",
  "prose",
  "void",
];

export const field = {
  mx: -1,
  my: -1,
  vx: 0,
  vy: 0,
  hover: null as HTMLElement | null,
  title: null as HTMLElement | null,
  lamp: null as HTMLElement | null,
  near: null as HTMLElement | null,
  inside: false,
  pull: 0,
  attractX: -1,
  attractY: -1,
  enterT: 0,
  zone: "void" as GazeZone,
  zoneEl: null as HTMLElement | null,
  icon: null as string | null,
  snap: false,
  spread: 0,
  fadeEl: null as HTMLElement | null,
  fadeSpread: 0,
  ring: false,
};

let lastX = -1;
let lastY = -1;
let lastT = 0;
let bound = 0;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function isZone(v: string | null): v is GazeZone {
  return !!v && (ZONES as string[]).includes(v);
}

function clearField() {
  field.mx = -1;
  field.my = -1;
  field.hover = null;
  field.title = null;
  field.lamp = null;
  field.near = null;
  field.inside = false;
  field.pull = 0;
  field.attractX = -1;
  field.attractY = -1;
  field.zone = "void";
  field.zoneEl = null;
  field.icon = null;
  field.snap = false;
  field.ring = false;
}

function toVoid() {
  field.lamp = null;
  field.title = null;
  field.hover = null;
  field.inside = false;
  field.near = null;
  field.pull = 0;
  field.attractX = -1;
  field.attractY = -1;
  field.zone = "void";
  field.zoneEl = null;
  field.icon = null;
}

function applyLamp(lamp: HTMLElement) {
  const r = lamp.getBoundingClientRect();
  const was = field.inside && field.zone === "lamp";
  const title = (lamp.closest(".gaze-hit")?.querySelector(".gaze-title") as HTMLElement | null) ?? null;
  field.zone = "lamp";
  field.zoneEl = lamp;
  field.lamp = lamp;
  field.near = lamp;
  field.attractX = r.left + r.width / 2;
  field.attractY = r.top + r.height / 2;
  field.pull = 1;
  field.title = title;
  field.hover = null;
  field.inside = true;
  field.icon = lamp.getAttribute("data-icon");
  if (!was) {
    field.enterT = performance.now();
    document.dispatchEvent(new Event("notebook-eye-enter"));
  }
}

function applyZone(el: HTMLElement, zone: GazeZone, x: number, y: number) {
  const r = el.getBoundingClientRect();
  field.zone = zone;
  field.zoneEl = el;
  field.lamp = null;
  field.inside = false;
  field.near = el;
  field.pull = 0;
  field.icon = zone === "search" ? "solid/search-solid.svg" : null;
  field.title = zone === "title" ? el : null;
  field.hover = zone === "title" ? el : null;
  if (zone === "search") {
    field.attractX = clamp(x, r.left, r.right);
    field.attractY = r.top + r.height / 2;
    return;
  }
  if (zone === "excerpt" || zone === "prose") {
    field.attractX = clamp(x, r.left, r.right);
    field.attractY = clamp(y, r.top, r.bottom);
    return;
  }
  field.attractX = r.left + r.width / 2;
  field.attractY = r.top + r.height / 2;
}

function hit(x: number, y: number) {
  const node = document.elementFromPoint(x, y);
  if (!(node instanceof Element)) {
    clearField();
    return;
  }

  const chrome = node.closest(".proto-picker, .proto-controls, [data-gaze-ignore], .site-chrome");
  if (chrome) {
    clearField();
    return;
  }

  field.mx = x;
  field.my = y;
  field.snap = false;

  const mark = node.closest(".era-mark, .era-zig, .era-hit");
  if (mark) {
    toVoid();
    field.ring = true;
    return;
  }

  // Body text → hollow pixel ring so the glyphs stay readable under the cursor.
  const textEl = node.closest(
    [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "li",
      "blockquote",
      "figcaption",
      ".era-lede",
      ".era-note",
      "[data-zone='prose']",
      "[data-zone='excerpt']",
      "[data-zone='meta']",
    ].join(", "),
  );
  if (
    textEl &&
    !node.closest(
      "a, button, input, select, textarea, [role='button'], .era-toc, .site-chrome, [data-gaze-ignore]",
    )
  ) {
    toVoid();
    field.ring = true;
    return;
  }
  field.ring = false;

  const zoneEl = node.closest("[data-zone]") as HTMLElement | null;
  const raw = zoneEl?.getAttribute("data-zone") ?? "";
  if (zoneEl && isZone(raw) && raw !== "void") {
    if (raw === "excerpt" || raw === "prose" || raw === "meta") {
      toVoid();
      field.ring = true;
      return;
    }
    if (raw === "lamp") {
      applyLamp(zoneEl);
      return;
    }
    applyZone(zoneEl, raw, x, y);
    return;
  }

  toVoid();
}

function onPoint(e: PointerEvent) {
  const now = performance.now();
  const dt = Math.max(8, now - lastT);
  if (lastX >= 0) {
    field.vx = (field.vx + (e.clientX - lastX) / dt) * 0.5;
    field.vy = (field.vy + (e.clientY - lastY) / dt) * 0.5;
  }
  lastX = e.clientX;
  lastY = e.clientY;
  lastT = now;
  hit(e.clientX, e.clientY);
}

export function bindHover(el: HTMLElement | null, title: HTMLElement | null) {
  if (!title) {
    if (field.snap) toVoid();
    field.snap = false;
    return;
  }
  field.snap = true;
  applyZone(title, "title", field.mx, field.my);
  field.title = title;
  field.hover = title;
}

export function releaseGaze() {
  toVoid();
  field.snap = false;
}

export function attachPointer() {
  bound += 1;
  if (bound === 1) {
    addEventListener("pointermove", onPoint, { passive: true, capture: true });
    addEventListener("pointerdown", onPoint, { passive: true, capture: true });
  }
  return () => {
    bound -= 1;
    if (bound <= 0) {
      bound = 0;
      removeEventListener("pointermove", onPoint, { capture: true } as EventListenerOptions);
      removeEventListener("pointerdown", onPoint, { capture: true } as EventListenerOptions);
      lastX = -1;
      lastY = -1;
    }
  };
}
