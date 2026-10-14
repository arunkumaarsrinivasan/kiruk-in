import { WorkOS } from "@/components/modules/work-os/WorkOS";

/** Era desktop filling the viewport under the navbar — no page chrome of its own. */
export function WorkDesktop({ title, focusId }: { readonly title: string; readonly focusId?: string }) {
  return (
    <section
      data-blueprint="desktop"
      aria-label="Projects desktop"
      className="relative z-10 overflow-hidden"
      style={{ height: "calc(100dvh - var(--simple-game-nav-bottom, 4.5rem) - var(--eye-lid-bottom, 0px))", minHeight: 520 }}
    >
      <h1 className="sr-only">{title}</h1>
      <WorkOS focusId={focusId} />
    </section>
  );
}
