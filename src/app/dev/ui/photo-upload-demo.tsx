"use client";

import { useState } from "react";
import { PhotoUpload } from "@/components/ui/photo-upload";

export function PhotoUploadDemo() {
  const [photo, setPhoto] = useState<File | null>(null);

  return (
    <div className="max-w-sm">
      <PhotoUpload value={photo} onChange={setPhoto} />
    </div>
  );
}
