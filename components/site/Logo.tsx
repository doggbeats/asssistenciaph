import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "chip" | "plain";
  className?: string;
}

export default function Logo({ variant = "chip", className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-semibold tracking-[0.14em] text-[15px] leading-none",
        variant === "chip" && "bg-ink px-3 py-2 text-white",
        variant === "plain" && "text-white",
        className,
      )}
    >
      CODE<span className="text-neon">_</span>PH
    </span>
  );
}
