'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, Heart } from 'lucide-react';
import {
  getSitterBoard,
  getMyPetsForSitter,
  createSitterRequest,
} from '@/app/sitter-board/actions';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  CreateSitterRequestModal,
  type PetOption,
} from '@/components/sitter-board/create-request-modal';
import {
  RequestCard,
  applicationStage,
  type BoardRequest,
  type SitterStatsMap,
} from '@/components/sitter-board/request-card';
import { Toast } from '@/components/ui/toast';

export type SitterBoardTab = 'all' | 'mine' | 'applied';

type BoardData = {
  memberId: string | null;
  all: BoardRequest[];
  mine: BoardRequest[];
  applied: BoardRequest[];
  sitterStats: SitterStatsMap;
};

const TABS: { key: SitterBoardTab; label: string; href: string }[] = [
  { key: 'all', label: 'All requests', href: '/sitter-board' },
  { key: 'mine', label: 'My requests', href: '/sitter-board/my-requests' },
  { key: 'applied', label: 'Applied', href: '/sitter-board/applied' },
];

type FilterTab = Exclude<SitterBoardTab, 'all'>;

const STATUS_FILTERS: Record<FilterTab, { label: string; options: { key: string; label: string }[] }> = {
  mine: {
    label: 'Request status',
    options: [
      { key: 'OPEN', label: 'Open' },
      { key: 'MATCHED', label: 'Matched' },
      { key: 'DONE', label: 'Done' },
    ],
  },
  applied: {
    label: 'Application status',
    options: [
      { key: 'APPLIED', label: 'Applied' },
      { key: 'MATCHED', label: 'Matched' },
      { key: 'DONE', label: 'Done' },
    ],
  },
};

const EMPTY_COPY: Record<string, [string, string]> = {
  all: ['No open requests', 'Check back soon. New requests from neighbours appear here.'],
  'mine-OPEN': ['No open requests', 'Post a request and neighbours can offer to help.'],
  'mine-MATCHED': ['No matched requests', 'Requests move here after you confirm a sitter.'],
  'mine-DONE': ['No completed requests', 'Finished sittings appear here so you can leave a review.'],
  'applied-APPLIED': ['No pending applications', 'Browse All requests to offer your help.'],
  'applied-MATCHED': ['No matches yet', 'When an owner picks you, the request appears here.'],
  'applied-DONE': ['No completed sittings', 'Finished sittings appear here for mutual reviews.'],
};

function tabFromPath(pathname: string, fallback: SitterBoardTab): SitterBoardTab {
  return TABS.find((t) => t.href === pathname)?.key ?? fallback;
}

