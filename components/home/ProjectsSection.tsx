"use client";


import Image from "next/image";
import { useState } from "react";
import SectionHeading from "@/components/home/SectionHeading";
import { projects, type Project } from "@/data/projects";
import { whatsappUrl } from "@/lib/whatsapp";

function ProjectCard({ project, position }: { project: Project; position: number }) {
  const [hover, setHover] = useState(false);
  return (
    <article className="group flex h-full flex-col border border-line bg-white p-6 transition-colors hover:border-ink md:p-8">
      {project.image && (
        project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative -mx-6 -mt-6 mb-6 block h-40 overflow-hidden border-b border-line bg-white sm:h-48 md:-mx-8 md:-mt-8 md:h-56"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Image
              src={hover && project.hoverImage ? project.hoverImage : project.image}
              alt={`Captura de tela do projeto ${project.name}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain object-center p-1"
            />
          </a>
        ) : (
          <div
            className="relative -mx-6 -mt-6 mb-6 h-40 overflow-hidden border-b border-line bg-white sm:h-48 md:-mx-8 md:-mt-8 md:h-56"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Image
              src={hover && project.hoverImage ? project.hoverImage : project.image}
              alt={`Captura de tela do projeto ${project.name}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain object-center p-1"
            />
          </div>
        )
      )}

      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-400">
          Projeto {String(position).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="h-[7px] w-[7px] bg-neon" />
      </div>

      <h3 className="mt-5 text-[19px] font-semibold leading-snug tracking-tight text-ink">
        {project.name}
      </h3>
      {project.category && (
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-500">
          {project.category}
        </p>
      )}
      {project.description && (
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          {project.description}
        </p>
      )}
      <div className="mt-6 border-l-2 border-neon pl-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-500">
          Problema resolvido
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{project.problem}</p>
      </div>

      {(project.price !== undefined || project.priceLabel) && (
        <div className="mt-4 flex items-baseline gap-3">
          {project.oldPrice !== undefined && (
            <span className="font-mono text-[13px] text-neutral-400 line-through">
              R$ {project.oldPrice}
            </span>
          )}
          {project.price !== undefined ? (
            <span className="font-mono text-[19px] font-semibold text-ink">
              R$ {project.price}
            </span>
          ) : (
            <span className="font-mono text-[19px] font-semibold text-ink">
              {project.priceLabel}
            </span>
          )}
        </div>
      )}

      {project.payment && (
        <p className="mt-1 font-mono text-[12px] text-neutral-500">
          {project.payment}
        </p>
      )}

      {project.price !== undefined || project.priceLabel ? (
        <a
          href={whatsappUrl(
            `Olá, CODE_PH! Tenho interesse no ${project.name.trim()}.\nResumo do pedido:\n- Produto: ${project.name.trim()}${project.category ? ` (${project.category})` : ""}\n- Valor: ${project.price !== undefined ? `R$ ${project.price}` : (project.priceLabel ?? "")}${project.oldPrice !== undefined ? ` (de R$ ${project.oldPrice})` : ""}\n${project.payment ? `- Pagamento: ${project.payment}\n` : ""}${project.description ? `- Descrição: ${project.description}\n` : ""}Link: ${project.link ?? ""}`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 font-mono text-[13px] font-semibold text-white transition-colors hover:bg-neon hover:text-black"
        >
          {project.ctaLabel ?? "Comprar agora no WhatsApp"}
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 font-mono text-[13px] font-semibold text-ink underline decoration-neon decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
          >
            Ver projeto
            <span aria-hidden="true">→</span>
          </a>
        )
      )}
    </article>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projetos" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          index="02"
          label="SITES E SISTEMAS"
          title="Sites e Sistemas da CODE_PH"
          description="Trabalhos entregues, com o problema que cada um resolveu."
        />

        {projects.length > 0 ? (
          <div className="mt-11 grid gap-6 md:grid-cols-2">
            {projects.map((project, position) => (
              <ProjectCard
                key={project.id}
                project={project}
                position={position + 1}
              />
            ))}
          </div>
        ) : (
          <p className="mt-11 border border-dashed border-line bg-mist px-6 py-10 text-center text-[15px] text-neutral-600">
            Os sites e sistemas estão sendo documentados e serão publicados aqui.
          </p>
        )}
      </div>
    </section>
  );
}
