"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export type PetOption = {
  id: string;
  name: string;
  breed?: string | null;
  age?: number | null;
  imageUrl?: string | null;
  vaccinated?: boolean;
};

// Value sent to the server: ISO string built in the browser (user's local timezone)
export type SitterRequestFormData = {
  petIds: string[];
  title: string;
  description: string;
  areaName: string;
  startAt: string;
  endAt: string;
};

export type CreateSitterRequestModalProps = {
  open: boolean;
  onClose: () => void;
  pets: PetOption[];
  onSubmit: (formData: SitterRequestFormData) => Promise<void> | void;
  onViewBoard?: () => void;
  onViewMyRequest?: () => void;
};

const FORM_ID = "sitter-request-form";
const MAX_DAYS = 30;

const labelClass = "block text-xs font-medium text-muted mb-1.5";
const fieldClass =
  "w-full px-4 py-2.5 rounded-full border border-line bg-white text-brown placeholder:text-muted text-sm focus:outline-none focus-visible:shadow-focus";
const sectionTitleClass = "block text-base font-semibold text-brown mb-3";
const warnClass = "mt-1.5 text-xs text-coral";

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDuration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (mins && !days) parts.push(`${mins} min`);
  return parts.join(" ") || "0 min";
}

export function CreateSitterRequestModal({
  open,
  onClose,
  pets,
  onSubmit,
  onViewBoard,
  onViewMyRequest,
}: CreateSitterRequestModalProps) {
  // Form state
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Loading / success / error
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // ---------- Date/time calculation ----------
  const effectiveEndDate = endDate || startDate; // Empty end date means a single-day request
  const multiDay = Boolean(startDate) && effectiveEndDate > startDate;
  const sameDay = Boolean(startDate) && effectiveEndDate === startDate;

  // For multi-day requests, fill empty times with 00:00 / 23:59
  const effStart = startTime || (multiDay ? "00:00" : "");
  const effEnd = endTime || (multiDay ? "23:59" : "");

  const startAtDate =
    startDate && effStart ? new Date(`${startDate}T${effStart}`) : null;
  const endAtDate =
    effectiveEndDate && effEnd ? new Date(`${effectiveEndDate}T${effEnd}`) : null;

  const durationMinutes =
    startAtDate && endAtDate
      ? Math.round((endAtDate.getTime() - startAtDate.getTime()) / 60000)
      : null;

  // ---------- Validation messages ----------
  let dateError = "";
  let timeError = "";
  if (startDate && effectiveEndDate < startDate) {
    dateError = "End date must be on or after the start date.";
  } else if (durationMinutes !== null && durationMinutes <= 0) {
    timeError = "End time must be after the start time.";
  } else if (durationMinutes !== null && durationMinutes > MAX_DAYS * 24 * 60) {
    dateError = `A request can be at most ${MAX_DAYS} days long.`;
  }

  const canSubmit =
    Boolean(selectedPetId) &&
    Boolean(startDate) &&
    startAtDate !== null &&
    endAtDate !== null &&
    durationMinutes !== null &&
    durationMinutes > 0 &&
    !dateError &&
    !timeError &&
    location.trim() !== "" &&
    title.trim() !== "" &&
    description.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !startAtDate || !endAtDate) return;

    setBusy(true);
    setError("");
    try {
      await onSubmit({
        petIds: [selectedPetId], // Only one pet for now; keep the array as-is when multi-pet support is added
        title: title.trim(),
        description: description.trim(),
        areaName: location.trim(),
        startAt: startAtDate.toISOString(),
        endAt: endAtDate.toISOString(),
      });
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to create sitter request:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  // ---------- Success view ----------
  if (isSuccess) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        centered
        size="default"
        title={
          <>
            <span
              aria-hidden="true"
              className="mx-auto mb-3.5 grid size-16 place-items-center rounded-full bg-sage-soft text-olive shadow-[0_0_0_8px_var(--color-sage-faint)]"
            >
              <Check size={30} strokeWidth={2.5} />
            </span>
            Your sitter request is live
          </>
        }
        lead="Neighbours can now view your request and apply. We'll notify you when someone offers to help."
        footer={
          <div className="flex w-full! flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                handleClose();
                onViewBoard?.();
              }}
            >
              Back to board
            </Button>
            <Button
              onClick={() => {
                handleClose();
                onViewMyRequest?.();
              }}
            >
              View my request
            </Button>
          </div>
        }
      />
    );
  }

  // ---------- Form view ----------
  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="wide"
      eyebrow="NEW SITTER REQUEST"
      title="Who can we care for?"
      lead="Share your pet's routine and exactly what kind of help you need."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={busy} disabled={!canSubmit}>
            Post sitter request
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="-mr-2 max-h-[calc(100dvh-300px)] min-h-[200px] overflow-y-auto pr-2"
      >
        {/* 1. Choose your pet */}
        <section className="border-b border-line pb-6">
          <span className={sectionTitleClass}>1. Choose your pet</span>

          {pets.length === 0 ? (
            <p className="text-sm text-muted">
              You don&apos;t have any pets yet. Add a pet first to post a request.
            </p>
          ) : (
            <div
              role="radiogroup"
              aria-label="Choose your pet"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {pets.map((pet) => {
                const isSelected = selectedPetId === pet.id;
                const info = [
                  pet.breed,
                  pet.age != null ? `${pet.age} years` : null,
                  pet.vaccinated ? "Vaccinated" : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <button
                    key={pet.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`relative flex h-full items-center gap-3.5 p-3.5 rounded-20 border-2 text-left transition-all focus-visible:shadow-focus focus-visible:outline-none ${
                      isSelected
                        ? "border-olive bg-sage-faint shadow-card"
                        : "border-line bg-white hover:border-beige"
                    }`}
                  >
                    <div className="relative size-14 rounded-xl overflow-hidden bg-ivory shrink-0">
                      {pet.imageUrl ? (
                        <Image
                          src={pet.imageUrl}
                          alt={pet.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                          Pet
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-semibold text-brown text-base truncate">{pet.name}</h3>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{info}</p>
                    </div>

                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-olive"
                      >
                        <Check size={18} strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Date and time */}
        <section className="border-b border-line py-6">
          <span className={sectionTitleClass}>2. Date and time</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label htmlFor="sitter-start-date" className={labelClass}>
                Start date
              </label>
              <input
                id="sitter-start-date"
                type="date"
                required
                min={todayStr()}
                value={startDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartDate(v);
                  // If the end date ends up before the start date, snap it to the start date
                  if (endDate && v && endDate < v) setEndDate(v);
                }}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="sitter-end-date" className={labelClass}>
                End date
              </label>
              <input
                id="sitter-end-date"
                type="date"
                min={startDate || todayStr()}
                value={effectiveEndDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={fieldClass}
              />
              {dateError && <p className={warnClass}>{dateError}</p>}
            </div>

            <div>
              <label htmlFor="sitter-start" className={labelClass}>
                Start time {multiDay && <span className="text-muted">(optional)</span>}
              </label>
              <input
                id="sitter-start"
                type="time"
                required={sameDay}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="sitter-end" className={labelClass}>
                End time {multiDay && <span className="text-muted">(optional)</span>}
              </label>
              <input
                id="sitter-end"
                type="time"
                required={sameDay}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={fieldClass}
              />
              {timeError && <p className={warnClass}>{timeError}</p>}
            </div>
          </div>

          {/* Total */}
          {durationMinutes !== null && durationMinutes > 0 && !dateError && (
            <p className="mt-4 text-sm font-medium text-olive-dark">
              Total: {formatDuration(durationMinutes)}
              {multiDay && !startTime && !endTime ? " (all day)" : ""}
            </p>
          )}
          {multiDay && (
            <p className="mt-1 text-xs text-muted">
              Leave the times empty to request care for the full days.
            </p>
          )}
        </section>

        {/* 3. Care details */}
        <section className="pt-6">
          <span className={sectionTitleClass}>3. Care details</span>
          <div className="space-y-4">
            <div>
              <label htmlFor="sitter-location" className={labelClass}>
                Location
              </label>
              <input
                id="sitter-location"
                type="text"
                required
                placeholder="Neighbourhood, e.g. Kitsilano"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="sitter-title" className={labelClass}>
                Title
              </label>
              <input
                id="sitter-title"
                type="text"
                required
                placeholder="A clear title for your request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="sitter-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="sitter-description"
                rows={4}
                required
                placeholder="Care instructions, routines, medication, and what you would like the sitter to do..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-20 border border-line bg-white text-brown placeholder:text-muted text-sm focus:outline-none focus-visible:shadow-focus resize-none"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-coral">
              {error}
            </p>
          )}
        </section>
      </form>
    </Modal>
  );
}