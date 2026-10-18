import Certificates from "@/components/Certificates";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates | Portfolio",
  description: "Professional technical certificates, verified credentials, and accreditations.",
};

export default function CertificatesPage() {
  return (
    <main className="flex-1 w-full pt-10">
      <Certificates />
    </main>
  );
}
