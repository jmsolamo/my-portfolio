import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import TechStacks from "@/components/TechStacks";
import Certificates from "@/components/Certificates";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="flex-1 w-full">
      <Hero />
      <About />
      <Projects />
      <TechStacks />
      <Certificates />
      <Contact />
    </main>
  );
}
