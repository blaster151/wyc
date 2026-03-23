import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export const metadata: Metadata = {
  title: "WYC — Words You Carry",
  description:
    "A small moment of calm, just for you. Daily affirmations to carry with you.",
  manifest: "/manifest.json",
  openGraph: {
    title: "WYC — Words You Carry",
    description:
      "A small moment of calm, just for you. Daily affirmations to carry with you.",
    type: "website",
  },
  icons: [
    { rel: "icon", url: "/icons/icon-192.svg", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icons/icon-512.svg", sizes: "512x512" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}
