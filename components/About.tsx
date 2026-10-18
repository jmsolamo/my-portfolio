import Image from "next/image";


export default function About() {
  return (
    <section
      id="about"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 sm:py-16 lg:py-20 scroll-mt-20 overflow-hidden"
    >

      <div className="mx-auto max-w-7xl">
        {/* Content: Left Image, Right Text */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
          {/* Left: Profile2 Photo */}
          <div className="flex items-center justify-center shrink-0 w-full lg:w-auto">
            <div className="relative w-full max-w-[14rem] sm:max-w-[16rem] lg:max-w-[18rem]">
              <Image
                src="/pictures/Profile2.jpg"
                alt="James Michael Solamo"
                width={3784}
                height={5045}
                className="relative w-full h-auto rounded-3xl shadow-xl object-cover"
              />
            </div>
          </div>

          {/* Right: Bio & Background */}
          <div className="flex-1 max-w-2xl text-zinc-600 dark:text-zinc-300">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              About <span className="text-[#C1ED00] dark:text-[#C1ED00]">Me</span>
            </h2>
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 text-justify">
              <p>
                I&apos;m a recent graduate and aspiring{" "}
                <span className="font-semibold text-[#C1ED00] dark:text-[#C1ED00]">
                  Full Stack Web Developer
                </span>{" "}
                with a strong interest in building modern, responsive, and user-friendly web applications. I specialize in the{" "}
                <span className="font-semibold text-foreground dark:text-white">MERN stack</span> —{" "}
                <span className="font-semibold text-[#C1ED00] dark:text-[#C1ED00]">MongoDB</span>,{" "}
                <span className="font-semibold text-[#C1ED00] dark:text-[#C1ED00]">Express.js</span>,{" "}
                <span className="font-semibold text-[#C1ED00] dark:text-[#C1ED00]">React</span>, and{" "}
                <span className="font-semibold text-[#C1ED00] dark:text-[#C1ED00]">Node.js</span> — and enjoy turning ideas into functional digital experiences.
              </p>

              <p>
                I&apos;m passionate about developing both front-end interfaces and back-end systems, continuously improving my coding skills, and exploring new technologies. Through personal projects and hands-on learning, I strive to write clean, maintainable code and build applications that solve real-world problems.
              </p>

              <p>
                As I begin my professional journey, I&apos;m eager to contribute my skills, collaborate with other developers, and grow as a software developer while creating meaningful and impactful web solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Education & Experience Section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">

            {/* Education Column */}
            <div>
              <div className="mb-10">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  Edu<span className="text-[#C1ED00] dark:text-[#C1ED00]">cation</span>
                </h3>
              </div>

              {/* Education Timeline */}
              <div className="space-y-10">

                {/* Tertiary */}
                <div>
                  <div>
                    <div className="flex items-start gap-4 sm:gap-5">
                      <a
                        href="https://dyci.edu.ph/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
                        title="Visit Dr. Yang's College, Inc."
                      >
                        <Image
                          src="/education/DYCI.png"
                          alt="Dr. Yang's College, Inc."
                          width={160}
                          height={160}
                          className="w-full h-full object-contain"
                        />
                      </a>
                      <div className="space-y-1">
                        <h4 className="text-lg sm:text-xl font-bold text-foreground">
                          <a
                            href="https://dyci.edu.ph/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] transition-colors"
                          >
                            <span>Dr. Yang&apos;s College, Inc.</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4 text-zinc-400 group-hover:text-[#C1ED00] dark:group-hover:text-[#C1ED00] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </h4>

                        <p className="text-base sm:text-lg font-medium text-zinc-700 dark:text-zinc-300">
                          Bachelor of Science in Information Technology
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-[#C1ED00] dark:text-[#C1ED00]">
                          August 2022 – July 2026
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Column */}
            <div>
              <div className="mb-10">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  Expe<span className="text-[#C1ED00] dark:text-[#C1ED00]">rience</span>
                </h3>
              </div>

              {/* Experience Timeline */}
              <div className="space-y-10">

                {/* Internship */}
                <div>
                  <div>
                    <div className="flex items-start gap-4 sm:gap-5">
                      <a
                        href="https://enertech.com.ph/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
                        title="Visit Enertech System Industries, Inc."
                      >
                        <Image
                          src="/experience/Enertech.png"
                          alt="Enertech System Industries, Inc."
                          width={160}
                          height={160}
                          className="w-full h-full object-contain"
                        />
                      </a>
                      <div className="space-y-1">
                        <h4 className="text-lg sm:text-xl font-bold text-foreground">
                          <a
                            href="https://enertech.com.ph/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 hover:text-[#C1ED00] dark:hover:text-[#C1ED00] transition-colors"
                          >
                            <span>Enertech System Industries, Inc.</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4 text-zinc-400 group-hover:text-[#C1ED00] dark:group-hover:text-[#C1ED00] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </h4>

                        <p className="text-base sm:text-lg font-medium text-zinc-700 dark:text-zinc-300">
                          Full Stack Web Developer (Internship)
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-[#C1ED00] dark:text-[#C1ED00]">
                          February 2026 – June 2026
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
