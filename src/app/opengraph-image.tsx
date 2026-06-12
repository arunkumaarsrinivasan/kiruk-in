import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kiruk — Design Engineer & AI UX Designer in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(120% 80% at 0% 0%, #1e1b4b 0%, #0a0a0a 55%, #000000 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#0a0a0a",
            }}
          >
            K
          </div>
          <div style={{ fontSize: 28, opacity: 0.8, letterSpacing: 2 }}>
            KIRUK.IN
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            Design Engineer &
            <br />
            AI UX Designer
          </div>
          <div
            style={{
              fontSize: 32,
              opacity: 0.7,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Arun Kumaar Sreenivasan — Bengaluru, India. Design & frontend lead
            at Spera.bot · ex-HP Innovation for India.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            opacity: 0.55,
          }}
        >
          <div>kiruk.in</div>
          <div>Portfolio · Case studies · Blog</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
