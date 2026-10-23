import { formatBRL } from "@/lib/format";
import type { PriceType } from "@/data/services";
import { cn } from "@/lib/cn";

interface PriceTagProps {
  priceType: PriceType;
  price?: number;
  className?: string;
  plain?: boolean;
}

export default function PriceTag({ priceType, price, className, plain }: PriceTagProps) {
  if (priceType === "evaluation" || price === undefined) {
    return (
      <span className={cn("font-mono text-[12.5px] text-neutral-500", className)}>
        Necessidade de avaliação
      </span>
    );
  }

  if (priceType === "from") {
    if (plain) {
      return (
        <span className={cn("font-mono text-[15.5px] font-semibold text-ink", className)}>
          {formatBRL(price)}
        </span>
      );
    }
    return (
      <span className={cn("inline-flex flex-col items-end", className)}>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-neutral-500">
          a partir de
        </span>
        <span className="font-mono text-[15.5px] font-semibold text-ink">
          {formatBRL(price)}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("font-mono text-[15.5px] font-semibold text-ink", className)}>
      {formatBRL(price)}
    </span>
  );
}
