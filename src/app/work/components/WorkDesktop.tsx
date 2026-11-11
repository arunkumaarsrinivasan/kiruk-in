import { WorkOS } from "@/components/modules/work-os/WorkOS";
import type { WorkCaseDigest } from "@/components/modules/work-os/types";

/** Era desktop filling the viewport under the navbar — no page chrome of its own. */
export function WorkDesktop({
  title,
  focusId,
  titled = true,
  cases,
}: {
  readonly title: string;
  readonly focusId?: string;
  readonly titled?: boolean;
  /** The full cases, for a desktop that shows them inside itself (1970's tube). */
  readonly cases?: readonly WorkCaseDigest[];
}) {
  return (
    <section
      data-blueprint="desktop"
      aria-label="Projects desktop"
      className="relative z-10 overflow-hidden"
      style={{ height: "calc(100dvh - var(--simple-game-nav-bottom, 4.5rem) - var(--eye-lid-bottom, 0px))", minHeight: 520 }}
    >
      {titled ? <h1 className="sr-only">{title}</h1> : null}
      <WorkOS focusId={focusId} cases={cases} />
    </section>
  );
}
