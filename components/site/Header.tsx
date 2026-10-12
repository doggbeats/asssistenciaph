"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";
import { cn } from "@/lib/cn";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[72px]">
        <Link
          href="/#inicio"
          aria-label="CODE_PH — início"
          onClick={() => setOpen(false)}
          className="group flex items-center"
        >
          <Image
            src="/logo.jpg"
            alt="CODE_PH — Assistência Técnica & Soluções Digitais"
            width={1600}
            height={413}
            loading="eager"
            fetchPriority="high"
            className="h-9 w-auto origin-left transition-transform duration-300 ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06] md:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b-2 py-1 font-mono text-[11.5px] uppercase tracking-[0.12em] transition-colors",
                pathname === link.href
                  ? "border-neon text-ink"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/orcamento"
            className="inline-flex h-10 items-center bg-neon px-4 text-[13.5px] font-semibold text-black transition-colors hover:bg-neon-deep"
          >
            Solicitar orçamento
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-11 w-11 items-center justify-center border border-line text-ink lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M4 4L16 16M16 4L4 16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            ) : (
              <path
                d="M3 5.5H17M3 10H17M3 14.5H17"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          aria-label="Menu"
          className="border-t border-line bg-white px-5 pb-6 pt-2 lg:hidden"
        >
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center justify-between border-b border-line border-l-2 pl-3 font-mono text-[12.5px] uppercase tracking-[0.1em]",
                    pathname === link.href
                      ? "border-l-neon text-ink"
                      : "border-l-transparent text-neutral-600",
                  )}
                >
                  {link.label}
                  <span aria-hidden="true" className="text-neutral-400">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/orcamento"
            onClick={() => setOpen(false)}
            className="mt-5 flex h-12 items-center justify-center bg-neon text-[15px] font-semibold text-black"
          >
            Solicitar orçamento
          </Link>
        </nav>
      )}
    </header>
  );
}
