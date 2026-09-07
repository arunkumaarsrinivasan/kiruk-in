import { join } from "node:path";
import { tmpdir } from "node:os";

/** Temp file the studio editor stashes its MDX body in for live preview. */
export const PREVIEW_FILE = join(tmpdir(), "kiruk-studio-preview.mdx");
