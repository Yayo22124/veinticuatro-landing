"use client";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import type { GalleryPhoto } from "@/lib/r2-service";

interface GalleryPhotoGridProps {
  photos: GalleryPhoto[];
  downloadingKey: string | null;
  onOpenPhoto: (index: number) => void;
  onDownloadPhoto: (key: string) => void;
}

const INITIAL_BATCH_SIZE = 15;
const LOAD_MORE_BATCH_SIZE = 15;
const SKELETON_HEIGHTS = [400, 400, 400, 400];

interface PhotoTileProps {
  photo: GalleryPhoto;
  index: number;
  isDownloading: boolean;
  onOpen: (index: number) => void;
  onDownload: (key: string) => void;
}

function PhotoTile({
  photo,
  index,
  isDownloading,
  onOpen,
  onDownload,
}: PhotoTileProps) {
  const intl = useIntl();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  const originalKey = photo.originalKey;

  return (
    <Box
      sx={{
        breakInside: "avoid",
        mb: "8px",
        position: "relative",
        borderRadius: "2px",
        overflow: "hidden",
        backgroundColor: "action.hover",
        minHeight: loaded ? "auto" : 220,
        "&:hover .photo-overlay, &:focus-within .photo-overlay": {
          opacity: 1,
        },
        "&:hover .photo-img": {
          transform: "scale(1.018)",
        },
        "@media (prefers-reduced-motion: reduce)": {
          "&:hover .photo-img": {
            transform: "none",
          },
        },
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}

      <Box
        component="button"
        type="button"
        onClick={() => onOpen(index)}
        aria-label={intl.formatMessage(
          { id: "gallery.openPhoto" },
          { name: photo.baseName },
        )}
        sx={{
          display: "block",
          width: "100%",
          p: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: -2,
          },
        }}
      >
        <Box
          ref={imgRef}
          component="img"
          className="photo-img"
          src={photo.thumbnailUrl}
          alt={photo.baseName}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition:
              "opacity 280ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        />
      </Box>

      {originalKey && loaded && (
        <Box
          className="photo-overlay"
          sx={{
            position: "absolute",
            right: 8,
            bottom: 8,
            opacity: isDownloading ? 1 : { xs: 1, sm: 0 },
            transition: "opacity 160ms ease",
          }}
        >
          <IconButton
            size="small"
            disabled={isDownloading}
            onClick={() => onDownload(originalKey)}
            aria-label={intl.formatMessage({
              id: "gallery.downloadOriginal",
            })}
            sx={{
              backgroundColor: "rgba(18, 18, 18, 0.72)",
              color: "#F5F5F5",
              backdropFilter: "blur(6px)",
              "&:hover": {
                backgroundColor: "rgba(18, 18, 18, 0.9)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(18, 18, 18, 0.72)",
                color: "#F5F5F5",
              },
            }}
          >
            {isDownloading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

export function GalleryPhotoGrid({
  photos,
  downloadingKey,
  onOpenPhoto,
  onDownloadPhoto,
}: GalleryPhotoGridProps) {
  const intl = useIntl();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);

  const effectiveVisibleCount = Math.min(visibleCount, photos.length);
  const hasMore = effectiveVisibleCount < photos.length;

  useEffect(() => {
    isFetchingRef.current = false;
  }, [effectiveVisibleCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || isFetchingRef.current) {
          return;
        }

        isFetchingRef.current = true;
        setVisibleCount((prev) =>
          Math.min(prev + LOAD_MORE_BATCH_SIZE, photos.length),
        );
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, photos.length, effectiveVisibleCount]);

  if (photos.length === 0) {
    return null;
  }

  const visiblePhotos = photos.slice(0, effectiveVisibleCount);

  return (
    <Box component="section">
      <Box
        sx={{
          columnCount: { xs: 2, sm: 3, md: 4, xl: 5 },
          columnGap: "8px",
        }}
      >
        {visiblePhotos.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            index={index}
            isDownloading={
              photo.originalKey !== null &&
              downloadingKey === photo.originalKey
            }
            onOpen={onOpenPhoto}
            onDownload={onDownloadPhoto}
          />
        ))}
      </Box>

      {hasMore && (
        <Box ref={sentinelRef} sx={{ mt: 1 }}>
          <Box
            aria-label={intl.formatMessage({ id: "gallery.loadingMore" })}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                xl: "repeat(5, 1fr)",
              },
              gap: "8px",
            }}
          >
            {SKELETON_HEIGHTS.map((height, idx) => (
              <Skeleton
                key={idx}
                variant="rectangular"
                animation="wave"
                height={height}
                sx={{ borderRadius: "2px" }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}