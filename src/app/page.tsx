import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { StudioFooter } from "@/components/StudioFooter";
import { getServerIntl } from "@/i18n/server";
import { BRAND_OVERLINE_SX, TOP_RIGHT_CONTROL_SX } from "@/theme/styles";

const HOME_SHELL_SX: SxProps<Theme> = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
};

const HOME_MAIN_SX: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  px: 2,
  py: 8,
};

const HOME_PAPER_SX: SxProps<Theme> = {
  p: { xs: 4, sm: 6 },
  textAlign: "center",
};

const HOME_OVERLINE_SX: SxProps<Theme> = {
  ...BRAND_OVERLINE_SX,
  mb: 1.5,
};

export default async function HomePage() {
  const intl = await getServerIntl();
  const brand = intl.formatMessage({ id: "home.brand" });
  const title = intl.formatMessage({ id: "home.title" });
  const description = intl.formatMessage({ id: "home.description" });

  return (
    <Box sx={HOME_SHELL_SX}>
      <Box component="main" sx={HOME_MAIN_SX}>
        <Box sx={TOP_RIGHT_CONTROL_SX}>
          <LanguageSwitcher />
        </Box>

        <Container maxWidth="sm">
          <Paper sx={HOME_PAPER_SX}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={HOME_OVERLINE_SX}
            >
              {brand}
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Paper>
        </Container>
      </Box>

      <StudioFooter />
    </Box>
  );
}
