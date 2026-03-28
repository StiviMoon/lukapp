import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "lukapp — Maneja tus lukas. Control, claridad, crecimiento.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #0F0415 50%, #1a003d 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background glow circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(89,19,239,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,212,0,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 100,
            transform: "translateY(-50%)",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(122,0,245,0.20) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 5,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "#baea0f",
              }}
            />
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "#5913ef",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            lukapp
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            textAlign: "center",
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Maneja tus{" "}
          <span style={{ color: "#baea0f" }}>lukas</span>
          {" "}con IA
        </div>

        {/* Subheading */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 48,
          }}
        >
          Control total de tus finanzas — solo o con tu pareja
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["Control", "Coach IA", "Voz", "En pareja"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 20px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            color: "rgba(255,255,255,0.30)",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          myluka.app
        </div>
      </div>
    ),
    { ...size },
  );
}
