import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { COULDNT_SAVE_TEXT, SAVING_TEXT } from "../../Constants";
import ErrorAlert from "./ErrorAlert";

type FormActionsProps = {
  isPending: boolean;
  /** Submit button text while not saving, e.g. "Add vehicle". */
  label: string;
  /** Validation error from the form itself. */
  error?: string | null;
  /** Error from the save mutation. */
  saveError?: Error | null;
  /** Optional hint, e.g. "* required". */
  note?: string;
  /** Whether the note sits above or below the submit button (the existing forms differ). */
  notePosition?: "before" | "after";
};

/** The bottom of a form: submit button, optional note, then the validation and save errors. */
export default function FormActions({
  isPending,
  label,
  error,
  saveError,
  note,
  notePosition = "before",
}: FormActionsProps) {
  const noteEl = note && (
    <Typography variant="body2" color="text.secondary">
      {note}
    </Typography>
  );
  return (
    <>
      {notePosition === "before" && noteEl}
      <Button type="submit" variant="contained" disabled={isPending} sx={{ mt: 1, py: 1.5 }}>
        {isPending ? SAVING_TEXT : label}
      </Button>
      {notePosition === "after" && noteEl}
      <ErrorAlert error={error} />
      <ErrorAlert prefix={COULDNT_SAVE_TEXT} error={saveError} />
    </>
  );
}
