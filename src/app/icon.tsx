import {
  ImageResponse,
} from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType =
  "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            border:
              "42px solid rgba(255,255,255,0.06)",
            top: -170,
            right: -150,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border:
              "30px solid rgba(251,191,36,0.12)",
            bottom: -140,
            left: -100,
          }}
        />

        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: 92,
            background:
              "rgba(255,255,255,0.08)",
            border:
              "4px solid rgba(255,255,255,0.16)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              fontSize: 138,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: -10,
            }}
          >
            VS
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#d1fae5",
            }}
          >
            Vivace
          </div>

          <div
            style={{
              marginTop: 18,
              width: 120,
              height: 6,
              borderRadius: 999,
              background: "#fbbf24",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}