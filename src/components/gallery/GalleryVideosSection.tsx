"use client";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useIntl } from "react-intl";
import { formatBytes } from "@/lib/format";
import type { GalleryVideo } from "@/lib/r2-service";

interface GalleryVideosSectionProps {
  videos: GalleryVideo[];
  downloadingKey: string | null;
  onDownload: (key: string) => void;
}

export function GalleryVideosSection({
  videos,
  downloadingKey,
  onDownload,
}: GalleryVideosSectionProps) {
  const intl = useIntl();

  if (videos.length === 0) {
    return null;
  }

  return (
    <Box component="section">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: videos.length === 1 ? "minmax(0, 720px)" : "repeat(2, minmax(0, 1fr))",
          },
          gap: 3,
        }}
      >
        {videos.map((video) => {
          const isDownloading = downloadingKey === video.key;

          return (
            <Paper key={video.id} sx={{ overflow: "hidden" }}>
              <Box
                component="video"
                controls
                preload="metadata"
                playsInline
                src={video.previewUrl}
                sx={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  display: "block",
                  backgroundColor: "#0E0E0E",
                }}
              />

              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2.5,
                  py: 2,
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {video.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(video.sizeBytes)}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  disabled={isDownloading}
                  onClick={() => onDownload(video.key)}
                  startIcon={
                    isDownloading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon fontSize="small" />
                    )
                  }
                  sx={{ flexShrink: 0 }}
                >
                  {intl.formatMessage({ id: "gallery.downloadVideo" })}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
