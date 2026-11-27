import "server-only";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "@/lib/env";
import { getR2Client } from "@/lib/r2";
import { GALLERY_COVERS } from "@/lib/studio";
import { r2KeySchema, slugSchema } from "@/lib/validation";

const PREVIEW_URL_TTL_SECONDS = 900;
const DOWNLOAD_URL_TTL_SECONDS = 300;

const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm"]);

export type GalleryTab = "photos" | "videos";

export interface GalleryPhoto {
  id: string;
  baseName: string;
  fileName: string;
  thumbnailKey: string;
  thumbnailUrl: string;
  thumbnailSizeBytes: number;
  originalKey: string | null;
  originalFileName: string | null;
  originalSizeBytes: number | null;
}

export interface GalleryVideo {
  id: string;
  fileName: string;
  key: string;
  previewUrl: string;
  sizeBytes: number;
}

export interface GalleryZipPackage {
  fileName: string;
  key: string;
  sizeBytes: number;
}

export interface GalleryCoverUrls {
  mobileUrl: string | null;
  desktopUrl: string | null;
}

export interface GalleryContents {
  slug: string;
  activeTab: GalleryTab;
  totalPhotos: number;
  totalVideos: number;
  covers: GalleryCoverUrls;
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
  zipPackage: GalleryZipPackage | null;
}

interface RawObjectEntry {
  key: string;
  fileName: string;
  baseName: string;
  extension: string;
  sizeBytes: number;
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) {
    return "";
  }
  return fileName.slice(dotIndex).toLowerCase();
}

function getBaseName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) {
    return fileName;
  }
  return fileName.slice(0, dotIndex);
}

