// Browser-only helpers for pet photos: shrink, upload, and clean up.
// Import these only from Client Components.

import { createClient } from "@/lib/supabase/client";

const BUCKET = "pet-photos";
const MAX_SIDE = 1200; // px, longest side
const QUALITY = 0.85; // JPEG quality (0 to 1)

/** Shrinks a photo so its longest side is at most 1200px, as a JPEG. */
export async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported.");
  // JPEG has no transparency: paint white first, or see-through PNG areas turn black.
  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Compression failed.")),
      "image/jpeg",
      QUALITY,
    );
  });
}

/** Uploads to pet-photos/{memberId}/{random id}.jpg and returns the path. */
export async function uploadPetPhoto(
  memberId: string,
  file: File,
): Promise<string> {
  const blob = await compressPhoto(file);
  const path = `${memberId}/${crypto.randomUUID()}.jpg`;
  const { error } = await createClient()
    .storage.from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw new Error(error.message);
  return path;
}

/** Deletes a photo that was uploaded but not used (for example, the save failed). */
export async function removePetPhoto(path: string): Promise<void> {
  try {
    await createClient().storage.from(BUCKET).remove([path]);
  } catch {
    // Best effort: an unused file is harmless.
  }
}
