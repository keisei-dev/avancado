import { PawPrint } from "lucide-react";

type BrandMarkProps = {
  size?: "sm" | "md";
  inverted?: boolean;
};

export function BrandMark({ size = "md", inverted = false }: BrandMarkProps) {
  const box = size === "sm" ? "h-9 w-9 rounded-10" : "h-11 w-11 rounded-12";
  const icon = size === "sm" ? 18 : 22;

  return (
    <span
      className={`grid place-items-center ${box} ${
        inverted ? "bg-white text-olive-hover" : "bg-sage-soft text-olive-hover"
      }`}
    >
      <PawPrint aria-hidden="true" size={icon} strokeWidth={2} />
    </span>
  );
}
