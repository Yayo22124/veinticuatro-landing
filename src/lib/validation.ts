import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{4,12}$/);

export const otpPinSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "pin_incomplete");

export const pinFormSchema = z.object({
  pin: otpPinSchema,
});

export const r2KeySchema = z
  .string()
  .min(1)
  .max(1024)
  .refine(
    (value) =>
      !value.includes("..") &&
      !value.startsWith("/") &&
      !value.includes("\\") &&
      !/[\r\n\0]/.test(value),
    "Invalid object key",
  );
