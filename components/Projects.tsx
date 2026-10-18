"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

interface Tool {
  name: string;
  icon: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  tools: Tool[];
  liveUrl: string;
  githubUrl: string;
  category: string;
}

const recentProjects: Project[] = [
  {
    id: "logitrack",
    title: "LogiTrack",
    description:
      "Logistics Monitoring System – Expense Tracking, Multi-Role Access & Real-Time Delivery.",
    image: "/projects/LogiTrack.png",
    tags: ["React", "Node.js", "Express", "Supabase", "Tailwind CSS", "TypeScript"],
    tools: [
      { name: "React", icon: "react" },
      { name: "Node.js", icon: "nodejs" },
      { name: "Express", icon: "express" },
      { name: "Supabase", icon: "supabase" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "TypeScript", icon: "typescript" },
    ],
    liveUrl: "https://logitrack-ops.vercel.app/",
    githubUrl: "https://github.com/jmsolamo/logitrack",
    category: "Logistics & Fleet",
  },
  {
    id: "dental-spirit",
    title: "Dental Spirit Dental Center",
    description:
      "Dental Clinic Management System – Appointment Booking, Patient Records & Clinic Services.",
    image: "/projects/DentalSpirit.png",
    tags: ["PHP", "MySQL", "Firebase", "Tailwind CSS", "JavaScript"],
    tools: [
      { name: "PHP", icon: "php" },
      { name: "MySQL", icon: "mysql" },
      { name: "Firebase", icon: "firebase" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "JavaScript", icon: "javascript" },
    ],
    liveUrl: "https://dental-spirit.infinityfreeapp.com/",
    githubUrl: "https://github.com/jmsolamo/DENTAL-SPIRIT-Dental-Care",
    category: "Healthcare SaaS",
  },
];

export default function Projects() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      id="projects"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 scroll-mt-20 overflow-hidden"
    >

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left space-y-3 mb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Recent <span className="text-[#C1ED00] dark:text-[#C1ED00]">Projects</span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 text-justify">
            A showcase of recent web applications, systems, and creative digital solutions I&apos;ve built with modern technology.
          </p>
        </div>

        {/* 2 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {recentProjects.map((project) => {
            const isHovered = hoveredId === project.id;
            return (
              <div key={project.id} className="flex flex-col space-y-4">
                {/* Project Screenshot Card */}
                <div
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(project.id)}
                  onBlur={() => setHoveredId(null)}
                  className="group relative block aspect-video w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-lg transition-all duration-300 hover:border-[#C1ED00]/50 dark:hover:border-[#C1ED00]/50 hover:shadow-2xl hover:-translate-y-1.5"
                >
                  {/* Project Image - blurs on hover */}
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                    style={{
                      filter: isHovered ? "blur(6px)" : "blur(0px)",
                      transform: isHovered ? "scale(1.06)" : "scale(1)",
                      transition: "filter 0.35s ease, transform 0.5s ease",
                    }}
                  />

                  {/* Hover Overlay with Launch App & GitHub Buttons */}
                  <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-3 sm:gap-4 p-4"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      visibility: isHovered ? "visible" : "hidden",
                      transition: "opacity 0.25s ease, visibility 0.25s ease",
                    }}
                  >
                    {/* Launch App Button */}
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Launch ${project.title}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-black shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-zinc-100"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        transform: isHovered ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
                        transition: "transform 0.25s ease, background-color 0.2s ease",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
                      }}
                    >
                      <span>Launch App</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>

                    {/* GitHub Button */}
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} GitHub repository`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white border border-zinc-700/80 shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-zinc-900 hover:border-zinc-500"
                      style={{
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        transform: isHovered ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
                        transition: "transform 0.25s ease, background-color 0.2s ease, border-color 0.2s ease",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                      }}
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

                {/* Under the card: Title, Description, and Tools Used */}
                <div className="flex flex-col space-y-3 px-0.5 text-left">
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-[#C1ED00] dark:hover:text-[#C1ED00]"
                      >
                        {project.title}
                      </a>
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                      {project.description}
                    </p>
                  </div>

                  {/* Tools (Icons) */}
                  <div
                    className="flex flex-wrap items-center gap-4 sm:gap-5"
                    style={{ gap: "16px" }}
                  >
                    {project.tools.map((tool) => (
                      <div
                        key={tool.name}
                        className="group/tool relative flex items-center justify-center transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                      >
                        <Image
                          src={`/tech/${tool.icon}.svg`}
                          alt={`${tool.name} icon`}
                          width={36}
                          height={36}
                          className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 object-contain transition-all duration-200 group-hover/tool:scale-115"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mobile Quick Action Buttons (visible on mobile / touch devices) */}
                  <div className="flex md:hidden items-center gap-1.5 pt-2">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-xl bg-[#C1ED00] px-5 py-2.5 text-sm sm:text-base font-semibold text-[#212125] shadow-sm transition-all hover:scale-105 hover:bg-[#d4f533] active:scale-95"
                    >
                      <span>Launch App</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
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
                      className="group inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-5 py-2.5 text-sm sm:text-base font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95"
                    >
                      <Icon icon="mdi:github" className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
