import { studioEnabled } from "@/lib/studio";
import {
  listPosts,
  readPost,
  writePost,
  createPost,
  deletePost,
  isCollection,
  isSafeSlug,
} from "@/lib/studio/posts";

/**
 * BLOGISM post CRUD (author-only, Node runtime — mutates the repo).
 *   GET    /api/studio/posts                     → list all posts
 *   GET    /api/studio/posts?collection&slug     → one post (frontmatter + body)
 *   POST   /api/studio/posts   {collection,title} → create draft, returns slug
 *   PUT    /api/studio/posts   {collection,slug,frontmatter,body} → save
 *   DELETE /api/studio/posts   {collection,slug,withAssets?}      → delete
 */
export const runtime = "nodejs";

function guard(): Response | null {
  return studioEnabled() ? null : Response.json({ error: "studio disabled" }, { status: 403 });
}

export async function GET(req: Request): Promise<Response> {
  const denied = guard();
  if (denied) return denied;
  const url = new URL(req.url);
  const collection = url.searchParams.get("collection");
  const slug = url.searchParams.get("slug");
  if (collection && slug) {
    if (!isCollection(collection) || !isSafeSlug(slug))
      return Response.json({ error: "bad collection or slug" }, { status: 400 });
    const post = readPost(collection, slug);
    if (!post) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(post);
  }
  return Response.json({ posts: listPosts() });
}

export async function POST(req: Request): Promise<Response> {
  const denied = guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { collection?: unknown; title?: unknown } | null;
  if (!isCollection(body?.collection) || typeof body?.title !== "string" || !body.title.trim()) {
    return Response.json({ error: "collection + title required" }, { status: 400 });
  }
  const slug = createPost(body.collection, body.title.trim());
  return Response.json({ ok: true, collection: body.collection, slug });
}

export async function PUT(req: Request): Promise<Response> {
  const denied = guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    collection?: unknown;
    slug?: unknown;
    frontmatter?: unknown;
    body?: unknown;
  } | null;
  if (
    !isCollection(body?.collection) ||
    !isSafeSlug(body?.slug) ||
    typeof body?.frontmatter !== "object" ||
    body.frontmatter === null ||
    typeof body?.body !== "string"
  ) {
    return Response.json({ error: "collection, slug, frontmatter, body required" }, { status: 400 });
  }
  writePost(body.collection, body.slug, body.frontmatter as Record<string, unknown>, body.body);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request): Promise<Response> {
  const denied = guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    collection?: unknown;
    slug?: unknown;
    withAssets?: unknown;
  } | null;
  if (!isCollection(body?.collection) || !isSafeSlug(body?.slug)) {
    return Response.json({ error: "collection + valid slug required" }, { status: 400 });
  }
  const ok = deletePost(body.collection, body.slug, body.withAssets === true);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
