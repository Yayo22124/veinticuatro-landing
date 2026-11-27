import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getServerIntl } from "@/i18n/server";
import { formatGalleryTitle } from "@/lib/format";
import type { GalleryCoverUrls } from "@/lib/r2-service";

interface GalleryHeroProps {
  slug: string;
  covers: GalleryCoverUrls;
}

export async function GalleryHero({ slug, covers }: GalleryHeroProps) {
  if (!covers.mobileUrl || !covers.desktopUrl) {
    return null;
  }

  const intl = await getServerIntl();
  const title = formatGalleryTitle(slug);
  const brand = intl.formatMessage({ id: "home.brand" });
  const collectionLabel = intl.formatMessage({ id: "gallery.collectionLabel" });
  const ctaLabel = intl.formatMessage({ id: "gallery.viewGallery" });

  return (
    <Box component="section" sx={{ backgroundColor: "background.paper" }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          height: "100dvh",
          minHeight: 580,
          px: { md: 3, lg: 4 },
          pt: { md: 3, lg: 4 },
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            position: "relative",
            backgroundColor: "action.hover",
          }}
        >
          <Box
            component="img"
            src={covers.desktopUrl}
            alt={title}
            fetchPriority="high"
            decoding="async"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              animation: "v24HeroZoom 900ms cubic-bezier(0.22, 1, 0.36, 1)",
              "@keyframes v24HeroZoom": {
                from: { opacity: 0, transform: "scale(1.03)" },
                to: { opacity: 1, transform: "scale(1)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            py: 2.5,
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {brand}
          </Typography>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                mb: 0.25,
              }}
            >
              {collectionLabel}
            </Typography>
            <Typography
              variant="h4"
              component="p"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ justifySelf: "end" }}>
            <Button
              component="a"
              href="#gallery-content"
              variant="contained"
              sx={{
                borderRadius: 0,
                px: 3,
                py: 1.15,
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {ctaLabel}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "100dvh",
          px: 2.5,
          py: 3,
          gap: 2.5,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          {brand}
        </Typography>

        <Box
          sx={{
            width: "100%",
            maxWidth: 390,
            aspectRatio: "9 / 16",
            maxHeight: "64dvh",
            overflow: "hidden",
            backgroundColor: "action.hover",
          }}
        >
          <Box
            component="img"
            src={covers.mobileUrl}
            alt={title}
            fetchPriority="high"
            decoding="async"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              animation: "v24HeroFade 700ms cubic-bezier(0.22, 1, 0.36, 1)",
              "@keyframes v24HeroFade": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          />
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {collectionLabel}
          </Typography>
          <Typography
            variant="h4"
            component="p"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Button
            component="a"
            href="#gallery-content"
            variant="contained"
            sx={{
              borderRadius: 0,
              px: 3.5,
              py: 1.15,
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
