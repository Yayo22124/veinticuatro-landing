import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import { logoutGalleryAction } from "@/app/gallery/[slug]/actions";
import { GalleryPinGate } from "@/components/GalleryPinGate";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { esMessages } from "@/i18n/messages/es";
import { getServerIntl } from "@/i18n/server";
import { galleryExists, isGalleryAuthenticated } from "@/lib/auth";
import { getGalleryContents } from "@/lib/r2-service";

export const metadata: Metadata = {
  title: `${esMessages["auth.title"]} — ${esMessages["home.brand"]}`,
  description: esMessages["app.description"],
  robots: {
    index: false,
    follow: false,
  },
};

interface GalleryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = await params;

  if (!galleryExists(slug)) {
    notFound();
  }

  const authenticated = await isGalleryAuthenticated(slug);

  if (!authenticated) {
    return <GalleryPinGate slug={slug} />;
  }

  const [intl, contents] = await Promise.all([
    getServerIntl(),
    getGalleryContents(slug),
  ]);

  const logoutAction = logoutGalleryAction.bind(null, slug);

  return (
    <Box component="main" sx={{ minHeight: "100dvh", py: 6, px: 2 }}>
      <Container maxWidth="md">
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: "0.24em", display: "block" }}
            >
              {intl.formatMessage({ id: "home.brand" })}
            </Typography>
            <Typography variant="h4" component="h1">
              {contents.slug}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <LanguageSwitcher />
            <Box component="form" action={logoutAction}>
              <Button type="submit" variant="outlined" size="small">
                {intl.formatMessage({ id: "gallery.logout" })}
              </Button>
            </Box>
          </Stack>
        </Stack>

        <Paper sx={{ p: 4 }}>
          <Stack spacing={1}>
            <Typography variant="body1">
              {intl.formatMessage(
                { id: "gallery.photosCount" },
                { count: contents.photos.length },
              )}
            </Typography>
            <Typography variant="body1">
              {intl.formatMessage(
                { id: "gallery.videosCount" },
                { count: contents.videos.length },
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contents.zipPackage
                ? intl.formatMessage(
                    { id: "gallery.packageAvailable" },
                    { fileName: contents.zipPackage.fileName },
                  )
                : intl.formatMessage({ id: "gallery.packageUnavailable" })}
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
