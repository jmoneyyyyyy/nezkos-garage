import type { ChangeEvent } from "react";
import { PHOTO_TOO_LARGE_ERROR } from "../Constants";

// Firestore docs max out at 1MB, and the photo shares that with the service records,
// so photos are scaled down and re-encoded as JPEG before saving.
const MAX_PHOTO_CHARS = 600_000;

export async function resizeImage(file: File, maxSize = 800, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > MAX_PHOTO_CHARS) throw new Error(PHOTO_TOO_LARGE_ERROR);
  return dataUrl;
}

// For an <input type="file">'s onChange: resizes the chosen photo, or returns null if
// the picker was cancelled. Throws if the browser can't read the image (e.g. HEIC in Chrome).
export async function photoFromInput(e: ChangeEvent<HTMLInputElement>): Promise<string | null> {
  const file = e.target.files?.[0];
  e.target.value = ""; // so picking the same file again still fires onChange
  return file ? resizeImage(file) : null;
}
