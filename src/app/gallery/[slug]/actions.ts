"use server";

import { revalidatePath } from "next/cache";
import {
  clearGallerySession,
  isGalleryAuthenticated,
  verifyGalleryPinAndSetSession,
} from "@/lib/auth";
import {
  createDownloadPresignedUrl,
  isAllowedDownloadKey,
} from "@/lib/r2-service";
import { slugSchema } from "@/lib/validation";

export interface VerifyPinActionState {
  ok: boolean;
  errorCode?: "invalid_pin" | "unexpected";
}

export type DownloadUrlActionResult =
  | {
      ok: true;
      url: string;
      fileName: string;
    }
  | {
      ok: false;
      errorCode: "unauthorized" | "invalid_key" | "unexpected";
    };

export async function submitGalleryPinAction(
  slug: string,
  pin: string,
): Promise<VerifyPinActionState> {
  try {
    const verified = await verifyGalleryPinAndSetSession(slug, pin);
    if (!verified) {
      return { ok: false, errorCode: "invalid_pin" };
    }

    const parsedSlug = slugSchema.safeParse(slug);
    if (parsedSlug.success) {
      revalidatePath(`/gallery/${parsedSlug.data}`);
    }

    return { ok: true };
  } catch {
    return { ok: false, errorCode: "unexpected" };
  }
}

export async function verifyGalleryPinAction(
  slug: string,
  _prevState: VerifyPinActionState,
  formData: FormData,
): Promise<VerifyPinActionState> {
  const rawPin = formData.get("pin");
  const pin = typeof rawPin === "string" ? rawPin : "";
  return submitGalleryPinAction(slug, pin);
}

export async function requestDownloadUrlAction(
  slug: string,
  key: string,
): Promise<DownloadUrlActionResult> {
  try {
    const authenticated = await isGalleryAuthenticated(slug);
    if (!authenticated) {
      return { ok: false, errorCode: "unauthorized" };
    }

    if (!isAllowedDownloadKey(slug, key)) {
      return { ok: false, errorCode: "invalid_key" };
    }

    const { url, fileName } = await createDownloadPresignedUrl(slug, key);
    return { ok: true, url, fileName };
  } catch {
    return { ok: false, errorCode: "unexpected" };
  }
}

export async function logoutGalleryAction(slug: string): Promise<void> {
  await clearGallerySession(slug);

  const parsedSlug = slugSchema.safeParse(slug);
  if (parsedSlug.success) {
    revalidatePath(`/gallery/${parsedSlug.data}`);
  }
}
