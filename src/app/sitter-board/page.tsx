import Image from 'next/image';
import Link from 'next/link';
import { getSitterRequests } from './actions';

export const instant = false;

export default async function SitterBoardPage() {
  const result = await getSitterRequests();

  if (!result.success || !result.data) {
    return (
      <div className="p-6 text-red-500">
        {result.error || 'An error occurred while loading data.'}
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sitter board</h1>
        <p className="text-gray-500">Pet owners post care requests. Local sitters apply to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.data.length === 0 ? (
          <p className="text-gray-500 col-span-2">No sitter requests found.</p>
        ) : (
          result.data.map((req) => {
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative w-full h-52 bg-gray-100">
                    {req.pet?.imageUrl ? (
                      <Image
                        src={req.pet.imageUrl}
                        alt={req.pet.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Pet Image
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      {startDateFormatted}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 tracking-wider mb-2">
                      <span className="text-emerald-700 font-bold uppercase">♡ HELP REQUESTED</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                      {req.title}
                    </h2>

                    <p className="text-sm text-gray-500 mb-4">
                      <span className="font-medium text-gray-700">{req.pet?.name}</span>
                      {req.pet?.breed && ` · ${req.pet.breed}`}
                      {req.author?.name && ` · Posted by ${req.author.name}`}
                    </p>

                    <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          📅 {startDateFormatted}
                        </span>
                        <span className="flex items-center gap-1.5">
                          ⏰ {startTime} – {endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {durationHours && (
                          <span className="flex items-center gap-1.5">
                            ⚡ {durationHours} hours
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          📍 {req.areaName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs font-medium text-gray-600">
                    <strong className="text-gray-900">{req.applications?.length || 0}</strong> applicants
                  </span>
                  <Link
                    href={`/sitter-board/${req.id}`}
                    className="text-xs font-semibold text-gray-700 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    View details
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}