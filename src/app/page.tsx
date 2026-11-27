import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getServerIntl } from "@/i18n/server";

export default async function HomePage() {
  const intl = await getServerIntl();

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        px: 2,
      }}
    >
      <Box sx={{ position: "absolute", top: 24, right: 24 }}>
        <LanguageSwitcher />
      </Box>

      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: "0.24em", display: "block", mb: 1.5 }}
          >
            {intl.formatMessage({ id: "home.brand" })}
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            {intl.formatMessage({ id: "home.title" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage({ id: "home.description" })}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
