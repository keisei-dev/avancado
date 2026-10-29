import type { Metadata } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";

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
      className={`${geistMono.variable} ${inter.variable} ${plusJakartaSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        {/* TODO(auth owner): pass the signed-in member, unread counts and logoutAction. */}
        <AppShell topBar={<TopBar user={null} />}>{children}</AppShell>
      </body>
    </html>
  );
}
