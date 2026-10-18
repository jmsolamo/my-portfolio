import Image from "next/image";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  category?: string;
}

const projects: Project[] = [
  {
    id: "project-1",
    title: "AetherFlow Analytics",
    description:
      "A high-performance real-time telemetry and analytics platform built for monitoring server metrics, cloud data streams, and active deployments with sub-second latency.",
    image: "/projects/project1.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "WebSockets", "Recharts"],
    liveUrl: "https://example.com/aetherflow",
    githubUrl: "https://github.com/JamesMichaelSolamo/aetherflow-analytics",
    category: "Full Stack SaaS",
  },
  {
    id: "project-2",
    title: "Synapse AI Workspace",
    description:
      "An intelligent collaborative workspace featuring AI chat assistance, code generation, markdown note taking, and context-aware workspace threads for agile teams.",
    image: "/projects/project2.jpg",
    tags: ["React", "Next.js", "Node.js", "OpenAI API", "PostgreSQL"],
    liveUrl: "https://example.com/synapse",
    githubUrl: "https://github.com/JamesMichaelSolamo/synapse-ai-workspace",
    category: "AI & Productivity",
  },
  {
    id: "project-3",
    title: "Aura Marketplace",
    description:
      "A futuristic eCommerce marketplace for next-gen gear featuring interactive product previews, cart management, instant checkout, and real-time inventory tracking.",
    image: "/projects/project3.jpg",
    tags: ["Next.js", "TypeScript", "Stripe", "Prisma", "Tailwind CSS"],
    liveUrl: "https://example.com/aura",
    githubUrl: "https://github.com/JamesMichaelSolamo/aura-marketplace",
    category: "E-Commerce",
  },
];

export default function ProjectsBackup() {
  return (
    <section
      id="projects"
      className="relative px-4 pt-[60px] pb-20 sm:px-6 lg:px-8 scroll-mt-20 overflow-hidden"
    >
      {/* Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-[#C1ED00]/5 dark:bg-[#C1ED00]/5 hidden" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left space-y-3 mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            <span className="text-[#C1ED00] dark:text-[#C1ED00]">Projects</span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            A showcase of recent web applications, systems, and creative digital solutions I&apos;ve built with modern technology.
          </p>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#212125]/80 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[#C1ED00]/50 dark:hover:border-[#C1ED00]/50 hover:shadow-xl hover:shadow-[#C1ED00]/10  hover:-translate-y-1.5"
            >
              {/* Project Screenshot Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={1280}
                  height={720}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {project.category && (
                  <span className="absolute top-3 right-3 rounded-full bg-zinc-900/85 px-3 py-1 text-xs font-semibold text-zinc-200 border border-zinc-700/60 backdrop-blur-md">
                    {project.category}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-[#C1ED00] dark:group-hover:text-[#C1ED00]">
                    {project.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#C1ED00]/10 dark:bg-[#C1ED00]/10 px-2.5 py-0.5 text-xs font-medium text-[#C1ED00] dark:text-[#C1ED00] border border-[#C1ED00]/20 dark:border-[#C1ED00]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons: Launch App & GitHub */}
                <div className="mt-6 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#C1ED00] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#C1ED00]/20 transition-all hover:scale-[1.02] hover:bg-[#C1ED00] active:scale-[0.98] dark:bg-[#C1ED00] dark:text-black  dark:hover:bg-[#C1ED00]/90"
                  >
                    <span>Launch App</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} GitHub repository`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-3.5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-[1.02] hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-[0.98]"
                  >
                    <svg
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
