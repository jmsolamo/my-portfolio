"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { scrollToSection } from "@/lib/scroll";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 sm:py-16 lg:py-20 scroll-mt-20 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* Left Side: Introduction & Bio */}
          <div className="flex-1 max-w-2xl text-zinc-600 dark:text-zinc-300">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight text-left">
              <span className="block mb-1">
                Hi, I&apos;m
              </span>
              <span className="inline-block text-[#C1ED00] dark:text-[#C1ED00] transition-colors">
                James Michael Solamo
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
              An aspiring{" "}
              <span className="font-semibold text-[#C1ED00] dark:text-[#C1ED00]">
                Full Stack Web Developer
              </span>{" "}
              passionate about building modern, responsive, and user-friendly web applications. I&apos;m eager to learn new technologies, improve my development skills, and turn creative ideas into functional and innovative digital solutions.
            </p>

            {/* Action Buttons: Get in Touch, View Projects, Resume */}
            <div className="mt-7 flex flex-wrap items-center justify-start gap-1.5 sm:gap-2">
              <Link
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className="group inline-flex items-center gap-2 rounded-xl bg-[#C1ED00] px-5 py-2.5 text-sm sm:text-base font-semibold text-[#212125] shadow-sm transition-all hover:scale-105 hover:bg-[#d4f533] active:scale-95 whitespace-nowrap"
              >
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  <path d="M14.05 2a9 9 0 0 1 8 7.94" />
                  <path d="M14.05 6A5 5 0 0 1 18 10" />
                </svg>
                <span>Get in Touch</span>
              </Link>

              <Link
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("projects");
                }}
                className="group inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-5 py-2.5 text-sm sm:text-base font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95 whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="hidden sm:block h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                <span>Projects</span>
              </Link>

              <a
                href="/resume/James%20Michael%20Solamo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-5 py-2.5 text-sm sm:text-base font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95 whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="hidden sm:block h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Resume</span>
              </a>

              {/* LinkedIn (hidden on mobile) */}
              <a
                href="https://www.linkedin.com/in/jmsolamo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="hidden md:inline-flex group items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95"
              >
                <Icon
                  icon="mdi:linkedin"
                  className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                />
              </a>

              {/* GitHub (hidden on mobile) */}
              <a
                href="https://github.com/jmsolamo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="hidden md:inline-flex group items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95"
              >
                <Icon
                  icon="mdi:github"
                  className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                />
              </a>

            </div>
          </div>

          {/* Right Side: Profile Picture */}
          <div className="flex items-center justify-center shrink-0 w-full lg:w-auto">
            <div className="relative w-full max-w-[14rem] sm:max-w-[16rem] lg:max-w-[18rem]">
              <Image
                src="/pictures/Profile.jpg"
                alt="James Michael Solamo"
                width={3784}
                height={5045}
                priority
                className="relative w-full h-auto rounded-3xl shadow-xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
