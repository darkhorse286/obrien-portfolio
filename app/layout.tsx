import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "O'Brien & Son | Software Architecture & Security",
    template: "%s | O'Brien & Son"
  },
  description: "A workshop for building production systems with quality craftsmanship. Backend-first architecture, security-conscious design, and systems built to last.",
  keywords: ["software architecture", "security architecture", "backend development", "ASP.NET Core", ".NET Development", "API design", "multi-tenant systems", "Rochester MN", "software engineer"],
  authors: [{ name: "Liam O'Brien" }],
  creator: "Liam O'Brien",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.obrienandson.com",
    siteName: "O'Brien & Son",
    title: "O'Brien & Son | Software Architecture & Security",
    description: "A workshop for building production systems with quality craftsmanship. Backend-first architecture, security-conscious design, and systems built to last.",
    images: [
      {
        url: "https://www.obrienandson.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "O'Brien & Son - Software Architecture Workshop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "O'Brien & Son | Software Architecture & Security",
    description: "A workshop for building production systems with quality craftsmanship.",
    images: ["https://www.obrienandson.com/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://www.obrienandson.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Liam O\'Brien',
              jobTitle: 'Senior Solutions Architect for Security',
              url: 'https://www.obrienandson.com',
              sameAs: [
                'https://www.linkedin.com/in/liam-o-brien-a6438043/',
              ],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Rochester',
                addressRegion: 'MN',
                addressCountry: 'US',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}