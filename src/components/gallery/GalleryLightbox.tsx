"use client";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useIntl } from "react-intl";
import { formatBytes } from "@/lib/format";
import type { GalleryPhoto } from "@/lib/r2-service";

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  selectedIndex: number | null;
  downloadingKey: string | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onDownload: (key: string) => void;
}

export function GalleryLightbox({
  photos,
  selectedIndex,
  downloadingKey,
  onClose,
  onSelectIndex,
  onDownload,
}: GalleryLightboxProps) {
  const intl = useIntl();
  const isOpen = selectedIndex !== null && photos[selectedIndex] !== undefined;
  const currentPhoto =
    selectedIndex !== null ? (photos[selectedIndex] ?? null) : null;

  useEffect(() => {
    if (selectedIndex === null || photos.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && selectedIndex > 0) {
        onSelectIndex(selectedIndex - 1);
        return;
      }

      if (event.key === "ArrowRight" && selectedIndex < photos.length - 1) {
        onSelectIndex(selectedIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onSelectIndex, photos.length, selectedIndex]);

  const hasPrevious = selectedIndex !== null && selectedIndex > 0;
  const hasNext =
    selectedIndex !== null && selectedIndex < photos.length - 1;
  const originalKey = currentPhoto?.originalKey ?? null;
  const isDownloading =
    originalKey !== null && downloadingKey === originalKey;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "rgba(12, 12, 12, 0.96)",
            color: "#F5F5F5",
            border: "none",
            borderRadius: 0,
            backgroundImage: "none",
          },
        },
      }}
    >
      {currentPhoto && selectedIndex !== null && (
        <Box
          sx={{
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 2, sm: 3 },
              py: 1.5,
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.65)",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                {intl.formatMessage(
                  { id: "gallery.photoCounter" },
                  { current: selectedIndex + 1, total: photos.length },
                )}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                {currentPhoto.originalFileName ?? currentPhoto.fileName}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {originalKey ? (
                <Button
                  variant="contained"
                  size="small"
                  disabled={isDownloading}
                  onClick={() => onDownload(originalKey)}
                  startIcon={
                    isDownloading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon fontSize="small" />
                    )
                  }
                  sx={{
                    backgroundColor: "#F5F5F5",
                    color: "#121212",
                    "&:hover": {
                      backgroundColor: "#E5E5E5",
                    },
                  }}
                >
                  {intl.formatMessage({ id: "gallery.downloadOriginal" })}
                  {currentPhoto.originalSizeBytes
                    ? ` (${formatBytes(currentPhoto.originalSizeBytes)})`
                    : ""}
                </Button>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.55)" }}
                >
                  {intl.formatMessage({ id: "gallery.originalUnavailable" })}
                </Typography>
              )}

              <IconButton
                onClick={onClose}
                aria-label={intl.formatMessage({
                  id: "gallery.closeLightbox",
                })}
                sx={{ color: "#F5F5F5" }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, sm: 4 },
              minHeight: 0,
            }}
          >
            <IconButton
              disabled={!hasPrevious}
              onClick={() => {
                if (hasPrevious) {
                  onSelectIndex(selectedIndex - 1);
                }
              }}
              aria-label={intl.formatMessage({ id: "gallery.previousPhoto" })}
              sx={{
                position: "absolute",
                left: { xs: 8, sm: 20 },
                color: "#F5F5F5",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.16)",
                },
                "&.Mui-disabled": {
                  opacity: 0.2,
                  color: "#F5F5F5",
                },
              }}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>

            <Box
              component="img"
              src={currentPhoto.thumbnailUrl}
              alt={currentPhoto.baseName}
              sx={{
                maxWidth: "calc(100% - 88px)",
                maxHeight: "calc(100dvh - 120px)",
                objectFit: "contain",
                borderRadius: 1,
                userSelect: "none",
              }}
            />

            <IconButton
              disabled={!hasNext}
              onClick={() => {
                if (hasNext) {
                  onSelectIndex(selectedIndex + 1);
                }
              }}
              aria-label={intl.formatMessage({ id: "gallery.nextPhoto" })}
              sx={{
                position: "absolute",
                right: { xs: 8, sm: 20 },
                color: "#F5F5F5",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.16)",
                },
                "&.Mui-disabled": {
                  opacity: 0.2,
                  color: "#F5F5F5",
                },
              }}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
