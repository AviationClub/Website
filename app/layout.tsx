import type { Metadata } from "next";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";
import { ReactLenis } from "@/libs/react-lenis";
import "./globals.css";
import LoadingManager from "@/components/loading-manager";
import type { Viewport } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";

const aalto = localFont({
  src: "../assets/fonts/Aalto-Display-Personal-use.woff2",
  display: "swap",
  variable: "--font-aalto",
});

const apoc = localFont({
  src: [
    {
      path: "../assets/fonts/Apoc-Revelations-Trial-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Apoc-Revelations-Trial-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-apoc",
});

export const metadata: Metadata = {
  title: "Aviation Club",
  description:
    "Aviation Club is a Student-to-Student Organiation, based in Faculty of Engineering Ain-shams University. Our Scope is to cover practical, theoretical Training and research abilities in Aviation field.",
  openGraph: {
    title: "Aviation Club",
    url: "https://aviationclubeg.org/",
    siteName: "Aviation Club",
    images: [
      {
        url: "https://aviationclubeg.org/logos/logo.png",
        width: 244,
        height: 114,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "https://aviationclubeg.org/logos/favicon-16x16.png",
        sizes: "16x16",
      },
      {
        url: "https://aviationclubeg.org/logos/favicon-32x32.png",
        sizes: "32x32",
      },
    ],
    apple: "https://aviationclubeg.org/logos/apple-touch-icon.png",
  },
  manifest: "https://aviationclubeg.org/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#fff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactLenis root>
      <html lang="en">
        {/* Noise */}
        <body className={twMerge(aalto.variable, apoc.variable)}>
          <div className="layout__wrapper overflow-hidden">
            <div className="pointer-events-none fixed inset-0 z-[999999999999] h-[200%] w-[200%] animate-noise bg-noise opacity-[2]"></div>
            <div className="noise pointer-events-none fixed inset-0 z-[999999999999]"></div>
            <LoadingManager>
              <Header />
              {children}
              <Footer />
            </LoadingManager>
          </div>
        </body>
      </html>
    </ReactLenis>
  );
}
