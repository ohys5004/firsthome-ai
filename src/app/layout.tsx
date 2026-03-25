import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FirstHome AI — Your Guide to Buying Your First Home",
  description:
    "AI-powered guide for first-time homebuyers in the U.S. Built from a real buyer's journey.",
  openGraph: {
    title: "FirstHome AI",
    description:
      "AI-powered guide for first-time homebuyers in the U.S.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
