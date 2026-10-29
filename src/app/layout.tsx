import type { Metadata } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Suspense } from "react";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";
// import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Avancado", template: "%s | Avancado" },
  description: "A community web app for pet owners in Vancouver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body>
        <div className="grid min-h-screen bg-ivory tablet:grid-cols-[80px_1fr] wide:grid-cols-[252px_1fr]">
          <SideNav />
          <div className="min-w-0">
            <Suspense fallback={<div className="h-16" />}>
              <TopBar />
            </Suspense>
            <main>{children}</main>
          </div>
          {/* <MobileTabBar /> */}
        </div>
      </body>
    </html>
  );
}
