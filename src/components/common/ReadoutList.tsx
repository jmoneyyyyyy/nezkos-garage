import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type ReadoutListProps = {
  /** [label, value] pairs. */
  items: [string, string][];
  /** "wrap": two tiles per row, a lone last tile centered. "grid": three equal columns (one when narrow). */
  layout: "wrap" | "grid";
  /** Font size of the values, in px. */
  valueSize?: number;
};

const GAP = 8;

/** Label/value tiles styled like little dash gauges. Each `dt` is immediately followed by its `dd`. */
export default function ReadoutList({ items, layout, valueSize = 17 }: ReadoutListProps) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        textAlign: "center",
        ...(layout === "wrap"
          ? { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${GAP}px` }
          : {
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: `${GAP}px`,
              "@media (max-width:520px)": { gridTemplateColumns: "1fr" },
            }),
      }}
    >
      {items.map(([label, value]) => (
        <Box
          key={label}
          sx={{
            boxSizing: "border-box",
            minWidth: 0,
            ...(layout === "wrap" && { flex: `0 0 calc((100% - ${GAP}px) / 2)` }),
            p: layout === "wrap" ? "8px 10px" : "10px",
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider",
            borderRadius: "8px",
          }}
        >
          <Typography
            component="dt"
            sx={{ typography: "button", fontSize: 11, lineHeight: 1.2, letterSpacing: "0.14em", color: "text.secondary" }}
          >
            {label}
          </Typography>
          <Typography
            component="dd"
            sx={{
              typography: "button",
              m: 0,
              mt: "3px",
              fontSize: valueSize,
              lineHeight: 1.2,
              letterSpacing: "0.03em",
              textTransform: "none",
              fontVariantNumeric: "tabular-nums",
              overflowWrap: "anywhere", // long VINs
              color: "text.primary",
            }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
