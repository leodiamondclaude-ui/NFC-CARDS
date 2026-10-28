import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: NFC business cards`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0b0b0f",
          color: "#ffffff",
          padding: 80,
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <div style={{ fontSize: 26, letterSpacing: 8, fontWeight: 600 }}>{site.name.toUpperCase()}</div>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.04, marginTop: 40, letterSpacing: -2 }}>Your First Impression.</div>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.04, color: "#7d93ff", letterSpacing: -2 }}>
            One Tap Away.
          </div>
        </div>
        <div
          style={{
            width: 420,
            height: 265,
            borderRadius: 24,
            background: "linear-gradient(135deg, #24242a, #111115)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 32,
            transform: "rotate(-8deg)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: 4 }}>
            <span>{site.name.toUpperCase()}</span>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: "#3355ff" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 600 }}>Your Name</span>
            <span style={{ fontSize: 20, color: "#a0a0a6" }}>Tap to connect</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
