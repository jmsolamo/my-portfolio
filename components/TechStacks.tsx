"use client";

import Image from "next/image";

interface TechItem {
  name: string;
  icon: string;
  invertDark?: boolean;
}

interface TechCategory {
  title: string;
  items: TechItem[];
}

const techCategories: TechCategory[] = [
  {
    title: "Frontend",
    items: [
      { name: "HTML", icon: "html" },
      { name: "CSS", icon: "css" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Vite", icon: "vite" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
  },
  {
    title: "Backend & Database",
    items: [
      { name: "Node.js", icon: "nodejs" },
      { name: "Express", icon: "express" },
      { name: "PHP", icon: "php" },
      { name: "Java", icon: "java" },
      { name: "MySQL", icon: "mysql" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "Firebase", icon: "firebase" },
      { name: "Supabase", icon: "supabase" },
    ],
  },
  {
    title: "Tools & Deployment",
    items: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "VS Code", icon: "vscode" },
      { name: "Figma", icon: "figma" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
];

export default function TechStacks() {
  return (
    <section
      id="tools"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 scroll-mt-20 overflow-hidden"
    >

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left space-y-3 mb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Tech <span className="text-[#C1ED00] dark:text-[#C1ED00]">Stacks</span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
            The core technologies, frameworks, and developer tools I specialize in to build modern web solutions.
          </p>
        </div>

        {/* Grouped Tech Stacks */}
        <div className="space-y-6">
          {techCategories.map((category) => (
            <div key={category.title} className="space-y-3">
              {/* Group Label / Header */}
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#C1ED00]" />
                <h4 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#C1ED00]">
                  {category.title}
                </h4>
                <div className="h-px flex-1 bg-gradient-to-r from-[#C1ED00]/25 via-zinc-200/80 dark:via-zinc-800/80 to-transparent" />
              </div>

              {/* Tech Items Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-4 sm:gap-y-5 gap-x-1 sm:gap-x-1.5">
                {category.items.map((tech) => (
                  <div
                    key={tech.name}
                    className="group flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                  >
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center transition-transform duration-300 group-hover:scale-115">
                      <Image
                        src={`/tech/${tech.icon}.svg`}
                        alt={`${tech.name} logo`}
                        width={48}
                        height={48}
                        className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-all duration-300"
                      />
                    </div>
                    <span className="mt-3 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-200 group-hover:text-[#C1ED00] dark:group-hover:text-[#C1ED00]">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
