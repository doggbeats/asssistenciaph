"use client";

import { useEffect, useMemo, useState } from "react";
import PriceTag from "@/components/ui/PriceTag";
import {
  getCategory,
  serviceCategories,
  type ServiceCategory,
  type ServiceGroup,
  type ServiceItem,
} from "@/data/services";
import { cn } from "@/lib/cn";
import { formatBRL, formatPhoneInput, isValidPhone } from "@/lib/format";
import { buildQuoteMessage, whatsappUrl } from "@/lib/whatsapp";

type Errors = { items?: string; name?: string; phone?: string };

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface ServiceOptionProps {
  item: ServiceItem;
  quantity: number;
  onToggle: () => void;
  onChangeQuantity: (itemId: string, delta: number) => void;
  tag?: string;
}

function ServiceOption({ item, quantity, onToggle, onChangeQuantity, tag }: ServiceOptionProps) {
  const on = quantity > 0;

  return (
    <div
      className={cn(
        "border bg-white transition-colors",
        on ? "border-neon" : "border-line",
      )}
    >
      <label className="flex cursor-pointer items-start gap-3.5 p-4">
        <input
          type="checkbox"
          className="sr-only"
          checked={on}
          onChange={onToggle}
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors",
            on ? "border-ink bg-neon" : "border-neutral-300 bg-white",
          )}
        >
          {on && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6.2L4.8 9L10 3"
                stroke="#0a0a0a"
                strokeWidth="1.8"
                strokeLinecap="square"
              />
            </svg>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-medium leading-snug text-ink">
            {item.name}
          </span>
          <span className="mt-1.5 block text-[13.5px] leading-relaxed text-neutral-500">
            {item.detail}
          </span>
          {tag && (
            <span className="mt-2 inline-block border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              {tag}
            </span>
          )}
        </span>

        <span className="shrink-0 pt-0.5 text-right">
          <PriceTag priceType={item.priceType} price={item.price} />
          {on && quantity > 1 && item.price !== undefined && (
            <span className="mt-1.5 block font-mono text-[11.5px] text-neutral-500">
              {quantity} × {formatBRL(item.price)}
            </span>
          )}
        </span>
      </label>

      {on && item.quantity && (
        <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5">
          <span className="text-[13px] text-neutral-500">Quantidade</span>
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => onChangeQuantity(item.id, -1)}
              aria-label={`Diminuir quantidade de ${item.name}`}
              className="h-9 w-9 text-[17px] leading-none text-neutral-600 transition-colors hover:bg-mist hover:text-ink"
            >
              −
            </button>
            <span className="w-9 border-x border-line text-center font-mono text-[14px] leading-9 text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onChangeQuantity(item.id, 1)}
              aria-label={`Aumentar quantidade de ${item.name}`}
              className="h-9 w-9 text-[17px] leading-none text-neutral-600 transition-colors hover:bg-mist hover:text-ink"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StepProps {
  number: string;
  title: string;
  hint?: string;
  id?: string;
  children: React.ReactNode;
}

function Step({ number, title, hint, id, children }: StepProps) {
  return (
    <section id={id} className="border-t border-line pt-8 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3.5">
        <span className="font-mono text-[12px] text-neutral-400">{number}</span>
        <div>
          <h2 className="text-[16.5px] font-semibold leading-snug tracking-tight text-ink">
            {title}
          </h2>
          {hint && <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-500">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 border px-4 py-2.5 text-left text-[14px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-neutral-600 hover:border-neutral-400 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export default function QuoteBuilder() {
  const [categoryId, setCategoryId] = useState(serviceCategories[0].id);
  const [groupId, setGroupId] = useState(serviceCategories[0].groups[0].id);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [problem, setProblem] = useState("");
  const [model, setModel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const timer = window.setTimeout(() => setSent(false), 7000);
    return () => window.clearTimeout(timer);
  }, [sent]);

  const category = getCategory(categoryId);
  const group = category.groups.find((item) => item.id === groupId) ?? category.groups[0];

  const allIndex = useMemo(() => {
    const map: Record<
      string,
      { item: ServiceItem; category: ServiceCategory; group: ServiceGroup }
    > = {};
    for (const resultCategory of serviceCategories) {
      for (const resultGroup of resultCategory.groups) {
        for (const item of resultGroup.items) {
          map[item.id] = { item, category: resultCategory, group: resultGroup };
        }
      }
    }
    return map;
  }, []);

  const lines = Object.entries(selected)
    .filter(([itemId, qty]) => allIndex[itemId] !== undefined && qty > 0)
    .map(([itemId, qty]) => ({ ...allIndex[itemId], qty }));

  const term = normalize(query);
  const searching = term.length >= 2;

  const searchResults = useMemo(() => {
    if (term.length < 2) return [];
    return Object.values(allIndex).filter(({ item }) =>
      item.available && normalize(`${item.name} ${item.detail}`).includes(term),
    );
  }, [allIndex, term]);

  const total = lines.reduce((sum, line) => sum + (line.item.price ?? 0) * line.qty, 0);
  const hasFromPrice = lines.some((line) => line.item.priceType === "from");
  const needsEvaluation = lines.some(
    (line) => line.item.priceType === "evaluation" || line.item.price === undefined,
  );

  const totalLabel = lines.length === 0
    ? "—"
    : total > 0
      ? formatBRL(total)
      : "A definir";

  function chooseCategory(nextId: string) {
    const next = getCategory(nextId);
    setCategoryId(nextId);
    setGroupId(next.groups[0].id);
    setErrors({});
  }

  function toggleItem(item: ServiceItem) {
    setSelected((current) => {
      const next = { ...current };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = 1;
      }
      return next;
    });
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function changeQuantity(itemId: string, delta: number) {
    setSelected((current) => {
      const next = { ...current };
      const value = (next[itemId] ?? 1) + delta;
      if (value <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = Math.min(value, 99);
      }
      return next;
    });
  }

  function clearAll() {
    setSelected({});
    setProblem("");
    setModel("");
    setName("");
    setPhone("");
    setErrors({});
    setSent(false);
  }

  function scrollTo(id: string) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function send() {
    const nextErrors: Errors = {};

    if (lines.length === 0) nextErrors.items = "Selecione ao menos um serviço.";
    if (name.trim().length < 2) nextErrors.name = "Informe seu nome.";
    if (!isValidPhone(phone)) nextErrors.phone = "Informe um telefone válido com DDD.";

    setErrors(nextErrors);

    if (nextErrors.items) {
      scrollTo("step-servicos");
      return;
    }
    if (nextErrors.name || nextErrors.phone) {
      scrollTo("step-dados");
      return;
    }

    const message = buildQuoteMessage({
      categoryName:
        Array.from(new Set(lines.map((line) => line.category.name))).join(", ") ||
        category.name,
      groupName:
        Array.from(new Set(lines.map((line) => line.group.name))).join(", ") ||
        group.name,
      items: lines.map((line) => ({
        name: line.item.name,
        qty: line.qty,
        priceType: line.item.priceType,
        price: line.item.price,
      })),
      total,
      hasFromPrice,
      needsEvaluation,
      problem,
      model,
      name,
      phone,
    });

    setSent(true);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  const visibleItems = group.items.filter((item) => item.available);
  const selectedGroups = Array.from(new Set(lines.map((line) => line.group.name)));
  const selectedCategories = Array.from(new Set(lines.map((line) => line.category.name)));
  const distinctOwners = selectedGroups.join(", ");
  const summaryCategory =
    selectedCategories.length > 0 ? selectedCategories.join(", ") : category.name;

  const hasGroupStep = category.groups.length > 1;
  const stepServicos = hasGroupStep ? "03" : "02";
  const stepObservacoes = hasGroupStep ? "04" : "03";
  const stepDados = hasGroupStep ? "05" : "04";

  return (
    <div
      className={cn(
        "grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12",
        lines.length > 0 ? "pb-28 lg:pb-0" : "pb-0",
      )}
    >
      {sent && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-start gap-3 border border-neon/40 bg-ink px-4 py-3.5 text-white shadow-lg"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-neon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3.5 9.5L7 13L14.5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="square"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-white">
              Orçamento enviado com sucesso!
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-neutral-300">
              Recebemos sua solicitação e responderemos pelo WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            aria-label="Fechar notificação"
            className="ml-auto shrink-0 text-neutral-500 transition-colors hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="min-w-0 space-y-9">
        <Step number="01" title="Categoria">
          <div className="flex flex-wrap gap-2">
            {serviceCategories.map((item) => (
              <Chip key={item.id} active={item.id === categoryId} onClick={() => chooseCategory(item.id)}>
                {item.name}
              </Chip>
            ))}
          </div>
        </Step>

        {hasGroupStep && (
          <Step number="02" title="Equipamento ou serviço" hint={group.hint}>
            <div className="flex flex-wrap gap-2">
              {category.groups.map((item) => (
                <Chip key={item.id} active={item.id === group.id} onClick={() => setGroupId(item.id)}>
                  {item.name}
                </Chip>
              ))}
            </div>
          </Step>
        )}

        <Step
          id="step-servicos"
          number={stepServicos}
          title="Serviços desejados"
          hint="Marque o que precisa ou use a busca abaixo. Você pode somar mais de um serviço."
        >
          <div className="mb-5">
            <label htmlFor="busca-servicos" className="sr-only">
              Buscar serviço
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M11.5 11.5L16 16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="square"
                  />
                </svg>
              </span>
              <input
                id="busca-servicos"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar serviço em todas as categorias..."
                className="h-12 w-full border border-line bg-white pl-11 pr-11 text-[16px] text-ink outline-none placeholder:text-neutral-400 focus:border-ink"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-neutral-500 transition-colors hover:text-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {searching ? (
            <>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  {String(searchResults.length).padStart(2, "0")}{" "}
                  {searchResults.length === 1 ? "resultado" : "resultados"}
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-ink"
                >
                  limpar busca
                </button>
              </div>

              {searchResults.length === 0 ? (
                <p className="text-[14.5px] leading-relaxed text-neutral-600">
                  Nenhum serviço encontrado para{" "}
                  <span className="font-medium text-ink">“{query}”</span>. Tente outro
                  termo.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {searchResults.map(
                    ({ item, category: ownerCategory, group: ownerGroup }) => (
                      <ServiceOption
                        key={item.id}
                        item={item}
                        quantity={selected[item.id] ?? 0}
                        onToggle={() => toggleItem(item)}
                        onChangeQuantity={changeQuantity}
                        tag={`${ownerCategory.name} · ${ownerGroup.name}`}
                      />
                    ),
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2.5">
              {visibleItems.map((item) => (
                <ServiceOption
                  key={item.id}
                  item={item}
                  quantity={selected[item.id] ?? 0}
                  onToggle={() => toggleItem(item)}
                  onChangeQuantity={changeQuantity}
                />
              ))}
            </div>
          )}

          {errors.items && (
            <p className="mt-3 text-[13.5px] text-red-600">{errors.items}</p>
          )}
        </Step>

        <Step
          number={stepObservacoes}
          title="Descrição do problema"
          hint="Opcional. Descreva o que está acontecendo para o atendimento."
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="modelo"
                className="block text-[13.5px] font-medium text-neutral-700"
              >
                Modelo do aparelho
              </label>
              <input
                id="modelo"
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Ex.: iPhone 12, Samsung Galaxy A54, Dell Inspiron 15"
                className="mt-2 h-12 w-full border border-line bg-white px-3.5 text-[16px] text-ink outline-none placeholder:text-neutral-400 focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="problema"
                className="block text-[13.5px] font-medium text-neutral-700"
              >
                Descrição do problema
              </label>
              <textarea
                id="problema"
                rows={4}
                value={problem}
                onChange={(event) => setProblem(event.target.value)}
                placeholder="Ex.: o computador desliga sozinho depois de alguns minutos de uso."
                className="mt-2 w-full resize-y border border-line bg-white p-3.5 text-[16px] leading-relaxed text-ink outline-none placeholder:text-neutral-400 focus:border-ink"
              />
            </div>

            <p className="text-[13px] leading-relaxed text-neutral-500">
              Por gentileza, envie imagens do problema junto ao orçamento pelo WhatsApp.
            </p>
          </div>
        </Step>

        <Step
          id="step-dados"
          number={stepDados}
          title="Seus dados"
          hint="Para a CODE_PH responder pelo WhatsApp com o retorno."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className="block text-[13.5px] font-medium text-neutral-700">
                Nome <span className="text-neutral-400">*</span>
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                placeholder="Como podemos chamar você"
                className={cn(
                  "mt-2 h-12 w-full border bg-white px-3.5 text-[16px] text-ink outline-none placeholder:text-neutral-400 focus:border-ink",
                  errors.name ? "border-red-500" : "border-line",
                )}
              />
              {errors.name && <p className="mt-1.5 text-[13px] text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="telefone" className="block text-[13.5px] font-medium text-neutral-700">
                Telefone <span className="text-neutral-400">*</span>
              </label>
              <input
                id="telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={16}
                value={phone}
                onChange={(event) => {
                  setPhone(formatPhoneInput(event.target.value));
                  setErrors((current) => ({ ...current, phone: undefined }));
                }}
                placeholder="(61) 99999-9999"
                className={cn(
                  "mt-2 h-12 w-full border bg-white px-3.5 text-[16px] text-ink outline-none placeholder:text-neutral-400 focus:border-ink",
                  errors.phone ? "border-red-500" : "border-line",
                )}
              />
              {errors.phone && <p className="mt-1.5 text-[13px] text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-neutral-500">
            O telefone é usado apenas para responder sobre este orçamento.
          </p>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-ink-line bg-ink text-white">
          <div className="flex items-center justify-between gap-4 border-b border-ink-line px-5 py-3.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-500">
              Resumo do orçamento
            </span>
            <span className="tabular font-mono text-[10.5px] text-neutral-400">
              {String(lines.length).padStart(2, "0")}{" "}
              {lines.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="p-5">
          <dl className="space-y-2.5 text-[13.5px]">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-neutral-500">Categoria</dt>
              <dd className="text-right text-neutral-100">{summaryCategory}</dd>
            </div>
            {lines.length > 0 && (
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-neutral-500">Serviço</dt>
                <dd className="text-right text-neutral-100">{distinctOwners}</dd>
              </div>
            )}
          </dl>

          {lines.length === 0 ? (
            <p className="mt-5 border-t border-ink-line pt-5 text-[13.5px] leading-relaxed text-neutral-500">
              Nenhum serviço selecionado ainda. Marque os serviços para ver o valor
              estimado.
            </p>
          ) : (
            <ul className="mt-5 space-y-4 border-t border-ink-line pt-5">
              {lines.map((line) => (
                <li key={line.item.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] leading-snug text-neutral-100">
                      {line.item.name}
                      {line.qty > 1 && (
                        <span className="text-neutral-500"> ×{line.qty}</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setSelected((current) => {
                          const next = { ...current };
                          delete next[line.item.id];
                          return next;
                        })
                      }
                      className="mt-1 text-[11.5px] text-neutral-500 underline underline-offset-2 transition-colors hover:text-neon"
                    >
                      remover
                    </button>
                  </div>
                  <span className="shrink-0 font-mono text-[13.5px] text-white">
                    {line.item.priceType === "evaluation" || line.item.price === undefined
                      ? "avaliação"
                      : hasFromPrice && line.item.priceType === "from"
                        ? `a partir de ${formatBRL(line.item.price * line.qty)}`
                        : formatBRL(line.item.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-ink-line pt-5">
            <p className="font-mono text-[10.5px] tracking-[0.16em] text-neutral-500">
              {hasFromPrice ? "TOTAL ESTIMADO (A PARTIR DE)" : "TOTAL ESTIMADO"}
            </p>
            <p className="mt-2.5 font-mono text-[30px] font-semibold leading-none text-neon">
              {totalLabel}
            </p>

            {needsEvaluation && (
              <p className="mt-3.5 text-[12.5px] leading-relaxed text-neutral-400">
                Alguns itens dependem de avaliação e não entram neste valor.
              </p>
            )}
            {hasFromPrice && (
              <p className="mt-3.5 border border-neon/30 bg-neon/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-neutral-300">
                Preços &quot;a partir de&quot; variam conforme o modelo. O valor final é
                confirmado após o atendimento.
              </p>
            )}
            <p className="mt-2 text-[12.5px] leading-relaxed text-neutral-500">
              Valor de referência. O fechamento é confirmado após o atendimento.
            </p>
          </div>

          <button
            type="button"
            onClick={send}
            className="budget-btn mt-6 flex h-13 w-full items-center justify-center bg-neon px-5 text-[15px] font-semibold text-black hover:bg-neon-deep"
          >
            Enviar orçamento pelo WhatsApp
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="mt-3.5 w-full text-center text-[13px] text-neutral-500 underline underline-offset-4 transition-colors hover:text-white"
          >
            Limpar orçamento
          </button>
          </div>
        </div>

        <p className="mt-4 hidden text-[12.5px] leading-relaxed text-neutral-500 lg:block">
          A mensagem é montada automaticamente e aberta no WhatsApp com o seu orçamento.
        </p>
      </aside>

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-ink px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.14em] text-neutral-500">
                TOTAL ESTIMADO
              </p>
              <p className="mt-1 truncate font-mono text-[19px] font-semibold leading-none text-neon">
                {totalLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={send}
              className="budget-btn h-11 shrink-0 bg-neon px-4 text-[14px] font-semibold text-black hover:bg-neon-deep"
            >
              Enviar no WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
