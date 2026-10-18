import Contact from "@/components/Contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get in Touch | Contact",
  description: "Get in touch with James Michael Solamo for web development opportunities, projects, and inquiries.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 w-full pt-10">
      <Contact />
    </main>
  );
}
