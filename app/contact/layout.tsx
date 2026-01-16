import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about challenging problems, innovative projects, or collaboration opportunities. Rochester, Minnesota.",
  openGraph: {
    title: "Contact | O'Brien & Son",
    description: "Get in touch about challenging problems, innovative projects, or collaboration opportunities.",
    url: "https://www.obrienandson.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}