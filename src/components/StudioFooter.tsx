import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getServerIntl } from "@/i18n/server";
import { STUDIO_SOCIAL_LINKS } from "@/lib/studio";
import { SOCIAL_ICON_BUTTON_SX } from "@/theme/styles";

const FOOTER_SX: SxProps<Theme> = {
  borderTop: "1px solid",
  borderColor: "divider",
  mt: { xs: 6, sm: 10 },
  py: { xs: 4, sm: 5 },
  backgroundColor: "background.paper",
};

const FOOTER_STACK_SX: SxProps<Theme> = {
  justifyContent: "space-between",
  alignItems: "center",
};

const FOOTER_BRAND_BOX_SX: SxProps<Theme> = {
  textAlign: { xs: "center", sm: "left" },
};

const FOOTER_OVERLINE_SX: SxProps<Theme> = {
  letterSpacing: "0.22em",
  display: "block",
  color: "text.primary",
};

const FOOTER_CONNECT_LABEL_SX: SxProps<Theme> = {
  mr: 1,
  display: { xs: "none", sm: "inline" },
};

const SOCIAL_ITEMS = [
  {
    key: "instagram",
    href: STUDIO_SOCIAL_LINKS.instagram,
    ariaLabel: "Instagram",
    icon: <InstagramIcon fontSize="small" />,
  },
  {
    key: "facebook",
    href: STUDIO_SOCIAL_LINKS.facebook,
    ariaLabel: "Facebook",
    icon: <FacebookIcon fontSize="small" />,
  },
  {
    key: "whatsapp",
    href: STUDIO_SOCIAL_LINKS.whatsapp,
    ariaLabel: `WhatsApp ${STUDIO_SOCIAL_LINKS.whatsappDisplay}`,
    icon: <WhatsAppIcon fontSize="small" />,
  },
] as const;

export async function StudioFooter() {
  const intl = await getServerIntl();
  const brand = intl.formatMessage({ id: "home.brand" });
  const rights = intl.formatMessage({ id: "footer.rights" });
  const followUs = intl.formatMessage({ id: "footer.followUs" });

  return (
    <Box component="footer" sx={FOOTER_SX}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          sx={FOOTER_STACK_SX}
        >
          <Box sx={FOOTER_BRAND_BOX_SX}>
            <Typography variant="overline" sx={FOOTER_OVERLINE_SX}>
              {brand}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rights}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={FOOTER_CONNECT_LABEL_SX}
            >
              {followUs}
            </Typography>

            {SOCIAL_ITEMS.map((item) => (
              <IconButton
                key={item.key}
                component="a"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
                size="small"
                sx={SOCIAL_ICON_BUTTON_SX}
              >
                {item.icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
