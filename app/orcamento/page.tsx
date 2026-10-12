import type { Metadata } from "next";
import QuoteBuilder from "@/components/orcamento/QuoteBuilder";
import { serviceCategories } from "@/data/services";

export const metadata: Metadata = {
  title: "Monte seu orçamento",
  description:
    "Selecione os serviços que você precisa, veja o valor estimado na hora e envie sua solicitação pelo WhatsApp.",
};

export default function OrcamentoPage() {
  const totalServices = new Set(
    serviceCategories.flatMap((category) =>
      category.groups.flatMap((group) => group.items.map((item) => item.id)),
    ),
  ).size;

  return (
    <div className="bg-mist">
      <div className="relative overflow-hidden border-b border-ink-line bg-ink text-white">
        <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <span aria-hidden="true" className="inline-block h-[7px] w-[7px] bg-neon" />
            Orçamento
          </p>

          <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-tight md:text-[46px]">
            Monte seu orçamento
          </h1>

          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-neutral-400">
            Selecione os serviços que você precisa, veja o valor estimado na hora e
            envie sua solicitação pelo WhatsApp. A CODE_PH ajuda você a encontrar a
            solução ideal para seu equipamento.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11.5px] uppercase tracking-[0.1em] text-neutral-500">
            <span className="tabular">
              <span className="text-white">{totalServices}</span> serviços
            </span>
            <span className="tabular">
              <span className="text-white">{serviceCategories.length}</span> categorias
            </span>
            <span>
              <span className="text-white">05</span> passos
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
        <QuoteBuilder />
      </div>
    </div>
  );
}
