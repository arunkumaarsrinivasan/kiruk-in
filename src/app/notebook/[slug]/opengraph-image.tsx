import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getNotebookEntry } from "@/lib/content/notebook";

export const alt = "Kiruk notebook";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

const PHOTO = /\.(?:jpg|jpeg|png|webp)$/i;

function sharePhoto(src: string | undefined): Buffer | null {
  if (!src?.startsWith("/") || src.includes("..") || !PHOTO.test(src)) return null;
  const abs = join(process.cwd(), "public", src.slice(1));
  if (!existsSync(abs)) return null;
  return readFileSync(abs);
}

function firstBodyPhoto(body: string): string | undefined {
  return body.match(/src="(\/[^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1];
}

function dataUrl(file: Buffer, src: string): string {
  const ext = src.split(".").pop()?.toLowerCase();
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${type};base64,${file.toString("base64")}`;
}

export default async function OpengraphImage({ params }: Props) {
  const { slug } = await params;
  const post = getNotebookEntry(slug);
  const title = post?.summary.title ?? "Notebook";
  const photoSrc = post?.summary.coverImage ?? (post ? firstBodyPhoto(post.body) : undefined);
  const photo = sharePhoto(photoSrc);
  const titleSize = title.length > 48 ? 44 : title.length > 28 ? 54 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#000000",
          color: "#f4f4f2",
        }}
      >
        {photo && photoSrc ? (
          <img
            src={dataUrl(photo, photoSrc)}
            width={1200}
            height={630}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 300,
            display: "flex",
            background: photo
              ? "linear-gradient(to top, #000000 0%, rgba(0,0,0,0.82) 58%, transparent 100%)"
              : "transparent",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 3,
              color: "#8cff9a",
              marginBottom: 18,
            }}
          >
            KIRUK.IN / NOTEBOOK
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              lineHeight: 1.08,
              letterSpacing: -1,
              color: "#f4f4f2",
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
