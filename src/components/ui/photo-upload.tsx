"use client";

// UI library (P3): PhotoUpload
/**
 * Pick a photo, show a preview, remove it. Image types only.
 * Used by post composer, pet form, reviews, verification.
 *
 *   const [photo, setPhoto] = useState<File | null>(null);
 *   <PhotoUpload value={photo} onChange={setPhoto} />
 */

import { useMemo } from "react";
import { Camera, X } from "lucide-react";

export type PhotoUploadProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
};

export function PhotoUpload({
  value,
  onChange,
  label = "Add a photo",
  hint = "JPG or PNG",
}: PhotoUploadProps) {
  // Make a preview link only when the file changes
  const preview = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  // Remove or replace the photo. Also deletes the old preview link (saves memory).
  function change(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    onChange(file);
  }

  // With a photo: show it with a remove (×) button
  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-16 border border-line">
        <img
          src={preview}
          alt="Selected photo"
          className="h-48 w-full object-cover"
        />
        <button
          type="button"
          onClick={() => change(null)}
          aria-label="Remove photo"
          className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-white text-brown shadow-card hover:text-coral"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // Empty: dashed box. The real file input covers the whole box, invisible.
  return (
    <label className="relative grid min-h-[150px] cursor-pointer place-items-center content-center gap-1 rounded-16 border-[1.5px] border-dashed border-line-strong bg-ivory p-6 text-center text-olive-dark hover:border-olive hover:bg-sage-faint">
      <Camera size={26} aria-hidden="true" />
      <span className="mt-1.5 text-sm font-semibold text-brown">{label}</span>
      <span className="text-[13px] text-muted">{hint}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          change(event.target.files?.[0] ?? null);
          event.target.value = ""; // lets you pick the same photo again later
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
