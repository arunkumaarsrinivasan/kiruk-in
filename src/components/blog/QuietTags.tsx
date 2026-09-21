export function QuietTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
      {tags.join(" · ")}
    </p>
  );
}
