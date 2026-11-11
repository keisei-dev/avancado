"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Camera, MapPin, PawPrint, Send, TriangleAlert, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CommunityPostView } from "./post-card";
import { createPost } from "@/app/community/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClass } from "@/components/ui/button";

export function PostComposer({
  member,
  existing,
  onClose,
  onSuccess,
  onBusyChange,
}: {
  member: { id: string; name: string; image: string | null };
  existing?: CommunityPostView;
  onClose?: () => void;
  onSuccess?: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [state, action, pending] = useActionState(
    async (previous: { error: string }, data: FormData) => {
      setError("");
      if (!file && !existing) return { error: "Please add a photo." };
      if (onSuccess) data.set("inline", "true");
      if (existing) data.set("postId", existing.id);
      const supabase = createClient();
      const path = file
        ? `${member.id}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`
        : "";
      if (file) {
        try {
          const { error: uploadError } = await supabase.storage
            .from("community-posts")
            .upload(path, file, { contentType: file.type });
          if (uploadError) {
            console.error("Community photo upload failed", {
              message: uploadError.message,
              status: uploadError.statusCode,
            });
            return { error: "Photo upload failed. Please try again." };
          }
        } catch {
          return {
            error: "Photo upload failed. Please check your connection.",
          };
        }
        data.set("imagePath", path);
      }
      const result = await createPost(previous, data);
      if (!result.error) {
        onSuccess?.();
        return result;
      }
      try {
        if (path) await supabase.storage.from("community-posts").remove([path]);
      } catch {
        console.error("Unused community photo cleanup failed");
      }
      return result;
    },
    { error: "" },
  );
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);
  useEffect(() => {
    onBusyChange?.(pending);
  }, [pending, onBusyChange]);
  const busy = pending;
  return (
    <form
      action={action}
      className={
        onClose
          ? "space-y-4"
          : "space-y-5 rounded-20 border border-line bg-white p-5 shadow-card sm:p-8"
      }
    >
      {!onClose && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-olive">
            New community post
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            Share with your neighbours
          </h1>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Avatar name={member.name} src={member.image} />
        <div>
          <p className="text-sm font-semibold">{member.name}</p>
          <p className="text-xs text-muted">Posting to Avancado Community</p>
        </div>
      </div>
      <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
        <div className="relative">
          <label className="relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-16 border-2 border-dashed border-line-strong bg-ivory text-center focus-within:shadow-focus">
            {preview || existing?.imageUrl ? (
              <img
                src={preview || existing?.imageUrl}
                alt="Selected photo preview"
                className="max-h-[280px] w-full object-contain"
              />
            ) : (
              <>
                <Camera size={32} className="text-olive" />
                <strong>Add a photo</strong>
                <span className="px-4 text-xs text-muted">
                  Choose a clear JPG or PNG from your device · Up to 5 MB
                </span>
              </>
            )}
            <input
              aria-label="Choose post photo"
              type="file"
              accept="image/jpeg,image/png"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                e.target.value = "";
                if (!selected) return;
                if (
                  !["image/jpeg", "image/png"].includes(selected.type) ||
                  selected.size > 5242880
                ) {
                  setError("Choose a JPG or PNG under 5 MB.");
                  return;
                }
                const url = URL.createObjectURL(selected);
                setFile(selected);
                setPreview(url);
                setError("");
              }}
            />
          </label>
          {file && (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => {
                setFile(null);
                setPreview("");
              }}
              className="absolute top-3 right-3 rounded-full bg-white p-2 shadow-card"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <label className="block text-sm font-semibold">
          Caption
          <textarea
            defaultValue={existing?.caption}
            name="caption"
            required
            maxLength={2000}
            rows={4}
            placeholder="Write something about this photo..."
            className="mt-2 w-full resize-y rounded-12 border border-line-strong p-3 font-normal outline-none focus:border-olive focus:shadow-focus"
          />
        </label>
        <label className="flex items-center gap-2 rounded-12 border border-line-strong px-3">
          <MapPin size={18} className="text-muted" />
          <input
            defaultValue={existing?.location ?? ""}
            name="location"
            aria-label="Location (optional)"
            maxLength={100}
            placeholder="Add location (optional)"
            className="min-w-0 flex-1 py-3 text-sm outline-none"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Post as</legend>
          <div className="flex flex-wrap gap-3">
            {[
              { value: "GENERAL", label: "Community Post", Icon: PawPrint },
              {
                value: "LOST_PET",
                label: "Lost and Found",
                Icon: TriangleAlert,
              },
            ].map(({ value, label, Icon }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm has-checked:border-olive has-checked:bg-olive-dark has-checked:text-white"
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  defaultChecked={existing?.type === value}
                  required
                  className="sr-only"
                />
                <Icon size={15} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>
      {(error || state.error) && (
        <p
          role="alert"
          className="rounded-12 bg-coral-soft p-3 text-sm text-coral"
        >
          {error || state.error}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        {onClose ? (
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <Link
            href="/community"
            aria-disabled={busy}
            className={buttonClass({
              variant: "secondary",
              className: busy ? "pointer-events-none opacity-50" : "",
            })}
          >
            Cancel
          </Link>
        )}
        <Button type="submit" loading={busy}>
          <Send size={16} />
          {pending ? "Posting…" : existing ? "Save" : "Post"}
        </Button>
      </div>
    </form>
  );
}
