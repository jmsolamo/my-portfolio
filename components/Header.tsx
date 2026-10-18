"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { scrollToSection } from "@/lib/scroll";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About Me", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Tools", href: "#tools" },
  { name: "Certificates", href: "#certificates" },
  { name: "Contacts", href: "#contact" },
];

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Ensure dark theme is active
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");

    const sectionIds = ["home", "about", "projects", "tools", "certificates", "contact"];

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY < 120) {
        setActiveSection("home");
        return;
      }

      if (windowHeight + scrollY >= docHeight - 80) {
        setActiveSection("contact");
        return;
      }

      const checkY = 120;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= checkY && rect.bottom > checkY) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileNavClick = (href: string) => {
    const id = href.replace("#", "");
    setActiveSection(id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      scrollToSection(href);
    }, 60);
  };

  return (
    <header className="sticky top-4 z-50 w-full px-3 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between rounded-full border border-zinc-700/20 dark:border-[#C1ED00]/20 bg-white/80 dark:bg-[#212125]/85 px-4 sm:px-7 shadow-sm backdrop-blur-md transition-colors duration-300">
        {/* Left: Brand Name with Neon Accent */}
        <div className="flex items-center justify-start shrink-0">
          <Link
            href="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                setMobileMenuOpen(false);
                setTimeout(() => {
                  scrollToSection("home");
                }, 60);
              } else {
                setMobileMenuOpen(false);
              }
            }}
            className="group text-base sm:text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            JMSolamo
            <span className="text-[#C1ED00] dark:text-[#C1ED00] transition-colors">.</span>
          </Link>
        </div>

        {/* Middle: Desktop Navigation Links (Hidden on mobile) */}
        <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-8 py-1">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  setActiveSection(id);
                  scrollToSection(link.href);
                }}
                className={`group relative py-1 text-sm transition-colors whitespace-nowrap cursor-pointer ${isActive
                  ? "font-semibold text-[#C1ED00] dark:text-[#C1ED00]"
                  : "font-medium text-zinc-600 hover:text-[#C1ED00] dark:text-zinc-400 dark:hover:text-[#C1ED00]"
                  }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#C1ED00]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions (Hire Me & Mobile Hamburger) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://www.linkedin.com/in/jmsolamo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex group items-center gap-1.5 rounded-full bg-[#C1ED00] px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#212125] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#d4f533] active:scale-95 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.75h3.75a2.25 2.25 0 0 1 2.25 2.25v1.5a.75.75 0 0 1-.75.75H1.5a.75.75 0 0 1-.75-.75v-1.5A2.25 2.25 0 0 1 3 6h3.75v-.75Zm7.5.75v-.75a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V6h6Z"
                clipRule="evenodd"
              />
              <path d="M22.5 11.25H1.5v6.75A2.25 2.25 0 0 0 3.75 20.25h16.5A2.25 2.25 0 0 0 22.5 18v-6.75Z" />
            </svg>
            <span>Hire Me</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-3 right-3 sm:left-6 sm:right-6 max-w-sm mx-auto rounded-2xl border border-zinc-700/40 bg-[#212125]/95 p-3 shadow-2xl backdrop-blur-md z-50">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleMobileNavClick(link.href)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer touch-manipulation ${isActive
                      ? "bg-[#C1ED00]/15 text-[#C1ED00] font-semibold"
                      : "text-zinc-300 hover:text-[#C1ED00] hover:bg-zinc-800/50"
                    }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C1ED00]" />
                  )}
                </button>
              );
            })}
          </nav>
          {/* Hire Me button inside mobile menu */}
          <a
            href="https://www.linkedin.com/in/jmsolamo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#C1ED00] px-4 py-2.5 text-sm font-semibold text-[#212125] shadow-sm transition-all duration-200 hover:bg-[#d4f533] active:scale-95 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.75h3.75a2.25 2.25 0 0 1 2.25 2.25v1.5a.75.75 0 0 1-.75.75H1.5a.75.75 0 0 1-.75-.75v-1.5A2.25 2.25 0 0 1 3 6h3.75v-.75Zm7.5.75v-.75a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V6h6Z"
                clipRule="evenodd"
              />
              <path d="M22.5 11.25H1.5v6.75A2.25 2.25 0 0 0 3.75 20.25h16.5A2.25 2.25 0 0 0 22.5 18v-6.75Z" />
            </svg>
            <span>Hire Me</span>
          </a>
        </div>
      )}
    </header>
  );
}
