import {
  ImageResponse,
} from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType =
  "image/png";

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
          background: "#064e3b",
          color: "#ffffff",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: 30,
            border: "3px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -4,
            boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
          }}
        >
          VS
        </div>
      </div>
    ),
    size,
  );
}