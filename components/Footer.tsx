"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { scrollToSection } from "@/lib/scroll";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About Me", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Tools", href: "#tools" },
  { name: "Certificates", href: "#certificates" },
  { name: "Contact", href: "#contact" },
];

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jmsolamo",
    icon: "mdi:linkedin",
  },
  {
    label: "GitHub",
    href: "https://github.com/jmsolamo",
    icon: "mdi:github",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/solamojamesmichael",
    icon: "mdi:facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/jm_solamo",
    icon: "mdi:instagram",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@jmsolamoo",
    icon: "ic:baseline-tiktok",
  },
];

export default function Footer() {
  const scrollToTop = () => {
    scrollToSection("home");
  };

  const handleNavClick = (href: string) => {
    scrollToSection(href);
  };

  return (
    <footer
      className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-[#212125]/80 backdrop-blur-sm mt-auto"
    >
      <div className="mx-auto max-w-7xl py-7 sm:py-8">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8 pb-6 sm:pb-7 border-b border-zinc-200/70 dark:border-zinc-800/70 text-left">
          {/* Brand & Brief Tagline */}
          <div className="w-full md:max-w-md text-left">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 inline-block"
            >
              JMSolamo
              <span className="text-[#C1ED00] dark:text-[#C1ED00]">.</span>
            </Link>
            <p className="mt-1.5 w-full text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed text-justify">
              An aspiring Full Stack Web Developer passionate about building modern, responsive, and user-friendly web applications. I&apos;m eager to learn new technologies, improve my development skills, and turn creative ideas into functional and innovative digital solutions.
            </p>
          </div>

          {/* Quick Nav Links (Vertical from top to bottom) */}
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.16em] mb-2.5">
              Quick Links
            </span>
            <nav className="flex flex-col items-start gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] transition-colors cursor-pointer text-left"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Contacts Column */}
          <div className="flex flex-col items-start text-left text-xs sm:text-sm">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.16em] mb-2.5">
              Contacts
            </span>
            <div className="flex flex-col items-start gap-3 text-zinc-600 dark:text-zinc-400">
              <div className="flex flex-col items-start text-left">
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-0.5">
                  Email
                </span>
                <a
                  href="mailto:solamojamesmichael@gmail.com"
                  className="hover:text-[#C1ED00] dark:hover:text-[#C1ED00] transition-colors"
                >
                  solamojamesmichael@gmail.com
                </a>
              </div>

              <div className="flex flex-col items-start text-left">
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-0.5">
                  Location
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Bocaue Bulacan 3018 Philippines
                </span>
              </div>
            </div>
          </div>

          {/* Find Me (Social Links) */}
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.16em] mb-2.5">
              Find Me
            </span>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:border-[#C1ED00]/50 dark:hover:border-[#C1ED00]/50 transition-all shadow-xs"
                >
                  <Icon icon={s.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
          <p>© 2026 James Michael Solamo. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 font-medium hover:text-[#C1ED00] dark:hover:text-[#C1ED00] transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
