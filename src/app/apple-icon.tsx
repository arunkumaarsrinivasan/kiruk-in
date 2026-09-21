import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: 118,
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "8px solid #f4f4f2",
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "#f4f4f2",
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
