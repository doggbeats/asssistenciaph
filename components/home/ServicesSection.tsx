"use client";

import { useState } from "react";
import SectionHeading from "@/components/home/SectionHeading";
import PriceTag from "@/components/ui/PriceTag";
import {
  countCategoryItems,
  getCategory,
  groupsShareSameItems,
  serviceCategories,
  type ServiceCategory,
  type ServiceGroup,
} from "@/data/services";
import { cn } from "@/lib/cn";

function ServiceList({
  group,
  label,
  hint,
}: {
  group: ServiceGroup;
  label?: string;
  hint?: string;
}) {
  const items = group.items.filter((item) => item.available);
  const hasPrices = items.some(
    (item) => item.priceType !== "evaluation" && item.price !== undefined,
  );

  return (
    <div>
      {label && (
        <>
          <div className={cn("flex items-center gap-3", hint ? "mb-2" : "mb-5")}>
            <span aria-hidden="true" className="inline-block h-[7px] w-[7px] bg-neon" />
            <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-600">
              {label}
            </h3>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] text-neutral-400">
              {String(items.length).padStart(2, "0")}
            </span>
          </div>
          {hint && <p className="mb-5 text-[13.5px] text-neutral-500">{hint}</p>}
        </>
      )}

      <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-500">
        <span>Serviço</span>
        {hasPrices && <span>Valor</span>}
      </div>

      <ul>
        {items.map((item, position) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-5 border-b border-line py-4 transition-colors hover:bg-mist md:py-5"
          >
            <div className="flex min-w-0 flex-1 gap-4 md:gap-5">
              <span className="tabular mt-1 shrink-0 font-mono text-[11px] text-neutral-400">
                {String(position + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-[15.5px] font-medium leading-snug text-ink">
                  {item.name}
                </p>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-500">
                  {item.detail}
                </p>
                {item.features && item.features.length > 0 && (
                  <div className="mt-3.5 max-w-xl">
                    {item.featuresTitle && (
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-500">
                        {item.featuresTitle}
                      </p>
                    )}
                    <ul className="mt-2 grid gap-1.5">
                      {item.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-[13.5px] leading-snug text-neutral-600"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[6px] inline-block h-1.5 w-1.5 shrink-0 bg-neon"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {item.priceType !== "evaluation" && item.price !== undefined && (
              <div className="shrink-0 pt-0.5 text-right">
                <PriceTag priceType={item.priceType} price={item.price} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryContent({ category }: { category: ServiceCategory }) {
  if (groupsShareSameItems(category)) {
    const label = category.groups.map((group) => group.name).join(" e ");
    const hint = `Atendimento para ${category.groups
      .map((group) => group.name.toLowerCase())
      .join(" e ")} de qualquer marca.`;
    return <ServiceList group={category.groups[0]} label={label} hint={hint} />;
  }

  const visibleGroups = category.groups.filter((group) => !group.hideOnHome);

  return (
    <div className="space-y-12">
      {visibleGroups.map((group) => (
        <ServiceList key={group.id} group={group} label={group.name} hint={group.hint} />
      ))}
    </div>
  );
}

export default function ServicesSection() {
  const [activeId, setActiveId] = useState(serviceCategories[0].id);
  const category = getCategory(activeId);
  const categoryNumber = serviceCategories.findIndex((item) => item.id === activeId) + 1;

  return (
    <section id="servicos" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          index="01"
          label="SERVIÇOS"
          title="Serviços e soluções CODE_PH"
          description="Selecione uma categoria para conhecer os serviços disponíveis. A maioria dos serviços é avaliada individualmente — o valor final é confirmado após a avaliação técnica. Apenas as formações completas exibem valor de referência."
        />

        <div className="mt-11 grid gap-10 lg:grid-cols-[268px_1fr]">
          <div className="min-w-0">
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
              {serviceCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    "shrink-0 border px-4 py-2.5 text-[13.5px] font-medium transition-colors",
                    item.id === activeId
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-neutral-600",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <ul className="hidden border-t border-line lg:block">
              {serviceCategories.map((item, position) => {
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 border-b border-l-2 py-4 pl-4 pr-3 text-left transition-colors",
                        active
                          ? "border-b-ink border-l-neon bg-mist font-semibold text-ink"
                          : "border-b-line border-l-transparent text-neutral-500 hover:bg-mist hover:text-ink",
                      )}
                    >
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span className="tabular font-mono text-[10.5px] text-neutral-400">
                          {String(position + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[14px] leading-snug">{item.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {String(countCategoryItems(item)).padStart(2, "0")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 hidden text-[13px] leading-relaxed text-neutral-500 lg:block">
              Não encontrou o que precisa? Descreva o problema no orçamento e a CODE_PH
              responde pelo WhatsApp.
            </p>
          </div>

          <div className="min-w-0">
            <div className="mb-7 border-b border-ink pb-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-400">
                Categoria {String(categoryNumber).padStart(2, "0")}
              </p>
              <h3 className="mt-2.5 text-[23px] font-semibold tracking-tight text-ink md:text-[26px]">
                {category.name}
              </h3>
              <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-neutral-600">
                {category.summary}
              </p>
            </div>
            <CategoryContent category={category} />
          </div>
        </div>
      </div>
    </section>
  );
}