export function SitterBoardView({ tab: initialTab }: { tab: SitterBoardTab }) {
  const router = useRouter();
  const tab = tabFromPath(usePathname(), initialTab);
  const [modalOpen, setModalOpen] = useState(false);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<Record<FilterTab, string>>({
    mine: 'OPEN',
    applied: 'APPLIED',
  });
  const statusFilter = tab === 'all' ? null : statusFilters[tab];

  const applyBoardResult = (result: Awaited<ReturnType<typeof getSitterBoard>>) => {
    if (result.success && result.data) setBoard(result.data);
    else setError(result.error || 'An error occurred while loading data.');
  };

  const loadBoard = async () => applyBoardResult(await getSitterBoard());
  // New id each time so the same message can show again
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const showNotice = (text: string) => setNotice({ id: Date.now(), text });

  const onCardChanged = (message: string) => {
    showNotice(message);
    loadBoard();
  };

  useEffect(() => {
    getSitterBoard().then((result) => {
      applyBoardResult(result);
      // e.g. /sitter-board/my-requests?status=MATCHED or ?deleted=1
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status && STATUS_FILTERS.mine.options.some((o) => o.key === status)) {
        setStatusFilters((prev) => ({ ...prev, mine: status }));
      }
      if (params.has('deleted')) {
        setNotice({ id: Date.now(), text: 'Your sitter request was deleted.' });
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
    getMyPetsForSitter().then((result) => {
      if (result.success && result.data) setPets(result.data);
    });
  }, []);

  const visibleRequests = useMemo(() => {
    if (!board) return [];
    const q = query.trim().toLowerCase();
    return board[tab].filter((req) => {
      if (tab === 'mine' && req.status !== statusFilter) return false;
      if (tab === 'applied' && applicationStage(req, board.memberId) !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return [req.title, req.areaName, req.pet?.name, req.pet?.breed]
        .filter(Boolean)
        .some((text) => text!.toLowerCase().includes(q));
    });
  }, [board, tab, query, statusFilter]);

  const tabCount = (key: SitterBoardTab) => {
    if (!board) return '–';
    if (key === 'applied') {
      return board.applied.filter((req) => applicationStage(req, board.memberId) !== null).length;
    }
    return board[key].length;
  };

  const switchTab = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (href !== window.location.pathname) window.history.pushState(null, '', href);
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-7 py-12">
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

      <nav
        aria-label="Sitter board tabs"
        className="mb-6 inline-flex max-w-full items-center gap-1 bg-cream p-1 rounded-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map(({ key, label, href }) => {
          const active = key === tab;
          return (
            <a
              key={key}
              href={href}
              onClick={(event) => switchTab(event, href)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-[38px] shrink-0 items-center gap-[7px] px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                active ? 'bg-white text-brown shadow-xs' : 'text-brown-2 hover:text-brown'
              }`}
            >
              {label}
              <span
                className={`inline-grid h-5 min-w-[22px] place-items-center rounded-full px-[7px] text-[11px] font-semibold ${
                  active ? 'bg-sage text-olive-dark' : 'bg-white/70 text-muted'
                }`}
              >
                {tabCount(key)}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Search bar */}
      <div className="mb-6 relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
          <Search size={18} aria-hidden="true" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search current requests by pet or neighbourhood..."
          className="w-full pl-11 pr-4 py-3 rounded-16 border border-line bg-white text-brown placeholder:text-muted focus:outline-none focus-visible:shadow-focus text-sm transition-shadow shadow-card"
        />
      </div>

      {tab !== 'all' && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted mr-1">{STATUS_FILTERS[tab].label}</span>
          {STATUS_FILTERS[tab].options.map(({ key, label }) => {
            const active = key === statusFilter;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilters((prev) => ({ ...prev, [tab]: key }))}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-olive-dark border-olive-dark text-white'
                    : 'bg-white border-line-strong text-brown hover:border-beige'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Sitter request cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {error ? (
          <p className="text-coral md:col-span-2">{error}</p>
        ) : !board ? (
          [0, 1].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-[460px] rounded-2xl border border-line bg-white shadow-card animate-pulse"
            >
              <div className="h-52 rounded-t-2xl bg-cream" />
            </div>
          ))
        ) : visibleRequests.length === 0 ? (
          <EmptyState
            className="md:col-span-2"
            icon={<Heart size={22} />}
            title={EMPTY_COPY[tab === 'all' ? 'all' : `${tab}-${statusFilter}`][0]}
            text={EMPTY_COPY[tab === 'all' ? 'all' : `${tab}-${statusFilter}`][1]}
          />
        ) : (
          visibleRequests.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              variant={tab}
              memberId={board.memberId}
              sitterStats={board.sitterStats}
              onChanged={onCardChanged}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <CreateSitterRequestModal
          open
          onClose={() => setModalOpen(false)}
          pets={pets}
          onSubmit={async (formData) => {
            const result = await createSitterRequest(formData);
            if (!result.success) throw new Error(result.error);
            await loadBoard();
          }}
          onViewBoard={() => router.push('/sitter-board')}
          onViewMyRequest={() => router.push('/sitter-board/my-requests')}
        />
      )}

      {notice && <Toast key={notice.id} message={notice.text} />}
    </main>
  );
}
