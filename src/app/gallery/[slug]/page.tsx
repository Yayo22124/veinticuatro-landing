import Box from "@mui/material/Box";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GalleryPinGate } from "@/components/GalleryPinGate";
import { StudioFooter } from "@/components/StudioFooter";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GalleryView } from "@/components/gallery/GalleryView";
import { esMessages } from "@/i18n/messages/es";
import { galleryExists, isGalleryAuthenticated } from "@/lib/auth";
import { formatGalleryTitle } from "@/lib/format";
import { getGalleryContents, type GalleryTab } from "@/lib/r2-service";
import { slugSchema } from "@/lib/validation";

interface GalleryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

async function resolvePublicCoverUrl(
  slug: string,
  origin?: string,
): Promise<string | undefined> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success || !origin) {
    return undefined;
  }

  const extensions = ["jpg", "webp", "jpeg", "png"];
  for (const ext of extensions) {
    const candidateUrl = `${origin}/covers/${parsedSlug.data}.${ext}`;
    try {
      const res = await fetch(candidateUrl, {
        method: "HEAD",
        cache: "force-cache",
      });
      if (res.ok) {
        return candidateUrl;
      }
    } catch {
      // Continuar con la siguiente extensión si falla
    }
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : undefined;
  const title = `${formatGalleryTitle(slug)} — ${esMessages["home.brand"]}`;
  const description = esMessages["app.description"];
  const ogImageUrl = await resolvePublicCoverUrl(slug, origin);

  return {
    title,
    description,
    metadataBase: origin ? new URL(origin) : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: esMessages["home.brand"],
      ...(ogImageUrl
        ? {
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function GalleryPage({
  params,
  searchParams,
}: GalleryPageProps) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);

  if (!galleryExists(slug)) {
    notFound();
  }

  const authenticated = await isGalleryAuthenticated(slug);

  if (!authenticated) {
    return <GalleryPinGate slug={slug} />;
  }

  const activeTab: GalleryTab = tab === "videos" ? "videos" : "photos";
  const contents = await getGalleryContents(slug, activeTab);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <GalleryHero slug={contents.slug} covers={contents.covers} />
      <GalleryView contents={contents} />
      <StudioFooter />
    </Box>
  );
}