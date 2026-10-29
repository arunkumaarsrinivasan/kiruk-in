/**
 * What the eye hears from the visitor: the pointer, focus and the page's
 * visibility (env.ts `EyeEnv.listen`). Kept apart from env.ts because the
 * page side of a worker stage (EyeStageWorker) forwards these as messages
 * and must not load three to do it.
 */

/** Where the pointer is: CSS px from the view's top left, and what it is (mouse, touch, pen). */
export interface EyePointer {
  clientX: number;
  clientY: number;
  pointerType: string;
}

/** What the stage hears. Each is optional; only those given are listened for. */
export interface EyeListeners {
  move?: (p: EyePointer) => void;
  down?: (p: EyePointer) => void;
  /** Lifted or cancelled. */
  up?: () => void;
  /** The pointer left an element; `left` when it left the page altogether (no element it went to). */
  out?: (p: { pointerType: string; left: boolean }) => void;
  /** The window lost focus. */
  blur?: () => void;
  visibility?: (hidden: boolean) => void;
}

/** One of those, as a message: how a page forwards them to a worker. */
export type EyeInputEvent =
  | ({ type: "move" | "down" } & EyePointer)
  | { type: "up" }
  | { type: "out"; pointerType: string; left: boolean }
  | { type: "blur" }
  | { type: "visibility"; hidden: boolean };

/**
 * The page's listeners, as the stage always set them: pointer and focus on
 * the window (passive), visibility on the document. Returns the unsubscribe.
 */
export function listenPage(on: EyeListeners): () => void {
  const offs: (() => void)[] = [];
  const add = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, passive = true) => {
    window.addEventListener(type, fn, passive ? { passive: true } : undefined);
    offs.push(() => window.removeEventListener(type, fn));
  };
  if (on.move) add("pointermove", on.move);
  if (on.down) add("pointerdown", on.down);
  if (on.up) {
    const up = on.up;
    add("pointerup", () => up());
    add("pointercancel", () => up());
  }
  if (on.out) {
    const out = on.out;
    add("pointerout", (e) => out({ pointerType: e.pointerType, left: !e.relatedTarget }));
  }
  if (on.blur) {
    const blur = on.blur;
    add("blur", () => blur(), false);
  }
  if (on.visibility) {
    const vis = on.visibility;
    const sync = () => vis(document.hidden);
    document.addEventListener("visibilitychange", sync);
    offs.push(() => document.removeEventListener("visibilitychange", sync));
  }
  return () => {
    for (const off of offs) off();
  };
}

/** Feeds one of those messages to a stage's listeners (the worker's side of `forwardInput`). */
export function dispatchInput(on: EyeListeners, e: EyeInputEvent) {
  if (e.type === "move") on.move?.(e);
  else if (e.type === "down") on.down?.(e);
  else if (e.type === "up") on.up?.();
  else if (e.type === "out") on.out?.(e);
  else if (e.type === "blur") on.blur?.();
  else if (e.type === "visibility") on.visibility?.(e.hidden);
}

/**
 * The page's side of a worker stage: forwards what the stage would hear on
 * the page (the same listeners, `listenPage`) as messages. Returns the unsubscribe.
 */
export function forwardInput(send: (e: EyeInputEvent) => void): () => void {
  return listenPage({
    move: (p) => send({ type: "move", clientX: p.clientX, clientY: p.clientY, pointerType: p.pointerType }),
    down: (p) => send({ type: "down", clientX: p.clientX, clientY: p.clientY, pointerType: p.pointerType }),
    up: () => send({ type: "up" }),
    out: (p) => send({ type: "out", ...p }),
    blur: () => send({ type: "blur" }),
    visibility: (hidden) => send({ type: "visibility", hidden }),
  });
}
