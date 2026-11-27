"use client";

import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import {
  logoutGalleryAction,
  requestDownloadUrlAction,
} from "@/app/gallery/[slug]/actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { GalleryPhotoGrid } from "@/components/gallery/GalleryPhotoGrid";
import { GalleryShareMenu } from "@/components/gallery/GalleryShareMenu";
import { GalleryTabs } from "@/components/gallery/GalleryTabs";
import { GalleryVideosSection } from "@/components/gallery/GalleryVideosSection";
import { formatBytes, formatGalleryTitle } from "@/lib/format";
import type { GalleryContents } from "@/lib/r2-service";

interface GalleryViewProps {
  contents: GalleryContents;
}

interface SnackbarState {
  open: boolean;
  severity: "info" | "success" | "error";
  message: string;
}

function triggerBrowserDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function GalleryView({ contents }: GalleryViewProps) {
  const intl = useIntl();
  const router = useRouter();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "info",
    message: "",
  });

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleCopiedLink = useCallback(() => {
    setSnackbar({
      open: true,
      severity: "success",
      message: intl.formatMessage({ id: "gallery.shareCopied" }),
    });
  }, [intl]);

  const handleDownload = useCallback(
    async (key: string) => {
      if (downloadingKey !== null) {
        return;
      }

      setDownloadingKey(key);
      setSnackbar({
        open: true,
        severity: "info",
        message: intl.formatMessage({ id: "gallery.preparingDownload" }),
      });

      try {
        const result = await requestDownloadUrlAction(contents.slug, key);

        if (!result.ok) {
          setSnackbar({
            open: true,
            severity: "error",
            message: intl.formatMessage({
              id:
                result.errorCode === "unauthorized"
                  ? "gallery.downloadUnauthorized"
                  : "gallery.downloadError",
            }),
          });

          if (result.errorCode === "unauthorized") {
            router.refresh();
          }
          return;
        }

        triggerBrowserDownload(result.url, result.fileName);
        setSnackbar({
          open: true,
          severity: "success",
          message: intl.formatMessage(
            { id: "gallery.downloadStarted" },
            { fileName: result.fileName },
          ),
        });
      } catch {
        setSnackbar({
          open: true,
          severity: "error",
          message: intl.formatMessage({ id: "gallery.downloadError" }),
        });
      } finally {
        setDownloadingKey(null);
      }
    },
    [contents.slug, downloadingKey, intl, router],
  );

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await logoutGalleryAction(contents.slug);
    router.refresh();
  }, [contents.slug, router]);

  const formattedTitle = formatGalleryTitle(contents.slug);
  const zipPackage = contents.zipPackage;
  const isDownloadingZip =
    zipPackage !== null && downloadingKey === zipPackage.key;
  const isGalleryEmpty =
    contents.totalPhotos === 0 &&
    contents.totalVideos === 0 &&
    zipPackage === null;
  const isTabEmpty =
    contents.activeTab === "photos"
      ? contents.photos.length === 0
      : contents.videos.length === 0;

  return (
    <>
      <Box
        id="gallery-content"
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          pt: 1.75,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                component="h1"
                noWrap
                sx={{
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {formattedTitle}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{
                  display: "block",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {intl.formatMessage({ id: "home.brand" })}
                {" · "}
                {intl.formatMessage(
                  { id: "gallery.photosCount" },
                  { count: contents.totalPhotos },
                )}
                {contents.totalVideos > 0
                  ? ` · ${intl.formatMessage(
                      { id: "gallery.videosCount" },
                      { count: contents.totalVideos },
                    )}`
                  : ""}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexShrink: 0 }}
            >
              {zipPackage && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={isDownloadingZip}
                  onClick={() => handleDownload(zipPackage.key)}
                  startIcon={
                    isDownloadingZip ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <FolderZipOutlinedIcon fontSize="small" />
                    )
                  }
                  sx={{ borderRadius: 1 }}
                >
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                    {isDownloadingZip
                      ? intl.formatMessage({ id: "gallery.downloadingZip" })
                      : `${intl.formatMessage({ id: "gallery.downloadZip" })} (${formatBytes(zipPackage.sizeBytes)})`}
                  </Box>
                  <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                    ZIP
                  </Box>
                </Button>
              )}

              <GalleryShareMenu
                title={formattedTitle}
                onCopied={handleCopiedLink}
              />

              <LanguageSwitcher />

              <Tooltip title={intl.formatMessage({ id: "gallery.logout" })}>
                <span>
                  <IconButton
                    size="small"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    aria-label={intl.formatMessage({ id: "gallery.logout" })}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <LockOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {!isGalleryEmpty && (
            <GalleryTabs
              slug={contents.slug}
              activeTab={contents.activeTab}
              totalPhotos={contents.totalPhotos}
              totalVideos={contents.totalVideos}
            />
          )}
        </Container>
      </Box>

      <Box
        component="main"
        sx={{ flex: 1, py: { xs: 3, sm: 4 }, px: { xs: 0, sm: 1 } }}
      >
        <Container maxWidth="xl">
          {isGalleryEmpty || isTabEmpty ? (
            <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                {intl.formatMessage({ id: "gallery.emptyTitle" })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({ id: "gallery.emptyDescription" })}
              </Typography>
            </Paper>
          ) : contents.activeTab === "videos" ? (
            <GalleryVideosSection
              videos={contents.videos}
              downloadingKey={downloadingKey}
              onDownload={handleDownload}
            />
          ) : (
            <GalleryPhotoGrid
              photos={contents.photos}
              downloadingKey={downloadingKey}
              onOpenPhoto={setSelectedPhotoIndex}
              onDownloadPhoto={handleDownload}
            />
          )}
        </Container>
      </Box>

      {contents.activeTab === "photos" && (
        <GalleryLightbox
          photos={contents.photos}
          selectedIndex={selectedPhotoIndex}
          downloadingKey={downloadingKey}
          onClose={() => setSelectedPhotoIndex(null)}
          onSelectIndex={setSelectedPhotoIndex}
          onDownload={handleDownload}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={handleCloseSnackbar}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
