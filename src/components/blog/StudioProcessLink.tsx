import Link from "next/link";

/** Cross-link: notebook thinking → selected studio work. */
export function StudioProcessLink() {
  return (
    <p className="mt-10 text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
      Selected work lives in the{" "}
      <Link
        href="/work"
        className="underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70"
        style={{ color: "var(--text-main)" }}
      >
        studio
      </Link>
      .
    </p>
  );
}
