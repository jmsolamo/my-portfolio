"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Script from "next/script";
import { Icon } from "@iconify/react";

declare global {
  interface Window {
    grecaptcha?: any;
    onRecaptchaLoad?: () => void;
  }
}

const socialLinks = [
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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");

  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeSubmission = useCallback(
    async (token: string) => {
      if (!token) {
        setCaptchaError("Please complete the reCAPTCHA verification.");
        return;
      }

      setStatus("submitting");
      setErrorMessage("");
      setCaptchaError("");

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            captchaToken: token,
          }),
        });

        const data = await response.json();

        if (response.ok && (data.success === "true" || data.success === true)) {
          setStatus("success");
          setShowSuccessToast(true);
          setFormData({ name: "", email: "", message: "" });
          setCaptchaToken(null);
          setShowCaptcha(false);

          if (
            typeof window !== "undefined" &&
            window.grecaptcha &&
            typeof window.grecaptcha.reset === "function" &&
            widgetIdRef.current !== null
          ) {
            try {
              window.grecaptcha.reset(widgetIdRef.current);
            } catch (_) {}
          }

          setTimeout(() => {
            setShowSuccessToast(false);
            setStatus("idle");
          }, 6000);
        } else {
          throw new Error(
            data.message || "Failed to send message. Please try again."
          );
        }
      } catch (err: unknown) {
        setStatus("error");
        const msg =
          err instanceof Error
            ? err.message
            : "Something went wrong while sending. Please try again or reach out directly at solamojamesmichael@gmail.com.";
        setErrorMessage(msg);
        setCaptchaToken(null);
        if (
          typeof window !== "undefined" &&
          window.grecaptcha &&
          typeof window.grecaptcha.reset === "function" &&
          widgetIdRef.current !== null
        ) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch (_) {}
        }
      }
    },
    [formData]
  );

  const renderRecaptchaWidget = useCallback(
    (container: HTMLDivElement) => {
      let attempts = 0;

      const tryRender = () => {
        if (typeof window === "undefined" || !container) return;
        if (widgetIdRef.current !== null || container.children.length > 0) {
          return;
        }

        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) return;

        if (
          window.grecaptcha &&
          typeof window.grecaptcha.render === "function"
        ) {
          try {
            widgetIdRef.current = window.grecaptcha.render(container, {
              sitekey: siteKey,
              theme: "dark",
              callback: (token: string) => {
                setCaptchaToken(token);
                setCaptchaError("");
                // Verified! Automatically proceed with message submission
                executeSubmission(token);
              },
              "expired-callback": () => {
                setCaptchaToken(null);
                setCaptchaError(
                  "reCAPTCHA expired. Please check the box again."
                );
              },
            });
          } catch (err) {
            console.debug("reCAPTCHA render notice:", err);
          }
        } else if (attempts < 25) {
          attempts++;
          pollTimerRef.current = setTimeout(tryRender, 120);
        }
      };

      if (window.grecaptcha && typeof window.grecaptcha.ready === "function") {
        window.grecaptcha.ready(tryRender);
      } else {
        tryRender();
      }
    },
    [executeSubmission]
  );

  const setRecaptchaNode = useCallback(
    (node: HTMLDivElement | null) => {
      recaptchaRef.current = node;
      if (node) {
        renderRecaptchaWidget(node);
      } else {
        widgetIdRef.current = null;
        if (pollTimerRef.current) {
          clearTimeout(pollTimerRef.current);
        }
      }
    },
    [renderRecaptchaWidget]
  );

  useEffect(() => {
    window.onRecaptchaLoad = () => {
      if (recaptchaRef.current) {
        renderRecaptchaWidget(recaptchaRef.current);
      }
    };

    return () => {
      if (typeof window !== "undefined") {
        delete window.onRecaptchaLoad;
      }
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [renderRecaptchaWidget]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptcha && status !== "submitting") {
        setShowCaptcha(false);
        setCaptchaToken(null);
        setCaptchaError("");
      }
    };

    if (showCaptcha) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCaptcha, status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Please write your message.");
      return;
    }

    setErrorMessage("");

    // Open the security verification modal
    setShowCaptcha(true);
    setCaptchaError("");
  };

  return (
    <section
      id="contact"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 scroll-mt-20 overflow-hidden"
    >

      <div className="mx-auto max-w-7xl">
        {/* 2 Columns: Info & Pitch on Left, Message Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column: Heading, Description & Skills */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Let&apos;s work{" "}
              <span className="text-[#C1ED00] dark:text-[#C1ED00]">
                together.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
              Let&apos;s build something meaningful together. I&apos;m open to new opportunities, collaborations, and projects where I can contribute, learn, and grow as a developer.
            </p>

            {/* Direct Contact Info & Resume */}
            <div className="space-y-4 pt-2">
              {/* Email */}
              <div className="flex items-center gap-3.5 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-[#C1ED00] dark:text-[#C1ED00] shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L1 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Email
                  </div>
                  <a
                    href="mailto:solamojamesmichael@gmail.com"
                    className="text-sm sm:text-base font-medium text-foreground hover:text-[#C1ED00] dark:hover:text-[#C1ED00] transition-colors"
                  >
                    solamojamesmichael@gmail.com
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-[#C1ED00] dark:text-[#C1ED00] shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Location
                  </div>
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    Bocaue, Bulacan 3018, Philippines
                  </span>
                </div>
              </div>

              {/* Resume */}
              <div className="flex items-center gap-3.5 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-[#C1ED00] dark:text-[#C1ED00] shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Resume
                  </div>
                  <a
                    href="/resume/James%20Michael%20Solamo.pdf"
                    download="James Michael Solamo.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-[#C1ED00] dark:text-[#C1ED00] hover:underline transition-all"
                  >
                    <span>Download Resume</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-y-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Find Me Social Links */}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-3">
                  Find Me
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:border-[#C1ED00]/50 dark:hover:border-[#C1ED00]/50 hover:bg-[#d4f533]/10 dark:hover:bg-[#C1ED00]/10 transition-all shadow-sm"
                    >
                      <Icon icon={s.icon} className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="rounded-lg border border-zinc-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-[#212125]/85 p-5 sm:p-8 shadow-xl backdrop-blur-md max-w-xl w-full">

              {status === "error" && (
                <div className="mb-6 flex items-start gap-3 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-red-400 animate-in fade-in">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="text-sm font-medium">
                    {errorMessage || "Unable to send message right now. Please try again or email me directly at solamojamesmichael@gmail.com."}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2"
                  >
                    Name <span className="text-[#C1ED00] dark:text-[#C1ED00]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all focus:border-[#C1ED00] dark:focus:border-[#C1ED00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C1ED00]/20 dark:focus:ring-[#C1ED00]/20"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2"
                  >
                    Email <span className="text-[#C1ED00] dark:text-[#C1ED00]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all focus:border-[#C1ED00] dark:focus:border-[#C1ED00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C1ED00]/20 dark:focus:ring-[#C1ED00]/20"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2"
                  >
                    Message <span className="text-[#C1ED00] dark:text-[#C1ED00]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message or project requirements here..."
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all focus:border-[#C1ED00] dark:focus:border-[#C1ED00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C1ED00]/20 dark:focus:ring-[#C1ED00]/20 resize-y"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group relative flex w-full items-center justify-center gap-2.5 rounded-md bg-[#C1ED00] px-6 py-3.5 text-sm sm:text-base font-semibold text-[#212125] shadow-sm transition-all hover:scale-[1.01] hover:bg-[#d4f533] active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {status === "submitting" ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Message</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* reCAPTCHA Security Verification Modal */}
      {showCaptcha && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="recaptcha-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && status !== "submitting") {
              setShowCaptcha(false);
              setCaptchaToken(null);
              setCaptchaError("");
            }
          }}
        >
          <div className="relative w-full max-w-[94vw] sm:max-w-md rounded-none border border-zinc-800 bg-[#222222] p-5 sm:p-7 shadow-2xl shadow-black/90 animate-in zoom-in-95 duration-200 text-foreground space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-zinc-800 bg-transparent text-[#C1ED00]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3
                    id="recaptcha-modal-title"
                    className="text-base sm:text-lg font-bold text-white tracking-tight"
                  >
                    Security Verification
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Verify you are not a robot before your message is sent
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                disabled={status === "submitting"}
                onClick={() => {
                  setShowCaptcha(false);
                  setCaptchaToken(null);
                  setCaptchaError("");
                }}
                aria-label="Close modal"
                className="text-zinc-400 hover:text-[#C1ED00] transition-colors p-1.5 -mr-1 -mt-1 rounded-none hover:bg-zinc-800/60 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body: reCAPTCHA Widget */}
            <div className="space-y-3">
              <div className="overflow-x-auto py-2 flex justify-center items-center bg-transparent">
                <div
                  ref={setRecaptchaNode}
                  className="min-h-[78px]"
                />
              </div>

              {/* Error Notice */}
              {captchaError && (
                <p className="text-xs font-medium text-red-400 flex items-center justify-center gap-1.5 text-center animate-in fade-in">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{captchaError}</span>
                </p>
              )}

              {/* Submitting Status Indicator */}
              {status === "submitting" && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#C1ED00] dark:text-[#C1ED00] pt-1">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying & delivering message...</span>
                </div>
              )}
            </div>

            {/* Modal Footer / Note */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Protected by Google reCAPTCHA</span>
              <button
                type="button"
                disabled={status === "submitting"}
                onClick={() => {
                  setShowCaptcha(false);
                  setCaptchaToken(null);
                  setCaptchaError("");
                }}
                className="hover:text-foreground dark:hover:text-[#C1ED00] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast Notification */}
      {showSuccessToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-start gap-3.5 max-w-sm sm:max-w-md w-full rounded-none border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#212125]/95 p-4 text-foreground shadow-2xl shadow-black/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Success Check Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-[#C1ED00] dark:text-[#C1ED00] shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Toast Message */}
          <div className="flex-1 pt-0.5">
            <h4 className="text-sm font-bold text-foreground tracking-tight">
              Message Sent!
            </h4>
            <p className="mt-0.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Thank you! Your message has been received. I&apos;ll be in touch soon.
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            aria-label="Close notification"
            className="text-zinc-400 hover:text-foreground dark:hover:text-[#C1ED00] transition-colors p-1 -mr-1 -mt-1 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {/* Google reCAPTCHA v2 Script */}
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
        strategy="afterInteractive"
      />
    </section>
  );
}
