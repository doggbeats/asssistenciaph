import Link from "next/link";

export default function QuoteCall() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16 md:flex-row md:items-end md:justify-between md:py-20">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            <span aria-hidden="true" className="inline-block h-[7px] w-[7px] bg-neon" />
            Orçamento
          </p>
          <h2 className="mt-5 max-w-2xl text-[30px] font-semibold leading-[1.12] tracking-tight text-white md:text-[42px]">
            Precisa de uma solução?
            <br />
            Monte seu orçamento.
          </h2>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-neutral-400">
            Selecione os serviços, veja o valor estimado na hora e envie tudo pronto pelo
            WhatsApp.
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11.5px] uppercase tracking-[0.1em] text-neutral-500">
            <li className="flex items-center gap-2.5">
              <span aria-hidden="true" className="text-neon">
                ✓
              </span>
              Preço na hora
            </li>
            <li className="flex items-center gap-2.5">
              <span aria-hidden="true" className="text-neon">
                ✓
              </span>
              Sem cadastro
            </li>
            <li className="flex items-center gap-2.5">
              <span aria-hidden="true" className="text-neon">
                ✓
              </span>
              Mensagem pronta
            </li>
          </ul>
        </div>

        <Link
          href="/orcamento"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-3 bg-neon px-8 text-[15px] font-semibold text-black transition-colors hover:bg-neon-deep"
        >
          Montar orçamento
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
