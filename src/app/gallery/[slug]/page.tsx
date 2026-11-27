import { existsSync } from "node:fs";
import path from "node:path";
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

function findPublicCoverPath(slug: string): string | null {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return null;
  }

  const extensions = ["webp", "jpg", "jpeg", "png"];
  for (const ext of extensions) {
    const fileName = `${parsedSlug.data}.${ext}`;
    const diskPath = path.join(process.cwd(), "public", "covers", fileName);
    if (existsSync(diskPath)) {
      return `/covers/${fileName}`;
    }
  }

  return null;
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
  const publicCoverPath = findPublicCoverPath(slug);
  const ogImageUrl = publicCoverPath
    ? origin
      ? `${origin}${publicCoverPath}`
      : publicCoverPath
    : undefined;

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
