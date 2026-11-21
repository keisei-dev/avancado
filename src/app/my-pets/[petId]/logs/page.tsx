// Notion flow: My Pets: Add/edit health data log
// Every entry of one log, newest first, with add / edit / delete.

import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  AddLogButton,
  LogEntryActions,
} from "@/components/my-pets/log-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentMember } from "@/lib/auth/member";
import { LOG_CONFIG, type AnyLog } from "@/lib/pets/log-config";
import { getMyPetDetail } from "@/lib/pets/queries";
import { isLogKind } from "@/lib/pets/types";

export default function PetLogsPage({
  params,
  searchParams,
}: PageProps<"/my-pets/[petId]/logs">) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted" role="status">
          Loading log…
        </p>
      }
    >
      <LogList params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function LogList({
  params,
  searchParams,
}: PageProps<"/my-pets/[petId]/logs">) {
  const { petId } = await params;
  const { kind } = await searchParams;
  if (!isLogKind(kind)) notFound();

  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const detail = await getMyPetDetail(member.id, petId);
  if (!detail) notFound();

  const config = LOG_CONFIG[kind];
  if (config.dogsOnly && detail.pet.species !== "DOG") notFound();

  const Icon = config.icon;
  const logs: AnyLog[] = detail.logs[kind];

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/my-pets/${petId}`}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-olive-dark hover:text-olive"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to {detail.pet.name}
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
            {detail.pet.name}
          </p>
          <h2 className="text-[28px] font-display text-2xl font-bold text-brown">
            {config.title}
          </h2>
        </div>
        <AddLogButton petId={petId} kind={kind} />
      </header>

      {logs.length === 0 ? (
        <EmptyState
          icon={<Icon size={24} />}
          title="Nothing logged yet"
          text={`Add the first ${config.singular} for ${detail.pet.name}.`}
        />
      ) : (
        <ul className="grid gap-2">
          {logs.map((log) => {
            const summary = config.summary(log);
            return (
              <li
                key={String(log.id)}
                className="flex flex-col gap-2 rounded-16 border border-line bg-white p-4 tablet:flex-row tablet:items-start tablet:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted">{summary.meta}</p>
                  <p className="font-semibold text-brown">{summary.title}</p>
                  {summary.note && (
                    <p className="mt-1 text-sm whitespace-pre-line text-muted">
                      {summary.note}
                    </p>
                  )}
                </div>
                <LogEntryActions petId={petId} kind={kind} log={log} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
