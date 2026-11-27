import { formatBytes } from "@/lib/format";
import type { GalleryTab } from "@/lib/r2-service";

export const OTP_LENGTH = 4;
export const INITIAL_PHOTO_BATCH_SIZE = 28;
export const PHOTO_BATCH_STEP = 28;
export const SKELETON_HEIGHTS = [240, 320, 200, 280] as const;

export const SNACKBAR_ANCHOR = {
  vertical: "bottom",
  horizontal: "center",
} as const;

export function extractDigits(value: string, maxLength = OTP_LENGTH): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function getOtpDigits(pin: string, length = OTP_LENGTH): string[] {
  return Array.from({ length }, (_, index) => pin.charAt(index));
}

export function applyOtpDigitChange(
  digits: string[],
  index: number,
  rawValue: string,
  length = OTP_LENGTH,
): { nextDigits: string[]; nextFocusIndex: number } {
  const cleaned = rawValue.replace(/\D/g, "");
  const nextDigits = [...digits];

  if (!cleaned) {
    nextDigits[index] = "";
    return { nextDigits, nextFocusIndex: index };
  }

  if (cleaned.length > 1) {
    for (let offset = 0; offset < cleaned.length; offset += 1) {
      const targetIndex = index + offset;
      if (targetIndex < length) {
        nextDigits[targetIndex] = cleaned.charAt(offset);
      }
    }

    return {
      nextDigits,
      nextFocusIndex: Math.min(index + cleaned.length, length - 1),
    };
  }

  nextDigits[index] = cleaned;
  return {
    nextDigits,
    nextFocusIndex: index < length - 1 ? index + 1 : index,
  };
}

export function applyOtpPaste(
  digits: string[],
  startIndex: number,
  rawClipboard: string,
  length = OTP_LENGTH,
): { nextDigits: string[]; nextFocusIndex: number } | null {
  const pasted = rawClipboard.replace(/\D/g, "");
  if (!pasted) {
    return null;
  }

  const nextDigits = [...digits];
  for (let offset = 0; offset < pasted.length; offset += 1) {
    const targetIndex = startIndex + offset;
    if (targetIndex < length) {
      nextDigits[targetIndex] = pasted.charAt(offset);
    }
  }

  const nextFocusIndex = Math.max(
    0,
    Math.min(startIndex + pasted.length - 1, length - 1),
  );

  return { nextDigits, nextFocusIndex };
}

export function triggerBrowserDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function buildWhatsAppShareUrl(
  message: string,
  shareUrl: string,
): string {
  return `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`;
}

export function formatDownloadLabel(
  baseLabel: string,
  sizeBytes?: number | null,
): string {
  if (!sizeBytes) {
    return baseLabel;
  }
  return `${baseLabel} (${formatBytes(sizeBytes)})`;
}

export function getGalleryTabHref(slug: string, tab: GalleryTab): string {
  return tab === "photos" ? `/gallery/${slug}` : `/gallery/${slug}?tab=${tab}`;
}
