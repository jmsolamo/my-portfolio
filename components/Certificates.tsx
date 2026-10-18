"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Certificate {
  id: string;
  title: string;
  specialization: string;
  issuer?: string;
  issuedDate: string;
  credentialId?: string;
  description: string;
  image: string;
  pdfUrl?: string;
  verifyUrl?: string;
}

const certificatesData: Certificate[] = [
  {
    id: "cisco-device-config",
    title: "Device Configuration and Management",
    specialization: "Information Technology Specialist",
    issuer: "Certiport",
    issuedDate: "January 20, 2026",
    credentialId: "waE8c-FaGG",
    description:
      "Validates foundational skills in computer device configuration, operating system setup, hardware and software management, troubleshooting, peripheral configuration, system maintenance, and technical support to ensure reliable device performance and efficient IT operations.",
    image: "/certificates/Device Configuration and Management_page-0001.jpg",
    pdfUrl: "/certificates/Device Configuration and Management.pdf",
    verifyUrl:
      "https://www.certiport.com/portal/Pages/PrintTranscriptInfo.aspx?action=Cert&id=466&cvid=rAz4KHtXHwoxNLs63jqt9g==",
  },
];

export default function Certificates() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const showNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null && prev < certificatesData.length - 1 ? prev + 1 : prev
    );
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft" && selectedIndex > 0) {
        showPrev();
      } else if (
        e.key === "ArrowRight" &&
        selectedIndex < certificatesData.length - 1
      ) {
        showNext();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, closeModal, showPrev, showNext]);

  return (
    <section
      id="certificates"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 scroll-mt-20 overflow-hidden"
    >

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Certifi<span className="text-[#C1ED00] dark:text-[#C1ED00]">cates</span>
          </h2>
        </div>

        {/* Certificate Display (Card on Left, Description on Right) */}
        <div className="space-y-12">
          {certificatesData.map((cert, index) => (
            <div
              key={cert.id}
              className="mx-auto flex flex-col md:flex-row gap-8 lg:gap-10 max-w-[980px] items-stretch justify-center"
            >
              {/* Left Column: Certificate Picture Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex(index);
                  }
                }}
                className="group relative w-auto shrink-0 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-md transition-all duration-300 hover:border-[#C1ED00]/60 dark:hover:border-[#C1ED00]/50 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C1ED00] dark:focus:ring-[#C1ED00] flex flex-col"
                title="Click to view full certificate"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    width={3301}
                    height={2550}
                    className="h-full w-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 460px"
                    priority
                  />
                </div>
              </div>

              {/* Right Column: Certificate Description (Top Left Aligned) */}
              <div className="flex-1 w-full max-w-full min-w-0 flex flex-col justify-start items-start space-y-4 text-left">
                <div className="space-y-1.5 w-full">
                  <h3
                    className="text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] font-extrabold tracking-tight text-foreground block break-words whitespace-nowrap"
                  >
                    {cert.title}
                  </h3>
                  <p className="text-base sm:text-lg font-semibold text-[#C1ED00] dark:text-[#C1ED00] break-words">
                    {cert.specialization}
                  </p>
                  {cert.issuer && (
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 break-words">
                      Issuing Organization: <span className="text-zinc-900 dark:text-white font-semibold">{cert.issuer}</span>
                    </p>
                  )}
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Issued {cert.issuedDate}
                  </p>
                  {cert.credentialId && (
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 break-words">
                      Identification Code: <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{cert.credentialId}</span>
                    </p>
                  )}
                </div>

                <p className="w-full max-w-full text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify break-words">
                  {cert.description}
                </p>

                {/* Certificate Action Buttons */}
                <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 pt-2">
                  {/* View (PDF) */}
                  {cert.pdfUrl && (
                    <a
                      href={cert.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-5 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>View</span>
                    </a>
                  )}

                  {/* Verify */}
                  {cert.verifyUrl && (
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-5 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>Verify</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-[#C1ED00] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}

                  {/* Download */}
                  {cert.pdfUrl && (
                    <a
                      href={cert.pdfUrl}
                      download={`${cert.title}.pdf`}
                      className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/60 px-5 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-foreground backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:border-[#C1ED00] dark:hover:border-[#C1ED00]/60 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] hover:bg-white dark:hover:bg-zinc-800/80 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-all group-hover:translate-y-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal matching reference design */}
      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={certificatesData[selectedIndex].title}
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
        >
          {/* Close Button (Top Right circular button with X) */}
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close certificate modal"
            className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900/90 text-white shadow-2xl transition-all duration-200 hover:scale-110 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Arrow Button (Left circular button with chevron) */}
          {selectedIndex > 0 && (
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous certificate"
              className="fixed left-2 sm:left-8 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900/90 text-white shadow-2xl transition-all duration-200 hover:scale-110 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Arrow Button (Right circular button with chevron) */}
          {selectedIndex < certificatesData.length - 1 && (
            <button
              type="button"
              onClick={showNext}
              aria-label="Next certificate"
              className="fixed right-2 sm:right-8 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900/90 text-white shadow-2xl transition-all duration-200 hover:scale-110 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Modal Certificate Card (No Border Radius) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[620px] w-full bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800 mx-auto my-auto"
          >
            <div className="relative w-full overflow-hidden">
              <Image
                src={certificatesData[selectedIndex].image}
                alt={certificatesData[selectedIndex].title}
                width={3301}
                height={2550}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
