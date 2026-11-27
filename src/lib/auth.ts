import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";
import { pinSchema, slugSchema } from "@/lib/validation";

const SESSION_COOKIE_PREFIX = "v24_session_";
const SESSION_TTL_SECONDS = 60 * 60 * 4;
const PIN_VERIFY_DELAY_MS = 500;

function getSessionCookieName(slug: string): string {
  return `${SESSION_COOKIE_PREFIX}${slug}`;
}

function getJwtSecret(): Uint8Array {
  const env = getServerEnv();
  return new TextEncoder().encode(env.AUTH_SECRET);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function verifyPinConstantTime(inputPin: string, expectedPin: string): boolean {
  const inputDigest = createHash("sha256").update(inputPin, "utf8").digest();
  const expectedDigest = createHash("sha256")
    .update(expectedPin, "utf8")
    .digest();

  return timingSafeEqual(inputDigest, expectedDigest);
}

export function galleryExists(slug: string): boolean {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return false;
  }

  const env = getServerEnv();
  return Object.hasOwn(env.GALLERY_PINS, parsedSlug.data);
}

export async function createGallerySessionToken(slug: string): Promise<string> {
  const parsedSlug = slugSchema.parse(slug);

  return new SignJWT({ slug: parsedSlug })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(parsedSlug)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyGallerySessionToken(
  token: string,
  expectedSlug: string,
): Promise<boolean> {
  const parsedSlug = slugSchema.safeParse(expectedSlug);
  if (!parsedSlug.success || !token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    return (
      payload.slug === parsedSlug.data && payload.sub === parsedSlug.data
    );
  } catch {
    return false;
  }
}

export async function isGalleryAuthenticated(slug: string): Promise<boolean> {
  if (!galleryExists(slug)) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName(slug))?.value;

  if (!token) {
    return false;
  }

  return verifyGallerySessionToken(token, slug);
}

export async function verifyGalleryPinAndSetSession(
  slug: string,
  rawPin: string,
): Promise<boolean> {
  await sleep(PIN_VERIFY_DELAY_MS);

  const parsedSlug = slugSchema.safeParse(slug);
  const parsedPin = pinSchema.safeParse(rawPin);

  if (!parsedSlug.success || !parsedPin.success) {
    return false;
  }

  const env = getServerEnv();
  const validSlug = parsedSlug.data;

  if (!Object.hasOwn(env.GALLERY_PINS, validSlug)) {
    return false;
  }

  const expectedPin = env.GALLERY_PINS[validSlug];
  if (!expectedPin || !verifyPinConstantTime(parsedPin.data, expectedPin)) {
    return false;
  }

  const token = await createGallerySessionToken(validSlug);
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(validSlug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return true;
}

export async function clearGallerySession(slug: string): Promise<void> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName(parsedSlug.data));
}
