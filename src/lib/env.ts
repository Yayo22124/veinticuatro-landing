import "server-only";
import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pinPattern = /^\d{4,12}$/;

const galleryPinsSchema = z
  .string()
  .min(2, "GALLERY_PINS must be a valid JSON string")
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "GALLERY_PINS does not contain valid JSON",
      });
      return z.NEVER;
    }
  })
  .pipe(
    z.record(
      z
        .string()
        .regex(
          slugPattern,
          "Each slug in GALLERY_PINS must use lowercase letters, numbers, and hyphens",
        ),
      z
        .string()
        .regex(
          pinPattern,
          "Each PIN in GALLERY_PINS must be numeric and 4 to 12 digits long",
        ),
    ),
  );

const serverEnvSchema = z.object({
  R2_ACCOUNT_ID: z
    .string()
    .trim()
    .min(1, "R2_ACCOUNT_ID is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "R2_ACCOUNT_ID contains invalid characters"),
  R2_ACCESS_KEY_ID: z.string().trim().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z
    .string()
    .trim()
    .min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().trim().min(3, "R2_BUCKET_NAME is required"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long"),
  GALLERY_PINS: galleryPinsSchema,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GALLERY_PINS: process.env.GALLERY_PINS,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid server environment configuration:\n${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
