import Link from "next/link";
import { brand } from "@/data/site";
import {
  countTotalServices,
  getHighlightRows,
  serviceCategories,
} from "@/data/services";
import { formatBRL } from "@/lib/format";

const stats = [
  { value: String(serviceCategories.length).padStart(2, "0"), label: "categorias" },
  { value: String(countTotalServices()), label: "serviços listados" },
  { value: "Tempo real", label: "estimativa do orçamento" },
  { value: "WhatsApp", label: "envio direto da solicitação" },
];

const businessSolutions = [
  {
    name: "Catálogo digital",
    description: "para quem vende pelo WhatsApp.",
  },
  {
    name: "Sistema de gestão",
    description: "para quem precisa controlar estoque e vendas.",
  },
  {
    name: "Sistema de agendamento",
    description: "para barbearias, salões e profissionais autônomos.",
  },
];

function highlightPrice(priceType: string, price?: number) {
  if (priceType === "evaluation" || price === undefined) {
    return <span className="text-neutral-500">sob avaliação</span>;
  }

  return (
    <>
      {priceType === "from" && (
        <span className="mr-1.5 font-normal uppercase tracking-[0.08em] text-neutral-500">
          a partir de
        </span>
      )}
      <span className="tabular">{formatBRL(price)}</span>
    </>
  );
}

export default function Hero() {
  const rows = getHighlightRows();

  return (
    <section id="inicio" className="relative scroll-mt-20 overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 md:pt-24 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_384px] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              <span aria-hidden="true" className="inline-block h-[7px] w-[7px] bg-neon" />
              {brand.subtitle}
            </p>

            <h1 className="mt-7 inline-block font-mono text-[52px] font-bold leading-none tracking-tight transition-transform duration-700 ease-in-out hover:rotate-[360deg] sm:text-[64px] md:text-[86px]">
              CODE<span className="text-neon">_</span>PH
            </h1>

            <p className="mt-8 text-[22px] font-medium leading-snug tracking-tight text-neutral-200 md:text-[30px]">
              {brand.tagline}
            </p>

            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-400 md:text-[17px]">
              Assistência técnica para computadores e celulares e desenvolvimento de
              soluções digitais para facilitar a gestão do seu negócio.
            </p>

            <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Soluções para o seu negócio
            </p>
            <ul className="mt-3 grid max-w-xl gap-2.5 sm:grid-cols-2">
              {businessSolutions.map((item) => (
                <li
                  key={item.name}
                  className="flex items-start gap-2.5 text-[14.5px] leading-snug text-neutral-300"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-neon"
                  />
                  <span>
                    <span className="font-medium text-white">{item.name}:</span>{" "}
                    {item.description}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/orcamento"
                className="budget-btn inline-flex h-13 items-center justify-center bg-neon px-7 text-[15px] font-semibold text-black hover:bg-neon-deep"
              >
                Montar orçamento
              </Link>
              <Link
                href="/#servicos"
                className="inline-flex h-13 items-center justify-center border border-ink-line px-7 text-[15px] font-medium text-white transition-colors hover:border-neutral-600 hover:bg-white/5"
              >
                Conhecer serviços
              </Link>
            </div>
          </div>

          <div className="border border-ink-line bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-ink-line px-4 py-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-500">
                Tabela de referência
              </span>
              <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-400">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-neon" />
                online
              </span>
            </div>

            <ul className="divide-y divide-ink-line">
              {rows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 px-4 py-3.5"
                >
                  <span className="text-[13.5px] leading-snug text-neutral-300">
                    {row.label}
                  </span>
                  <span className="shrink-0 font-mono text-[13.5px] font-semibold text-white">
                    {highlightPrice(row.priceType, row.price)}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/orcamento"
              className="flex items-center justify-between border-t border-ink-line px-4 py-4 font-mono text-[12.5px] text-neutral-400 transition-colors hover:text-neon"
            >
              <span>
                &gt; montar orçamento
                <span aria-hidden="true" className="cursor-blink ml-0.5 text-neon">
                  _
                </span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-ink-line pt-7 pb-10 md:mt-16 md:pb-12">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="tabular font-mono text-[21px] font-semibold leading-none text-white">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
