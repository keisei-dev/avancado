import type { PostingTimeBucket } from "@/lib/admin/mock-data";

type PostingChartProps = {
  buckets: PostingTimeBucket[];
  periodLabel: string;
};

export function PostingChart({ buckets, periodLabel }: PostingChartProps) {
  const hasData = buckets.some((bucket) => bucket.count > 0);

  return (
    <section className="rounded-20 border border-line bg-white p-[22px] shadow-admin">
      <div className="mb-[18px]">
        <h2 className="font-display text-[17px] font-bold text-brown">
          Popular posting times
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">
          Community posts and sitter events · {periodLabel}
        </p>
      </div>
      {hasData ? (
        <div className="relative flex h-[220px] items-end gap-3.5 px-1 pb-[26px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[26px] bg-[repeating-linear-gradient(180deg,transparent_0,transparent_43px,var(--color-line)_43px,var(--color-line)_44px)]"
          />
          {buckets.map((bucket) => (
            <div
              key={bucket.label}
              className="relative flex h-full flex-1 flex-col items-center justify-end"
            >
              {bucket.percent > 0 ? (
                <div
                  className="w-full max-w-11 rounded-t-[8px] rounded-b-[3px] bg-sage transition-colors duration-200 hover:bg-olive"
                  style={{ height: `${bucket.percent}%` }}
                />
              ) : null}
              <span className="absolute -bottom-6 whitespace-nowrap text-[11px] text-muted">
                {bucket.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid h-[220px] place-items-center rounded-16 bg-ivory px-6 text-center">
          <p className="text-sm text-muted">No posts in this range</p>
        </div>
      )}
    </section>
  );
}
