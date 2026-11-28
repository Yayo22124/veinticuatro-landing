"use client";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import type { GalleryPhoto } from "@/lib/r2-service";

interface GalleryPhotoGridProps {
  photos: GalleryPhoto[];
  downloadingKey: string | null;
  onOpenPhoto: (index: number) => void;
  onDownloadPhoto: (key: string) => void;
}

const INITIAL_BATCH_SIZE = 20;
const LOAD_MORE_BATCH_SIZE = 15;

interface PhotoTileProps {
  photo: GalleryPhoto;
  index: number;
  isDownloading: boolean;
  onOpen: (index: number) => void;
  onDownload: (key: string) => void;
}

function CameraSkeletonPlaceholder({ height }: { height?: number | string }) {
  return (
    <Box
      sx={{
        position: height ? "relative" : "absolute",
        inset: height ? undefined : 0,
        width: "100%",
        height: height ?? "100%",
        borderRadius: "2px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "action.hover",
      }}
    >
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
      <PhotoCameraOutlinedIcon
        sx={{
          position: "relative",
          zIndex: 1,
          fontSize: 28,
          color: "text.disabled",
          opacity: 0.45,
        }}
      />
    </Box>
  );
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
        position: "relative",
        borderRadius: "2px",
        overflow: "hidden",
        backgroundColor: "action.hover",
        minHeight: loaded ? "auto" : 260,
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
      {!loaded && <CameraSkeletonPlaceholder />}

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
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  const columnCount = isXl ? 5 : isMd ? 4 : isSm ? 3 : 2;

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
      { rootMargin: "150px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, photos.length, effectiveVisibleCount]);

  const columns = useMemo(() => {
    const cols: Array<Array<{ photo: GalleryPhoto; originalIndex: number }>> =
      Array.from({ length: columnCount }, () => []);

    const slice = photos.slice(0, effectiveVisibleCount);
    slice.forEach((photo, idx) => {
      cols[idx % columnCount].push({ photo, originalIndex: idx });
    });

    return cols;
  }, [photos, effectiveVisibleCount, columnCount]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <Box component="section">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        {columns.map((col, colIdx) => (
          <Box
            key={colIdx}
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {col.map(({ photo, originalIndex }) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                index={originalIndex}
                isDownloading={
                  photo.originalKey !== null &&
                  downloadingKey === photo.originalKey
                }
                onOpen={onOpenPhoto}
                onDownload={onDownloadPhoto}
              />
            ))}
          </Box>
        ))}
      </Box>

      {hasMore && (
        <Box
          ref={sentinelRef}
          aria-label={intl.formatMessage({ id: "gallery.loadingMore" })}
          sx={{
            mt: "8px",
            display: "grid",
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            gap: "8px",
          }}
        >
          {Array.from({ length: columnCount }).map((_, idx) => (
            <CameraSkeletonPlaceholder key={idx} height={260} />
          ))}
        </Box>
      )}
    </Box>
  );
}