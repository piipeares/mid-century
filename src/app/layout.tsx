import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Midcentury — Architectural Lookbook",
  description:
    "Lookbook arquitectónico de una propiedad mid‑century diseñada para la creatividad. Ideal para locaciones de fotografía, video y eventos.",
  openGraph: {
    title: "Midcentury — Architectural Lookbook",
    description:
      "Una propiedad diseñada para agencias de modelaje, productoras y fotógrafos.",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 
          Inline script: 
          1. Disables browser scroll restoration BEFORE Next.js loads
          2. Scrolls to top on initial parse
          3. Handles bfcache (pageshow) when navigating back/forward
          4. Re-checks after load to catch framework overrides
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              history.scrollRestoration='manual';
              (function(){
                var scroll = function(){ window.scrollTo(0,0); };
                scroll();
                window.addEventListener('pageshow', function(e){
                  if(e.persisted) scroll();
                });
                window.addEventListener('load', scroll);
                var check = setInterval(function(){
                  if(window.scrollY > 0) scroll();
                }, 100);
                setTimeout(function(){ clearInterval(check); }, 2000);
              })();
            `.replace(/\s+/g,' ').trim(),
          }}
        />
        <ScrollToTop />
        {children}
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
