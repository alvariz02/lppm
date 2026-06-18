import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import PublicLayout from "@/components/layout/PublicLayout";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "LPPM Kampus - Lembaga Penelitian dan Pengabdian kepada Masyarakat",
    template: "%s | LPPM Kampus",
  },

  description:
    "Website resmi Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) Kampus. Pusat informasi penelitian, pengabdian masyarakat, publikasi ilmiah, hibah, dokumen, agenda, dan kerja sama.",

  keywords: [
    "LPPM",
    "Lembaga Penelitian dan Pengabdian kepada Masyarakat",
    "penelitian",
    "pengabdian masyarakat",
    "publikasi ilmiah",
    "hibah",
    "dokumen LPPM",
    "kampus",
    "universitas",
  ],

  authors: [{ name: "LPPM Kampus" }],
  creator: "LPPM Kampus",
  publisher: "LPPM Kampus",

  icons: {
    icon: [
      {
        url: "/lppm-logo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/lppm-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/lppm-logo.png",
    apple: "/lppm-logo.png",
  },

  openGraph: {
    title:
      "LPPM Kampus - Lembaga Penelitian dan Pengabdian kepada Masyarakat",
    description:
      "Pusat informasi penelitian, pengabdian masyarakat, publikasi ilmiah, hibah, dokumen, agenda, dan kerja sama.",
    type: "website",
    siteName: "LPPM Kampus",
    images: [
      {
        url: "/lppm-logo.png",
        width: 1200,
        height: 630,
        alt: "LPPM Kampus",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LPPM Kampus",
    description: "Lembaga Penelitian dan Pengabdian kepada Masyarakat",
    images: ["/lppm-logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <PublicLayout>
            {children}
          </PublicLayout>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
