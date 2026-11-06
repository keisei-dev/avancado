"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText } from "lucide-react";
import { deleteUser } from "@/app/admin/(protected)/users/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function UsersPerPageSelect({
  value,
  hrefs,
}: {
  value: number;
  hrefs: Record<5 | 10 | 25, string>;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      Rows per page
      <select
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (next === 5 || next === 10 || next === 25) {
            router.push(hrefs[next]);
          }
        }}
        className="h-9 rounded-12 border border-line bg-white px-2 text-[13px] font-medium text-brown"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
      </select>
    </label>
  );
}

export function DeleteUserButton({
  userId,
  userName,
  disabled,
}: {
  userId: string;
  userName: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-coral disabled:cursor-not-allowed disabled:opacity-45"
      >
        Delete
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Permanent action"
        title={`Delete ${userName}’s account?`}
        lead="This permanently removes it from Avancado and cannot be undone. Use Hide if you might want to restore it later."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteUser} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="danger">
                Delete permanently
              </Button>
            </form>
          </>
        }
      />
    </>
  );
}

export function ReviewDocumentButton({
  name,
  email,
  documentLabel,
  documentPath,
}: {
  name: string;
  email: string;
  documentLabel: string;
  documentPath: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-brown-2"
      >
        Review
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Identity document"
        title={name}
        lead={email}
      >
        <div className="flex items-center gap-3 rounded-12 bg-ivory p-3">
          <span className="grid h-10 w-10 place-items-center rounded-10 bg-white text-olive-hover">
            <FileText size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-brown">{documentLabel}</p>
            <p className="text-[13px] text-muted">
              {documentPath
                ? "Document on file"
                : "No file is stored for this request"}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
