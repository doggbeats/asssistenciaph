interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  description?: string;
}

export default function SectionHeading({
  index,
  label,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-neutral-500">
        <span aria-hidden="true" className="inline-block h-[7px] w-[7px] bg-neon" />
        {index} — {label}
      </p>
      <h2 className="mt-5 max-w-2xl text-[28px] font-semibold leading-[1.15] tracking-tight md:text-[40px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-justify text-[15.5px] leading-relaxed text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}
