type ComingSoonProps = {
  title: string;
  description?: string;
};

export function ComingSoon({
  title,
  description = "This section is a placeholder until its feature owner implements it.",
}: ComingSoonProps) {
  return (
    <div>
      <h1 className="font-display text-[30px] font-bold tracking-tight text-brown">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
