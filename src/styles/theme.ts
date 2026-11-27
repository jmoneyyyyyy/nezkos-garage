import { createTheme } from "@mui/material/styles";

// Garage palette: mirrors the --garage-* variables in global.css (which the chart
// and landing styles still read), so keep the two in sync.
const garage = {
  black: "#0a0c0b",
  asphalt: "#111412",
  steel: "#171b19",
  gunmetal: "#222825",
  line: "#2b322e",
  gray: "#98a29c",
  silver: "#e7ece9",
  green: "#34c770",
  greenBright: "#52de8d",
  greenGlow: "rgba(52, 199, 112, 0.22)",
  red: "#f05a5a",
};

const bodyFont = '"Barlow", system-ui, "Segoe UI", Roboto, sans-serif';
const headingFont = '"Barlow Condensed", "Arial Narrow", system-ui, sans-serif';

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: garage.green, light: garage.greenBright, contrastText: "#04140b" },
    error: { main: garage.red },
    background: { default: garage.black, paper: garage.steel },
    text: { primary: garage.silver, secondary: garage.gray },
    divider: garage.line,
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: bodyFont,
    // Matches the 18px/145% base in global.css (the root font size is 18px, 16px below 1024px).
    body1: { fontSize: "1rem", lineHeight: 1.45, letterSpacing: "0.01em" },
    h1: { fontFamily: headingFont, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase" },
    h2: { fontFamily: headingFont, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" },
    h3: { fontFamily: headingFont, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" },
    button: { fontFamily: headingFont, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" },
  },
  components: {
    MuiCssBaseline: {
      // The existing body copy color comes from --text (gray), not the palette's silver.
      styleOverrides: { body: { color: "var(--text)" } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { fontSize: 14, lineHeight: 1, padding: "9px 14px" },
        contained: {
          background: `linear-gradient(180deg, ${garage.greenBright}, ${garage.green})`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 14px -4px ${garage.greenGlow}`,
        },
        outlined: {
          color: garage.silver,
          background: "linear-gradient(180deg, #2a312d, #1c211f)",
          borderColor: "#39413c",
          "&:hover": { borderColor: garage.green, color: "#fff" },
        },
      },
      variants: [
        // Compact buttons for headers, list rows and card actions.
        { props: { size: "small" }, style: { fontSize: 12, padding: "7px 12px" } },
        {
          props: { variant: "outlined", color: "error" },
          style: {
            color: garage.red,
            background: "transparent",
            borderColor: "rgba(240, 90, 90, 0.4)",
            "&:hover": { color: "#fff", background: "rgba(240, 90, 90, 0.15)", borderColor: garage.red },
          },
        },
      ],
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(180deg, ${garage.steel}, ${garage.asphalt})`,
          border: `1px solid ${garage.line}`,
          borderRadius: 14,
          boxShadow: "var(--shadow)",
        },
      },
    },
    MuiAlert: {
      // Same look as the old `[role="alert"]` banner: tinted, red left edge, no icon.
      defaultProps: { icon: false },
      styleOverrides: {
        root: {
          color: "#ff9b9b",
          background: "rgba(240, 90, 90, 0.08)",
          border: "1px solid rgba(240, 90, 90, 0.3)",
          borderLeft: `3px solid ${garage.red}`,
          fontSize: 14,
          padding: "8px 12px",
          textAlign: "left",
        },
      },
    },
    MuiTab: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          minHeight: 0,
          minWidth: 0,
          padding: "14px 18px",
          fontSize: 15,
          letterSpacing: "0.1em",
          "&.Mui-selected": { color: garage.silver },
          "@media (max-width:560px)": { padding: "12px", fontSize: 14 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: garage.black,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: garage.line },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3a423d" },
          "&.Mui-focused": { boxShadow: `0 0 0 3px ${garage.greenGlow}` },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: `linear-gradient(180deg, ${garage.steel}, ${garage.asphalt})`,
          border: `1px solid ${garage.line}`,
          borderTop: `3px solid ${garage.green}`,
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
