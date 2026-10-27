type ComingSoonProps = {
  title: string;
};

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-3 text-sm text-slate-500">準備中</p>
    </div>
  );
}
