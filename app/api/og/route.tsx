import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#020617",
          color: "white",
          fontSize: 60,
          fontWeight: "bold",
        }}
      >
        <div>Programación Desde Cero + IA</div>
        <div style={{ fontSize: 30, marginTop: 20 }}>
          Curso de 6 semanas
        </div>
        <div style={{ fontSize: 30, marginTop: 20 }}>
            Leo S Programador
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}