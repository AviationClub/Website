"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoadingManager from "@/components/loading-manager";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const standalonePage = pathname.startsWith("/robolympics");

  const page = <>
    {!standalonePage && <>
      <div className="pointer-events-none fixed inset-0 z-[999999999999] h-[200%] w-[200%] animate-noise bg-noise opacity-[2]"></div>
      <div className="noise pointer-events-none fixed inset-0 z-[999999999999]"></div>
      <Header />
    </>}
    {children}
    {!standalonePage && <Footer />}
  </>;

  return standalonePage ? page : <LoadingManager>{page}</LoadingManager>;
}
