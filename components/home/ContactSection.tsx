import Link from "next/link";
import SectionHeading from "@/components/home/SectionHeading";
import { brand, social } from "@/data/site";
import { whatsappDisplay, whatsappUrl } from "@/lib/whatsapp";

const contactMessage =
  "Olá, CODE_PH! Gostaria de falar sobre os serviços de assistência técnica.";

export default function ContactSection() {
  return (
    <section id="contato" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
          <div className="min-w-0">
            <SectionHeading
              index="03"
              label="CONTATO"
              title="Fale com a CODE_PH"
              description="Envie uma mensagem descrevendo o que precisa. Para valores, monte o orçamento e a mensagem chega já organizada."
            />

            <dl className="mt-9 max-w-lg border-t border-line">
              <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Atendimento
                </dt>
                <dd className="text-[14.5px] text-ink">Pessoas e empresas</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Canais
                </dt>
                <dd className="text-[14.5px] text-ink">WhatsApp e orçamento online</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Serviços
                </dt>
                <dd className="text-[14.5px] text-ink">
                  Assistência e soluções digitais
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Instagram
                </dt>
                <dd className="text-[14.5px] text-ink">
                  <a
                    href={social.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-neon-deep"
                  >
                    {social.instagram.label}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative overflow-hidden border border-ink bg-ink p-7 text-white md:p-9">
            <div
              aria-hidden="true"
              className="tech-grid pointer-events-none absolute inset-0 opacity-70"
            />

            <div className="relative">
              <div className="flex items-center justify-between border-b border-ink-line pb-4">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-500">
                  WhatsApp
                </span>
                <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-400">
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-neon" />
                  atendimento
                </span>
              </div>

              {whatsappDisplay ? (
                <p className="tabular mt-6 font-mono text-[27px] font-semibold tracking-tight text-white md:text-[30px]">
                  {whatsappDisplay}
                </p>
              ) : (
                <p className="mt-6 text-[15px] text-neutral-300">
                  Canal de atendimento via WhatsApp.
                </p>
              )}

              <p className="mt-3 text-sm text-neutral-400">{brand.audience}</p>

              <a
                href={whatsappUrl(contactMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="budget-btn mt-7 flex h-13 items-center justify-center bg-neon px-6 text-[15px] font-semibold text-black hover:bg-neon-deep"
              >
                Falar pelo WhatsApp
              </a>

              <Link
                href="/orcamento"
                className="budget-btn mt-3 flex h-13 items-center justify-center border border-ink-line px-6 text-[15px] font-semibold text-white hover:border-neutral-600 hover:bg-white/5"
              >
                Montar orçamento
              </Link>

              <a
                href={social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-13 items-center justify-center gap-2 border border-ink-line px-6 text-[15px] font-semibold text-white transition-colors hover:border-neutral-600 hover:bg-white/5"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.8c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.18a3.63 3.63 0 0 0-.88-1.35 3.63 3.63 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.76-.07Zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96Zm0 8.21a3.23 3.23 0 1 0 0-6.46 3.23 3.23 0 0 0 0 6.46Zm6.34-8.41a1.16 1.16 0 1 1-2.33 0 1.16 1.16 0 0 1 2.33 0Z" />
                </svg>
                {social.instagram.label}
              </a>

              <p className="mt-6 border-t border-ink-line pt-5 text-[13px] leading-relaxed text-neutral-500">
                A CODE_PH atende pessoas, comércios, profissionais autônomos e pequenas
                empresas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
