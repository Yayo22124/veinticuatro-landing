"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormHelperText from "@mui/material/FormHelperText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useIntl } from "react-intl";
import { submitGalleryPinAction } from "@/app/gallery/[slug]/actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatGalleryTitle } from "@/lib/format";
import { pinFormSchema } from "@/lib/validation";

interface GalleryPinGateProps {
  slug: string;
}

const OTP_LENGTH = 4;

export function GalleryPinGate({ slug }: GalleryPinGateProps) {
  const intl = useIntl();
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { pin: "" },
    validate: (values) => {
      const parsed = pinFormSchema.safeParse(values);
      if (parsed.success) {
        return {};
      }
      return {
        pin: intl.formatMessage({ id: "auth.pinIncomplete" }),
      };
    },
    onSubmit: async (values, helpers) => {
      setServerError(null);
      try {
        const result = await submitGalleryPinAction(slug, values.pin);
        if (!result.ok) {
          setServerError(
            intl.formatMessage({
              id:
                result.errorCode === "invalid_pin"
                  ? "auth.invalidPin"
                  : "auth.unexpectedError",
            }),
          );
          helpers.setSubmitting(false);
          return;
        }
        router.refresh();
      } catch {
        setServerError(intl.formatMessage({ id: "auth.unexpectedError" }));
        helpers.setSubmitting(false);
      }
    },
  });

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) =>
    formik.values.pin.charAt(index),
  );

  const updatePinDigits = (nextDigits: string[], focusIndex?: number) => {
    const sanitized = nextDigits.join("").replace(/\D/g, "").slice(0, OTP_LENGTH);
    setServerError(null);
    void formik.setFieldValue("pin", sanitized, true);
    void formik.setFieldTouched("pin", true, false);

    if (focusIndex !== undefined) {
      const target = inputRefs.current[focusIndex];
      target?.focus();
    }
  };

  const handleDigitChange = (index: number, rawValue: string) => {
    const cleaned = rawValue.replace(/\D/g, "");
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      updatePinDigits(nextDigits);
      return;
    }

    if (cleaned.length > 1) {
      const nextDigits = [...digits];
      for (let offset = 0; offset < cleaned.length; offset += 1) {
        const targetIndex = index + offset;
        if (targetIndex < OTP_LENGTH) {
          nextDigits[targetIndex] = cleaned.charAt(offset);
        }
      }
      const nextFocus = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      updatePinDigits(nextDigits, nextFocus);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleaned;
    const nextFocus = index < OTP_LENGTH - 1 ? index + 1 : index;
    updatePinDigits(nextDigits, nextFocus);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        event.preventDefault();
        const nextDigits = [...digits];
        nextDigits[index] = "";
        updatePinDigits(nextDigits);
        return;
      }

      if (index > 0) {
        event.preventDefault();
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        updatePinDigits(nextDigits, index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) {
      return;
    }

    event.preventDefault();
    const startIndex = index === 0 ? 0 : index;
    const nextDigits = [...digits];

    for (let offset = 0; offset < pasted.length; offset += 1) {
      const targetIndex = startIndex + offset;
      if (targetIndex < OTP_LENGTH) {
        nextDigits[targetIndex] = pasted.charAt(offset);
      }
    }

    const nextFocus = Math.min(startIndex + pasted.length - 1, OTP_LENGTH - 1);
    updatePinDigits(nextDigits, Math.max(0, nextFocus));
  };

  const validationError =
    formik.touched.pin && formik.errors.pin ? formik.errors.pin : null;

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        px: 2,
        py: 6,
      }}
    >
      <Box sx={{ position: "absolute", top: 24, right: 24 }}>
        <LanguageSwitcher />
      </Box>

      <Container maxWidth="xs">
        <Paper
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            animation: "v24FadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            "@keyframes v24FadeUp": {
              from: { opacity: 0, transform: "translateY(10px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid",
              borderColor: "divider",
              mb: 2.5,
              color: "text.secondary",
            }}
          >
            <LockOutlinedIcon fontSize="small" />
          </Box>

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: "0.24em", display: "block", mb: 0.75 }}
          >
            {intl.formatMessage({ id: "home.brand" })}
          </Typography>
          <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
            {formatGalleryTitle(slug)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {intl.formatMessage({ id: "auth.subtitle" })}
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1, letterSpacing: "0.06em" }}
              >
                {intl.formatMessage({ id: "auth.pinLabel" })}
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ justifyContent: "space-between" }}
              >
                {digits.map((digit, index) => (
                  <Box
                    key={index}
                    component="input"
                    ref={(element: HTMLInputElement | null) => {
                      inputRefs.current[index] = element;
                    }}
                    type="password"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={OTP_LENGTH}
                    value={digit}
                    disabled={formik.isSubmitting}
                    aria-label={intl.formatMessage(
                      { id: "auth.otpDigitLabel" },
                      { index: index + 1 },
                    )}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleDigitChange(index, event.target.value)
                    }
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(index, event)
                    }
                    onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
                      handlePaste(index, event)
                    }
                    sx={{
                      width: "100%",
                      height: 56,
                      textAlign: "center",
                      fontSize: "1.35rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      color: "text.primary",
                      backgroundColor: "background.default",
                      border: "1px solid",
                      borderColor: validationError ? "error.main" : "divider",
                      borderRadius: 1,
                      outline: "none",
                      transition:
                        "border-color 160ms ease, box-shadow 160ms ease",
                      "&:focus": {
                        borderColor: validationError
                          ? "error.main"
                          : "primary.main",
                        boxShadow: "0 0 0 1px currentColor",
                      },
                      "&:disabled": {
                        opacity: 0.6,
                      },
                    }}
                  />
                ))}
              </Stack>

              <FormHelperText error={Boolean(validationError)} sx={{ mt: 1 }}>
                {validationError ?? intl.formatMessage({ id: "auth.pinHelper" })}
              </FormHelperText>
            </Box>

            {serverError && <Alert severity="error">{serverError}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={formik.isSubmitting}
              startIcon={
                formik.isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
              fullWidth
            >
              {formik.isSubmitting
                ? intl.formatMessage({ id: "auth.submitting" })
                : intl.formatMessage({ id: "auth.submit" })}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
