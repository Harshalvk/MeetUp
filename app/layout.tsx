import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/layout/Container";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meetup",
  description: "Simple video calling app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="flex flex-col min-h-screen bg-secondary">
            <NavBar />
            <Container>{children}</Container>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
