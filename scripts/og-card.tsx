// Bakes the site's share card: the loader eye cut into one vertical band per
// era, each band the same eye seen through that era's screen, with name, role
// and kiruk.in laid over it. The eras are read from ERA_MEDIA, so adding,
// removing or reordering an era changes the card on the next bake.
//
// Reads public/eye/posters/<era>-wide.avif, writes public/og/share.jpg
// (SHARE_IMAGE in src/lib/site.ts points every page without its own card here)
// and scripts/og-card.stamp.json (what the card was baked from).
// Baked offline as JPEG because a photo PNG from next/og runs past 1 MB and
// WhatsApp drops large previews. Skill: .claude/skills/eye-share-card.
//   npm run og:card            bake
//   npm run og:card -- --check exit 1 if the eras, posters or this script changed since the bake
//
// Satori can't read variable fonts, so src/assets/fonts/og holds static
// instances of the site's Stack Sans, made with fontTools:
//   python -m fontTools.varLib.instancer "src/assets/fonts/StackSansHeadline[wght].ttf" wght=600 --static -o src/assets/fonts/og/StackSansHeadline-600.ttf
//   python -m fontTools.varLib.instancer "src/assets/fonts/StackSansText[wght].ttf" wght=400 --static -o src/assets/fonts/og/StackSansText-400.ttf
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

const root = process.cwd();
const read = (...p: string[]) => readFileSync(join(root, ...p));

// Parsed from the source rather than imported: era-medium.ts pulls in TSL.
const MEDIUM_FILE = "src/components/three/eye/post/era-medium.ts";
const ERAS = [...(read(MEDIUM_FILE).toString().match(/export const ERA_MEDIA = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
  (m) => m[1],
);
if (ERAS.length === 0) throw new Error(`ERA_MEDIA not found in ${MEDIUM_FILE}`);
const poster = (era: string) => join(root, "public", "eye", "posters", `${era}-wide.avif`);
const missing = ERAS.filter((era) => !existsSync(poster(era)));
if (missing.length) throw new Error(`no wide poster for ${missing.join(", ")}: capture posters first`);

const W = 1200;
const H = 630;
const BAND = W / ERAS.length;
const GAP = 2;
// The posters are 16:9; scaled to 1200 wide they stand 675 tall. The eye fills
// their middle half, so the outer bands are skin; zooming in to fix that pushes
// the brow out of frame.
const SCALED_H = Math.round((W * 9) / 16);
const TOP = 30;
// 1970 sits inside a curved CRT bezel; zoom it so its band is face, not glass.
const ZOOM: Record<string, number> = { 1970: 1.1 };

const STAMP = join(root, "scripts", "og-card.stamp.json");
const sha = (buf: Buffer) => createHash("sha1").update(buf).digest("hex").slice(0, 12);
function stamp() {
  return {
    eras: ERAS,
    posters: Object.fromEntries(ERAS.map((era) => [era, sha(readFileSync(poster(era)))])),
    script: sha(read("scripts", "og-card.tsx")),
  };
}

async function frame(era: string) {
  const z = ZOOM[era] ?? 1;
  const w = Math.round(W * z);
  const h = Math.round(SCALED_H * z);
  return sharp(poster(era))
    .resize(w, h)
    .extract({ left: Math.round((w - W) / 2), top: Math.round((h - SCALED_H) / 2) + TOP, width: W, height: H })
    .toBuffer();
}

async function slices() {
  const layers = await Promise.all(
    ERAS.map(async (era, i) => {
      const left = Math.round(i * BAND);
      const width = Math.round((i + 1) * BAND) - left - (i < ERAS.length - 1 ? GAP : 0);
      const input = await sharp(await frame(era)).extract({ left, top: 0, width, height: H }).toBuffer();
      return { input, left, top: 0 };
    }),
  );
  return sharp({ create: { width: W, height: H, channels: 3, background: "#000000" } })
    .composite(layers)
    .png()
    .toBuffer();
}

function Card({ background }: { background: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#000000",
        color: "#f4f4f2",
        fontFamily: "StackSansText",
      }}
    >
      <img src={background} width={W} height={H} alt="" style={{ position: "absolute", top: 0, left: 0 }} />

      {/* Era years along the top, one per band. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: 96,
          display: "flex",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        {ERAS.map((era) => (
          <div
            key={era}
            style={{
              width: BAND,
              display: "flex",
              justifyContent: "center",
              paddingTop: 22,
              fontSize: 15,
              letterSpacing: 3,
              color: "rgba(244,244,242,0.78)",
            }}
          >
            {era}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: W,
          height: 300,
          display: "flex",
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 48,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontFamily: "StackSansHeadline",
              fontSize: 62,
              lineHeight: 1,
              letterSpacing: -1.5,
              color: "#ffffff",
            }}
          >
            Arun Kumaar Sreenivasan
          </div>
          <div style={{ fontSize: 26, color: "rgba(244,244,242,0.78)", letterSpacing: 0.2 }}>
            Design Engineer & AI UX Designer
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, letterSpacing: 1.5 }}>
          <div style={{ width: 10, height: 20, background: "#5dff7a" }} />
          kiruk.in
        </div>
      </div>
    </div>
  );
}

async function main() {
  const now = stamp();
  if (process.argv.includes("--check")) {
    const baked = existsSync(STAMP) ? JSON.parse(readFileSync(STAMP, "utf8")) : null;
    const stale = JSON.stringify(baked) !== JSON.stringify(now);
    console.log(stale ? "share card is stale: run npm run og:card" : "share card is current");
    process.exit(stale ? 1 : 0);
  }

  const background = `data:image/png;base64,${(await slices()).toString("base64")}`;
  const png = Buffer.from(
    await new ImageResponse(<Card background={background} />, {
      width: W,
      height: H,
      fonts: [
        { name: "StackSansHeadline", data: read("src", "assets", "fonts", "og", "StackSansHeadline-600.ttf"), style: "normal" },
        { name: "StackSansText", data: read("src", "assets", "fonts", "og", "StackSansText-400.ttf"), style: "normal" },
      ],
    }).arrayBuffer(),
  );
  const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  mkdirSync(join(root, "public", "og"), { recursive: true });
  writeFileSync(join(root, "public", "og", "share.jpg"), jpg);
  writeFileSync(STAMP, `${JSON.stringify(now, null, 2)}\n`);
  console.log(`wrote public/og/share.jpg (${Math.round(jpg.length / 1024)} KB)`);
}

main();
