'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { getSitterRequests, getMyPetsForSitter } from './actions';
import { buttonClass, Button } from '@/components/ui/button';
import {
  CreateSitterRequestModal,
  type PetOption,
} from '@/components/sitter-board/create-request-modal';

type SitterRequests = NonNullable<Awaited<ReturnType<typeof getSitterRequests>>['data']>;


export default function SitterBoardPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [requests, setRequests] = useState<SitterRequests | null>(null);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    getSitterRequests().then((result) => {
      if (result.success && result.data) setRequests(result.data);
      else setError(result.error || 'An error occurred while loading data.');
    });
    getMyPetsForSitter().then((result) => {
      if (result.success && result.data) setPets(result.data);
    });
  }, []);

  if (error) {
    return <div className="p-6 text-coral">{error}</div>;
  }

  if (!requests) {
    return <div className="p-6 text-muted">Loading...</div>;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-7 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-olive-dark mb-1">
            NEIGHBOURHOOD CARE NETWORK
          </span>
          <h1 className="text-[30px] font-display font-bold tracking-[-0.02em] leading-[1.2] text-brown mb-2">
            Sitter board
          </h1>
          <p className="text-muted text-sm">
            Pet owners post care requests. Local sitters apply to help.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Request a sitter
        </Button>
      </div>

      <div className="mb-6 inline-flex max-w-full items-center gap-1 bg-cream p-1 rounded-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/sitter-board"
          className="bg-white text-brown font-semibold px-4 py-1.5 rounded-full text-sm shadow-card inline-flex items-center gap-2 transition-colors"
        >
          All requests
          <span className="text-xs bg-line text-brown-2 px-1.5 py-0.5 rounded-full font-medium">
            {requests.length}
          </span>
        </Link>
        <Link
          href="/sitter-board/my-requests"
          className="text-muted hover:text-brown font-medium px-4 py-1.5 rounded-full text-sm inline-flex items-center gap-2 transition-colors"
        >
          My requests
          <span className="text-xs text-muted font-medium">3</span>
        </Link>
        <Link
          href="/sitter-board/applied"
          className="text-muted hover:text-brown font-medium px-4 py-1.5 rounded-full text-sm inline-flex items-center gap-2 transition-colors"
        >
          Applied
          <span className="text-xs text-muted font-medium">3</span>
        </Link>
      </div>

      {/* Search bar */}
      <div className="mb-8 relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
          <Search size={18} aria-hidden="true" />
        </span>
        <input
          type="text"
          placeholder="Search current requests by pet or neighbourhood..."
          className="w-full pl-11 pr-4 py-3 rounded-16 border border-line bg-white text-brown placeholder:text-muted focus:outline-none focus-visible:shadow-focus text-sm transition-shadow shadow-card"
        />
      </div>

      {/* Sitter request cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.length === 0 ? (
          <p className="text-muted md:col-span-2">No sitter requests found.</p>
        ) : (
          requests.map((req) => {
            const startDateFormatted = new Date(req.startAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            const startTime = new Date(req.startAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            const endTime = new Date(req.endAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            const durationHours = req.durationMinutes
              ? (req.durationMinutes / 60).toFixed(1).replace('.0', '')
              : null;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-line shadow-card overflow-hidden flex flex-col justify-between hover:shadow-raised transition-shadow"
              >
                <div>
                  <div className="relative w-full h-52 bg-ivory">
                    {req.pet?.imageUrl ? (
                      <Image
                        src={req.pet.imageUrl}
                        alt={req.pet.name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                        No Pet Image
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brown text-xs font-semibold px-3 py-1.5 rounded-full shadow-card">
                      {startDateFormatted}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted tracking-wider mb-2">
                      <span className="text-success font-bold uppercase">♡ HELP REQUESTED</span>
                    </div>

                    <h2 className="text-xl font-display font-bold text-brown mb-1 line-clamp-1">
                      {req.title}
                    </h2>

                    <p className="text-sm text-muted mb-4">
                      <span className="font-medium text-brown">{req.pet?.name}</span>
                      {req.pet?.breed && ` · ${req.pet.breed}`}
                      {req.author?.name && ` · Posted by ${req.author.name}`}
                    </p>

                    <div className="space-y-2 text-xs text-brown-2 border-t border-line pt-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">📅 {startDateFormatted}</span>
                        <span className="flex items-center gap-1.5">
                          ⏰ {startTime} – {endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {durationHours && (
                          <span className="flex items-center gap-1.5">⚡ {durationHours} hours</span>
                        )}
                        <span className="flex items-center gap-1.5">📍 {req.areaName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-line flex items-center justify-between bg-ivory/50">
                  <span className="text-xs font-medium text-muted">
                    <strong className="text-brown">{req.applications?.length || 0}</strong>{' '}
                    applicants
                  </span>
                  <Link
                    href={`/sitter-board/${req.id}`}
                    className={buttonClass({ variant: 'secondary', size: 'sm' })}
                  >
                    View details
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <CreateSitterRequestModal
          open
          onClose={() => setModalOpen(false)}
          pets={pets}
          onSubmit={async (formData) => {
            // TODO:
            console.log('submit:', formData);
            await new Promise((r) => setTimeout(r, 800));
          }}
          onViewBoard={() => router.push('/sitter-board')}
          onViewMyRequest={() => router.push('/sitter-board/my-requests')}
        />
      )}
    </main>
  );
}