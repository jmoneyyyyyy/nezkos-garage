import { useRef, useState, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import { CHANGE_BUTTON_TEXT, PHOTO_READ_ERROR, REMOVE_BUTTON_TEXT } from "../../Constants";
import { photoFromInput } from "../../utils/photoUpload";
import ErrorAlert from "./ErrorAlert";

type PhotoPickerProps = {
  /** The current photo (a data URL), or empty for none. */
  photo?: string | null;
  alt: string;
  /** Text of the button shown when there is no photo yet. */
  emptyLabel: string;
  disabled?: boolean;
  /** Called with the resized photo, or null when it's removed. */
  onChange: (photo: string | null) => void;
  /** "card" fills the width of a vehicle card; "form" is a smaller, framed picker for the Add vehicle form. */
  variant?: "card" | "form";
  /** Layout for the "couldn't read this photo" alert shown under the picker. */
  errorSx?: SxProps<Theme>;
};

// Photo actions sit on top of the picture, so they get a dark translucent look.
const overlayButtonSx: SxProps<Theme> = {
  padding: "7px 11px",
  color: "#fff",
  background: "rgba(10, 12, 11, 0.7)",
  borderColor: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(6px)",
};

/** Photo area with Change/Remove (or an "add" button when empty) and a hidden file input. */
export default function PhotoPicker({
  photo,
  alt,
  emptyLabel,
  disabled,
  onChange,
  variant = "card",
  errorSx,
}: PhotoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = () => fileRef.current?.click();

  const onChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    try {
      const chosen = await photoFromInput(e);
      if (chosen) onChange(chosen);
    } catch {
      setError(PHOTO_READ_ERROR);
    }
  };

  return (
    <>
      {/* The buttons are type="button" (MUI's default), so they never submit a surrounding form */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          overflow: "hidden",
          bgcolor: "background.default",
          backgroundImage: "repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.025) 0 10px, transparent 10px 20px)",
          borderBottom: "2px solid",
          borderBottomColor: "primary.main",
          // Soft fade at the bottom of the photo
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "auto 0 0",
            height: "40%",
            background: "linear-gradient(transparent, rgba(10, 12, 11, 0.55))",
            pointerEvents: "none",
          },
          ...(variant === "form" && {
            width: 260,
            maxWidth: "100%",
            alignSelf: "center",
            border: 1,
            borderColor: "divider",
            borderBottom: "2px solid",
            borderBottomColor: "primary.main",
            borderRadius: "10px",
          }),
        }}
      >
        {photo ? (
          <>
            {/* Absolutely positioned so the photo's own height can't stretch the box */}
            <Box
              component="img"
              src={photo}
              alt={alt}
              sx={{ position: "absolute", inset: 0, width: 1, height: 1, objectFit: "cover", display: "block" }}
            />
            <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, display: "flex", gap: 1 }}>
              <Button variant="outlined" size="small" sx={overlayButtonSx} onClick={pick} disabled={disabled}>
                {CHANGE_BUTTON_TEXT}
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={overlayButtonSx}
                onClick={() => onChange(null)}
                disabled={disabled}
              >
                {REMOVE_BUTTON_TEXT}
              </Button>
            </Box>
          </>
        ) : (
          <Button
            variant="text"
            onClick={pick}
            disabled={disabled}
            sx={(theme) => ({
              width: 1,
              height: 1,
              borderRadius: 0,
              fontSize: 15,
              letterSpacing: "0.12em",
              color: "text.secondary",
              outline: "1px dashed #3a423d",
              outlineOffset: "-14px",
              "&:hover": {
                color: "primary.light",
                bgcolor: "rgba(52, 199, 112, 0.05)",
                outlineColor: theme.palette.primary.main,
              },
              "&.Mui-focusVisible": {
                outline: `2px solid ${theme.palette.primary.light}`,
                outlineOffset: "-14px",
              },
            })}
          >
            {emptyLabel}
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onChosen} />
      </Box>
      <ErrorAlert error={error} sx={errorSx} />
    </>
  );
}