function sanitizeDownloadFileName(fileName: string): string {
  return fileName.replace(/["\\\r\n\0]/g, "_");
}

function formatAttachmentDisposition(fileName: string): string {
  const safeName = sanitizeDownloadFileName(fileName);
  const encodedName = encodeURIComponent(fileName);
  return `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`;
}

function parseObjectEntry(object: _Object): RawObjectEntry | null {
  if (!object.Key || object.Key.endsWith("/")) {
    return null;
  }

  const segments = object.Key.split("/");
  const fileName = segments[segments.length - 1];

  if (!fileName || fileName.startsWith(".")) {
    return null;
  }

  return {
    key: object.Key,
    fileName,
    baseName: getBaseName(fileName),
    extension: getExtension(fileName),
    sizeBytes: object.Size ?? 0,
  };
}

async function listAllObjectsByPrefix(prefix: string): Promise<_Object[]> {
  const env = getServerEnv();
  const client = getR2Client();
  const objects: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: env.R2_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    if (response.Contents) {
      objects.push(...response.Contents);
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return objects;
}

async function createPreviewPresignedUrl(key: string): Promise<string> {
  const env = getServerEnv();
  const client = getR2Client();

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ResponseCacheControl: `private, max-age=${PREVIEW_URL_TTL_SECONDS}`,
  });

  return getSignedUrl(client, command, {
    expiresIn: PREVIEW_URL_TTL_SECONDS,
  });
}

function findCoverEntry(
  entries: RawObjectEntry[],
  preferredFileName: string | undefined,
): RawObjectEntry | null {
  if (entries.length === 0) {
    return null;
  }

  if (preferredFileName) {
    const normalized = preferredFileName.toLowerCase();
    const matched = entries.find(
      (entry) => entry.fileName.toLowerCase() === normalized,
    );
    if (matched) {
      return matched;
    }
  }

  return entries[0] ?? null;
}

export function isAllowedDownloadKey(slug: string, key: string): boolean {
  const parsedSlug = slugSchema.safeParse(slug);
  const parsedKey = r2KeySchema.safeParse(key);

  if (!parsedSlug.success || !parsedKey.success) {
    return false;
  }

  const validSlug = parsedSlug.data;
  const validKey = parsedKey.data;
  const prefix = `${validSlug}/`;

  if (!validKey.startsWith(prefix)) {
    return false;
  }

  const relativePath = validKey.slice(prefix.length);

  if (
    relativePath.startsWith("originals/") &&
    relativePath.length > "originals/".length
  ) {
    return true;
  }

  if (
    relativePath.startsWith("videos/") &&
    relativePath.length > "videos/".length
  ) {
    return true;
  }

  if (!relativePath.includes("/") && relativePath.toLowerCase().endsWith(".zip")) {
    return true;
  }

  return false;
}

export async function getGalleryContents(
  slug: string,
  activeTab: GalleryTab = "photos",
): Promise<GalleryContents> {
  const validSlug = slugSchema.parse(slug);
  const rootPrefix = `${validSlug}/`;
  const thumbnailsPrefix = `${rootPrefix}thumbnails/`;
  const originalsPrefix = `${rootPrefix}originals/`;
  const videosPrefix = `${rootPrefix}videos/`;

  const rawObjects = await listAllObjectsByPrefix(rootPrefix);

  const thumbnailEntries: RawObjectEntry[] = [];
  const originalsByBaseName = new Map<string, RawObjectEntry>();
  const videoEntries: RawObjectEntry[] = [];
  const zipCandidates: RawObjectEntry[] = [];

  for (const item of rawObjects) {
    const entry = parseObjectEntry(item);
    if (!entry) {
      continue;
    }

    if (entry.key.startsWith(thumbnailsPrefix)) {
      if (IMAGE_EXTENSIONS.has(entry.extension)) {
        thumbnailEntries.push(entry);
      }
      continue;
    }

    if (entry.key.startsWith(originalsPrefix)) {
      originalsByBaseName.set(entry.baseName.toLowerCase(), entry);
      continue;
    }

    if (entry.key.startsWith(videosPrefix)) {
      if (VIDEO_EXTENSIONS.has(entry.extension)) {
        videoEntries.push(entry);
      }
      continue;
    }

    const relativePath = entry.key.slice(rootPrefix.length);
    if (!relativePath.includes("/") && entry.extension === ".zip") {
      zipCandidates.push(entry);
    }
  }

  const sortByFileName = (a: RawObjectEntry, b: RawObjectEntry) =>
    a.fileName.localeCompare(b.fileName, undefined, {
      numeric: true,
      sensitivity: "base",
    });

  thumbnailEntries.sort(sortByFileName);
  videoEntries.sort(sortByFileName);
  zipCandidates.sort(sortByFileName);

  const coverConfig = GALLERY_COVERS[validSlug];
  const mobileCoverEntry = findCoverEntry(
    thumbnailEntries,
    coverConfig?.mobileFileName,
  );
  const desktopCoverEntry = findCoverEntry(
    thumbnailEntries,
    coverConfig?.desktopFileName,
  );

  const signedPreviewCache = new Map<string, string>();
  const coverKeys = Array.from(
    new Set(
      [mobileCoverEntry?.key, desktopCoverEntry?.key].filter(
        (key): key is string => Boolean(key),
      ),
    ),
  );

  await Promise.all(
    coverKeys.map(async (key) => {
      const url = await createPreviewPresignedUrl(key);
      signedPreviewCache.set(key, url);
    }),
  );

  const covers: GalleryCoverUrls = {
    mobileUrl: mobileCoverEntry
      ? (signedPreviewCache.get(mobileCoverEntry.key) ?? null)
      : null,
    desktopUrl: desktopCoverEntry
      ? (signedPreviewCache.get(desktopCoverEntry.key) ?? null)
      : null,
  };

  const photos =
    activeTab === "photos"
      ? await Promise.all(
          thumbnailEntries.map(async (thumb): Promise<GalleryPhoto> => {
            const matchedOriginal = originalsByBaseName.get(
              thumb.baseName.toLowerCase(),
            );
            const thumbnailUrl =
              signedPreviewCache.get(thumb.key) ??
              (await createPreviewPresignedUrl(thumb.key));

            return {
              id: thumb.key,
              baseName: thumb.baseName,
              fileName: thumb.fileName,
              thumbnailKey: thumb.key,
              thumbnailUrl,
              thumbnailSizeBytes: thumb.sizeBytes,
              originalKey: matchedOriginal?.key ?? null,
              originalFileName: matchedOriginal?.fileName ?? null,
              originalSizeBytes: matchedOriginal?.sizeBytes ?? null,
            };
          }),
        )
      : [];

  const videos =
    activeTab === "videos"
      ? await Promise.all(
          videoEntries.map(async (video): Promise<GalleryVideo> => {
            const previewUrl = await createPreviewPresignedUrl(video.key);

            return {
              id: video.key,
              fileName: video.fileName,
              key: video.key,
              previewUrl,
              sizeBytes: video.sizeBytes,
            };
          }),
        )
      : [];

  const preferredZip =
    zipCandidates.find((item) => item.fileName.toLowerCase() === "package.zip") ??
    zipCandidates[0] ??
    null;

  const zipPackage: GalleryZipPackage | null = preferredZip
    ? {
        fileName: preferredZip.fileName,
        key: preferredZip.key,
        sizeBytes: preferredZip.sizeBytes,
      }
    : null;

  return {
    slug: validSlug,
    activeTab,
    totalPhotos: thumbnailEntries.length,
    totalVideos: videoEntries.length,
    covers,
    photos,
    videos,
    zipPackage,
  };
}

export async function createDownloadPresignedUrl(
  slug: string,
  key: string,
): Promise<{ url: string; fileName: string }> {
  if (!isAllowedDownloadKey(slug, key)) {
    throw new Error("Download key is not permitted for this gallery");
  }

  const env = getServerEnv();
  const client = getR2Client();
  const fileName = key.split("/").pop() ?? "download";

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: formatAttachmentDisposition(fileName),
    ResponseCacheControl: "no-store",
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: DOWNLOAD_URL_TTL_SECONDS,
  });

  return { url, fileName };
}
