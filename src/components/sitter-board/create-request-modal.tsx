"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
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

export type CreateSitterRequestModalProps = {
  open: boolean;
  onClose: () => void;
  pets: PetOption[];
  onSubmit: (formData: {
    petId: string;
    date: string;
    duration: string;
    startTime: string;
    endTime: string;
    location: string;
    title: string;
    description: string;
  }) => Promise<void> | void;
  onViewBoard?: () => void;
  onViewMyRequest?: () => void;
};

const FORM_ID = "sitter-request-form";

const labelClass = "block text-xs font-medium text-muted mb-1.5";
const fieldClass =
  "w-full px-4 py-2.5 rounded-full border border-line bg-white text-brown placeholder:text-muted text-sm focus:outline-none focus-visible:shadow-focus";
const sectionTitleClass = "block text-base font-semibold text-brown mb-3";

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
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("1-2 hours");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Loading / success / error
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;

    setBusy(true);
    setError("");
    try {
      await onSubmit({
        petId: selectedPetId,
        date,
        duration,
        startTime,
        endTime,
        location,
        title,
        description,
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
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
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
          <Button type="submit" form={FORM_ID} loading={busy} disabled={!selectedPetId}>
            Post sitter request
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </>
      }
    >
      {/* 폼 안쪽만 스크롤 → footer(Cancel / Post)는 항상 보임.
          300px은 헤더+푸터+여백 근사치. 푸터가 잘리면 320px, 폼이 짧으면 280px로 조정. */}
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
                  pet.age ? `${pet.age} years` : null,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sitter-date" className={labelClass}>
                Date
              </label>
              <input
                id="sitter-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="sitter-duration" className={labelClass}>
                Duration
              </label>
              <div className="relative">
                <select
                  id="sitter-duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`${fieldClass} appearance-none pr-10`}
                >
                  <option value="Under 1 hour">Under 1 hour</option>
                  <option value="1-2 hours">1–2 hours</option>
                  <option value="Half day">Half day</option>
                  <option value="Full day">Full day</option>
                  <option value="Overnight">Overnight</option>
                </select>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-brown"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sitter-start" className={labelClass}>
                Start time
              </label>
              <input
                id="sitter-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="sitter-end" className={labelClass}>
                End time
              </label>
              <input
                id="sitter-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
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