"use client";

import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useRouter } from "next/navigation";
import { useTransition, type SyntheticEvent } from "react";
import { useIntl } from "react-intl";
import type { GalleryTab } from "@/lib/r2-service";

interface GalleryTabsProps {
  slug: string;
  activeTab: GalleryTab;
  totalPhotos: number;
  totalVideos: number;
}

export function GalleryTabs({
  slug,
  activeTab,
  totalPhotos,
  totalVideos,
}: GalleryTabsProps) {
  const intl = useIntl();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (_: SyntheticEvent, nextTab: GalleryTab) => {
    if (nextTab === activeTab) {
      return;
    }

    const targetUrl =
      nextTab === "photos"
        ? `/gallery/${slug}`
        : `/gallery/${slug}?tab=${nextTab}`;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label={intl.formatMessage({ id: "gallery.photosTitle" })}
        sx={{
          minHeight: 42,
          "& .MuiTabs-indicator": {
            height: 2,
          },
          "& .MuiTab-root": {
            minHeight: 42,
            px: 1.5,
            py: 1,
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "text.secondary",
            "&.Mui-selected": {
              color: "text.primary",
              fontWeight: 600,
            },
          },
        }}
      >
        <Tab
          value="photos"
          icon={<PhotoLibraryOutlinedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label={`${intl.formatMessage({ id: "gallery.photosTitle" })} (${totalPhotos})`}
        />
        <Tab
          value="videos"
          icon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label={`${intl.formatMessage({ id: "gallery.videosTitle" })} (${totalVideos})`}
        />
      </Tabs>

      {isPending && (
        <LinearProgress
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
          }}
        />
      )}
    </Box>
  );
}
