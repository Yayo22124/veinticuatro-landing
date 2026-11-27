import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function HomePage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
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
            veinticuatro studio
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            Private Delivery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access your session using the private link and PIN provided by the
            studio.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
