import { ImageResponse } from "next/og";
import { formatGalleryTitle } from "@/lib/format";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = formatGalleryTitle(slug).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          backgroundColor: "#FAFAFA",
          color: "#121212",
          border: "18px solid #121212",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.28em",
            color: "#525252",
            textTransform: "uppercase",
          }}
        >
          VEINTICUATRO STUDIO
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.22em",
              color: "#525252",
              textTransform: "uppercase",
            }}
          >
            GALERÍA PRIVADA
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              letterSpacing: "0.08em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#525252",
          }}
        >
          Fotografía y Video · Entrega Privada
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
