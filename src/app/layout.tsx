import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import AuthProvider from "@/components/ui/AuthProvider";
import { LanguageProvider } from "@/components/ui/LanguageProvider";
import DynamicWidgets from "@/components/ui/DynamicWidgets";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
  },
  title: {
    default: "Western Import — Laptopuri, Telefoane, PC & Monitoare | Chișinău",
    template: "%s | Western Import",
  },
  description:
    "Laptopuri, telefoane și electronică premium la prețuri accesibile. Garanție reală și livrare în toată Moldova.",
  keywords: [
    "laptopuri", "telefoane", "electronice", "Chișinău", "Moldova",
    "Western Import", "Samsung", "Lenovo", "HP", "Dell",
    "laptop ieftin", "telefon refurbished", "laptop gaming",
    "PC desktop", "monitor", "magazin online Moldova",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ro-MD": SITE_URL,
      "ru-MD": `${SITE_URL}/ru`,
    },
  },
  openGraph: {
    title: "Western Import — Premium Electronics",
    description: "Laptopuri, telefoane și electronică premium la prețuri accesibile.",
    url: SITE_URL,
    siteName: "Western Import",
    locale: "ro_MD",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Western Import — Premium Electronics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Western Import — Premium Electronics",
    description: "Laptopuri, telefoane și electronică premium la prețuri accesibile.",
    images: [`${SITE_URL}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning className="h-full" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} min-h-full flex flex-col font-sans antialiased bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
        <Script id="theme-init" strategy="afterInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`}
        </Script>
        <DynamicWidgets />
      </body>
    </html>
  );
}
