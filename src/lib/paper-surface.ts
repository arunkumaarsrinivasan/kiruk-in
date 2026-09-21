/**
 * Path gates for reading vs authoring vs the rest of the site.
 *
 * Desk = private paper author tool (except /desk/preview, which shares the
 * public Era reading surface). Notebook = public Era-themed reading.
 * Both opt out of site Navbar / EraShell / HelpBot.
 *
 * Legacy prefixes stay so a missed redirect still gets the right shell.
 */
export function isDeskPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/desk" ||
    pathname.startsWith("/desk/") ||
    pathname === "/blogism" ||
    pathname.startsWith("/blogism/") ||
    pathname === "/studio" ||
    pathname.startsWith("/studio/")
  );
}

export function isDeskPreviewPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/desk/preview" ||
    pathname === "/blogism/preview" ||
    pathname === "/studio/preview"
  );
}

export function isNotebookPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/notebook" ||
    pathname.startsWith("/notebook/") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/notes" ||
    pathname.startsWith("/notes/")
  );
}

export function isPaperSurface(pathname: string | null | undefined): boolean {
  return isDeskPath(pathname) || isNotebookPath(pathname);
}
