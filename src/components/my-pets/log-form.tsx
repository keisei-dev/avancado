"use client";

// One form for all 7 health logs. The fields come from LOG_CONFIG.

import { useActionState, useState } from "react";
import { saveLog, type PetActionResult } from "@/app/my-pets/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { ChoicePills } from "@/components/ui/toggle";
import { isoToLocalInput, localInputToIso, today } from "@/lib/pets/format";
import { LOG_CONFIG, type AnyLog, type LogField } from "@/lib/pets/log-config";
import type { LogKind } from "@/lib/pets/types";

export type LogFormProps = {
  petId: string;
  kind: LogKind;
  /** Edit mode when set. */
  log?: AnyLog;
  onCancel: () => void;
  onDone: () => void;
};

export function LogForm({ petId, kind, log, onCancel, onDone }: LogFormProps) {
  const config = LOG_CONFIG[kind];

  const [state, formAction, pending] = useActionState(
    async (previous: PetActionResult, form: FormData) => {
      // <input type="datetime-local"> has no time zone. Convert it to an
      // ISO string here, in the browser, which knows the user's time zone.
      for (const field of config.fields) {
        if (field.type === "datetime") {
          form.set(
            field.key,
            localInputToIso(String(form.get(field.key) ?? "")),
          );
        }
      }
      const result = await saveLog(previous, form);
      if (!result.error) onDone();
      return result;
    },
    { error: "" },
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="petId" value={petId} />
      {log && <input type="hidden" name="logId" value={String(log.id)} />}

      <fieldset disabled={pending} className="grid gap-4 tablet:grid-cols-2">
        {config.fields.map((field) => (
          <LogFieldInput
            key={field.key}
            field={field}
            initial={initialValue(field, log)}
          />
        ))}
      </fieldset>

      {state.error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {state.error}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-line pt-5 tablet:flex-row tablet:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {log ? "Save changes" : `Add ${config.singular}`}
        </Button>
      </div>
    </form>
  );
}

/** The value a field starts with: the saved value, or a useful default. */
function initialValue(field: LogField, log?: AnyLog): string {
  if (log) {
    const value = log[field.key];
    if (value === null || value === undefined) return "";
    if (field.type === "datetime") return isoToLocalInput(String(value));
    return String(value);
  }
  if (field.type === "date") return field.startEmpty ? "" : today();
  if (field.type === "datetime")
    return isoToLocalInput(new Date().toISOString());
  if (field.type === "choice") return field.options?.[0]?.value ?? "";
  return "";
}

const SELECT_CLASS =
  "min-h-12 w-full rounded-12 border border-line bg-white px-4 text-[15px] text-brown outline-none transition-[border-color,box-shadow] focus:border-olive focus:shadow-focus";

function LogFieldInput({
  field,
  initial,
}: {
  field: LogField;
  initial: string;
}) {
  const id = `log-${field.key}`;
  const span = field.full ? "tablet:col-span-2" : undefined;

  if (field.type === "choice") {
    return <ChoiceField field={field} initial={initial} className={span} />;
  }

  return (
    <Field
      id={id}
      label={field.label}
      hint={field.hint}
      required={field.required}
      className={span}
    >
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          name={field.key}
          defaultValue={initial}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          rows={3}
        />
      ) : field.type === "select" ? (
        <SelectField id={id} field={field} initial={initial} />
      ) : (
        <Input
          id={id}
          name={field.key}
          type={field.type === "datetime" ? "datetime-local" : field.type}
          defaultValue={initial}
          required={field.required}
          step={field.step}
          min={field.min}
          max={
            field.type === "date" && !field.allowFuture ? today() : undefined
          }
          maxLength={field.maxLength}
          placeholder={field.placeholder}
        />
      )}
    </Field>
  );
}

// Controlled, so the choice stays after a failed submit
// (React resets uncontrolled fields after a form action).
function SelectField({
  id,
  field,
  initial,
}: {
  id: string;
  field: LogField;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <select
      id={id}
      name={field.key}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={SELECT_CLASS}
    >
      <option value="">—</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ChoicePills has no "name", so a hidden input sends the value.
function ChoiceField({
  field,
  initial,
  className,
}: {
  field: LogField;
  initial: string;
  className?: string;
}) {
  const options = field.options ?? [];
  const [value, setValue] = useState(initial);
  const labelOf = (v: string) =>
    options.find((option) => option.value === v)?.label;

  return (
    <div className={className}>
      <p className="mb-1.5 text-sm font-medium text-brown">{field.label}</p>
      <input type="hidden" name={field.key} value={value} />
      <ChoicePills
        label={field.label}
        options={options.map((option) => option.label)}
        defaultValue={labelOf(initial)}
        onChange={(label) =>
          setValue(
            options.find((option) => option.label === label)?.value ?? "",
          )
        }
      />
    </div>
  );
}
