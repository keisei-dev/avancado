import Image from "next/image";

type BrandMarkProps = {
  size?: "sm" | "md";
};

export function BrandMark({ size = "md" }: BrandMarkProps) {
  const box = size === "sm" ? "h-9 w-9 rounded-10" : "h-11 w-11 rounded-12";
  const icon = size === "sm" ? 28 : 34;

  return (
    <span className={`grid place-items-center overflow-hidden bg-white ${box}`}>
      <Image
        src="/images/avancado-icon.png"
        alt="Avancado"
        width={266}
        height={387}
        className="object-contain"
        style={{ width: icon, height: icon }}
        priority
      />
    </span>
  );
}
