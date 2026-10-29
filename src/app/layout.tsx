// src/app/(main)/layout.tsx
import { Suspense } from "react";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-ivory tablet:grid-cols-[80px_1fr] wide:grid-cols-[252px_1fr]">
      <SideNav />
      <div className="min-w-0">
        <Suspense fallback={<div className="h-16" />}>
          <TopBar />
        </Suspense>
        <main>{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}