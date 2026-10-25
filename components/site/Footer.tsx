import Link from "next/link";
import Logo from "@/components/site/Logo";
import { brand, navLinks, social } from "@/data/site";
import { whatsappDisplay, whatsappUrl } from "@/lib/whatsapp";

const contactMessage = "Olá, CODE_PH! Gostaria de falar sobre os serviços.";

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-t border-ink-line bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1.2fr]">
          <div>
            <Logo variant="plain" />
            <p className="mt-5 font-mono text-[11px] leading-relaxed tracking-[0.16em] text-neutral-500">
              {brand.subtitle}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              {brand.tagline}
            </p>
          </div>

          <div>
            <h2 className="font-mono text-[11px] tracking-[0.16em] text-neutral-500">
              NAVEGAÇÃO
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-300 transition-colors hover:text-neon"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-[11px] tracking-[0.16em] text-neutral-500">
              CONTATO
            </h2>
            <p className="mt-4 text-sm text-neutral-400">WhatsApp</p>
            {whatsappDisplay && (
              <p className="mt-1 font-mono text-lg text-white">{whatsappDisplay}</p>
            )}
            <p className="mt-3 text-sm text-neutral-400">{brand.audience}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={whatsappUrl(contactMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center bg-neon px-5 text-sm font-semibold text-black transition-colors hover:bg-neon-deep"
              >
                Falar pelo WhatsApp
              </a>
              <a
                href={social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 border border-ink-line px-4 text-sm font-semibold text-white transition-colors hover:border-neutral-600 hover:bg-white/5"
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
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink-line pt-6 text-[12.5px] text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {brand.legalName}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/privacidade"
              className="transition-colors hover:text-neon"
            >
              Privacidade e LGPD
            </Link>
            <p>{brand.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
