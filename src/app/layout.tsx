import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";
import { logoutMember } from "@/app/(auth)/actions";

import { getMyNotifications } from "@/lib/notifications/queries";
import { markAllReadAction, markReadAction } from "@/app/notifications/actions";

async function MemberTopBar() {
  const member = await getCurrentMember();
  const notifications = member ? await getMyNotifications(member.id) : [];

  return (
    <TopBar
      user={
        member
          ? {
              name: member.name,
              email: member.email,
              avatarUrl: member.image,
              verified: member.isVerified,
              isAdmin: isAdminMember(member),
            }
          : null
      }
      notifications={notifications}
      markAllReadAction={markAllReadAction}
      markReadAction={markReadAction}
      logoutAction={logoutMember}
    />
  );
}

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
        <Suspense
          fallback={
            <main
              className="grid min-h-screen place-items-center bg-ivory text-muted"
              role="status"
            >
              Loading Avancado…
            </main>
          }
        >
          <AppShell
            topBar={
              <Suspense
                fallback={
                  <div
                    className="h-16 border-b border-line bg-ivory"
                    aria-label="Loading account"
                  />
                }
              >
                <MemberTopBar />
              </Suspense>
            }
          >
            {children}
          </AppShell>
        </Suspense>
      </body>
    </html>
  );
}
