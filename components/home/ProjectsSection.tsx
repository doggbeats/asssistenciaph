import SectionHeading from "@/components/home/SectionHeading";
import { projects, type Project } from "@/data/projects";

function ProjectCard({ project, position }: { project: Project; position: number }) {
  return (
    <article className="group flex h-full flex-col border border-line bg-white p-6 transition-colors hover:border-ink md:p-8">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-neutral-400">
          Projeto {String(position).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="h-[7px] w-[7px] bg-neon" />
      </div>

      <h3 className="mt-5 text-[19px] font-semibold leading-snug tracking-tight text-ink">
        {project.name}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
        {project.description}
      </p>

      <div className="mt-6 border-l-2 border-neon pl-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-neutral-500">
          Problema resolvido
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{project.problem}</p>
      </div>

      <div className="mt-auto pt-7">
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="border border-line px-2.5 py-1 font-mono text-[11px] text-neutral-600 transition-colors group-hover:border-neutral-400"
            >
              {tech}
            </span>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-mono text-[13px] font-semibold text-ink underline decoration-neon decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
          >
            Ver projeto
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projetos" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          index="02"
          label="PROJETOS"
          title="Projetos da CODE_PH"
          description="Trabalhos entregues, com o problema que cada um resolveu e as tecnologias utilizadas."
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
            Os projetos estão sendo documentados e serão publicados aqui.
          </p>
        )}
      </div>
    </section>
  );
}
