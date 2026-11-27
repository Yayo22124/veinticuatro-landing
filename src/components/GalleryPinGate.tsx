"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useIntl } from "react-intl";
import {
  verifyGalleryPinAction,
  type VerifyPinActionState,
} from "@/app/gallery/[slug]/actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface GalleryPinGateProps {
  slug: string;
}

const initialState: VerifyPinActionState = { ok: false };

export function GalleryPinGate({ slug }: GalleryPinGateProps) {
  const intl = useIntl();
  const router = useRouter();
  const boundAction = verifyGalleryPinAction.bind(null, slug);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  const errorMessage =
    state.errorCode === "invalid_pin"
      ? intl.formatMessage({ id: "auth.invalidPin" })
      : state.errorCode === "unexpected"
        ? intl.formatMessage({ id: "auth.unexpectedError" })
        : null;

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
      }}
    >
      <Box sx={{ position: "absolute", top: 24, right: 24 }}>
        <LanguageSwitcher />
      </Box>

      <Container maxWidth="xs">
        <Paper sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: "0.24em", display: "block", mb: 1 }}
          >
            {intl.formatMessage({ id: "home.brand" })}
          </Typography>
          <Typography variant="h5" component="h1" gutterBottom>
            {intl.formatMessage({ id: "auth.title" })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {intl.formatMessage({ id: "auth.subtitle" })}
          </Typography>

          <Box
            component="form"
            action={formAction}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              name="pin"
              type="password"
              label={intl.formatMessage({ id: "auth.pinLabel" })}
              autoComplete="one-time-code"
              inputMode="numeric"
              required
              disabled={isPending}
              fullWidth
            />

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              fullWidth
            >
              {isPending
                ? intl.formatMessage({ id: "auth.submitting" })
                : intl.formatMessage({ id: "auth.submit" })}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
