import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import { ReportRequestButton } from '@/components/sitter-board/report-request-button';
import { getCurrentMember } from '@/lib/auth/member';
import { getSitterRequestDetail } from './actions';

export const instant = false;

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default async function SitterDetailPage({ params }: PageProps) {
  await connection();

  const resolvedParams = await params;
  const requestId = resolvedParams.requestId;
  
  const [result, member] = await Promise.all([
    getSitterRequestDetail(requestId),
    getCurrentMember(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        {result.error || 'An error occurred while loading the details.'}
      </div>
    );
  }

  const req = result.data;
  const pet = req.pet;

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

  // eslint-disable-next-line react-hooks/purity
  const nowTime = Date.now();

  const calculateAge = (birthDate: Date | null, currentTime: number) => {
    if (!birthDate) return 'N/A';
    const ageDifMs = currentTime - new Date(birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    return years > 0 ? `${years} years` : 'Less than a year';
  };

  const timeAgo = (dateString: Date | string, currentTime: number) => {
    const seconds = Math.floor((currentTime - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return 'Just now';
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/sitter-board"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back to sitter board
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="relative w-full h-80 bg-gray-100">
              {pet?.imageUrl ? (
                <Image
                  src={pet.imageUrl}
                  alt={pet.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    ♡ COMMUNITY HELP REQUEST
                  </span>
                  <span className="text-xs text-gray-400">
                    Posted {timeAgo(req.createdAt, nowTime)}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {req.title}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">📅 Date</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {startDateFormatted}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">⏰ Time</span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {startTime} – {endTime}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">⚡ Duration</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {durationHours ? `${durationHours} hours` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">📍 Location</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {req.areaName}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    About the care request
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
                    {req.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pt-0 flex justify-end">
            <ReportRequestButton
              requestId={req.id}
              signedIn={Boolean(member)}
              isOwn={member?.id === req.authorId}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {pet?.imageUrl ? (
                    <Image
                      src={pet.imageUrl}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      Pet
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">MEET</span>
                  <h3 className="text-xl font-bold text-gray-900">{pet?.name}</h3>
                  <p className="text-xs text-gray-500">{pet?.species}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Breed</span>
                  <span className="font-medium text-gray-900">
                    {pet?.breed || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Age</span>
                  <span className="font-medium text-gray-900">
                    {calculateAge(pet?.birthDate ?? null, nowTime)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium text-gray-900">
                    {pet?.weight ? `${pet.weight} kg` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Gender</span>
                  <span className="font-medium text-gray-900">{pet?.gender}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Applicants</span>
                  <span className="font-medium text-gray-900">
                    {req.applications?.length || 0} neighbours
                  </span>
                </div>
              </div>

              {pet?.notes && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 mb-1">
                    About {pet.name}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {pet.isNeutered ? 'Neutered' : 'Not neutered'} · {pet.notes}
                  </p>
                </div>
              )}

              {req.author && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs text-gray-400 block">Posted by</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {req.author.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="w-full bg-[#597412] hover:bg-[#4a5f0f] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm mb-3"
              >
                Apply
              </button>
              <p className="text-xs text-center text-gray-500">
                🔒 Log in to offer your help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}