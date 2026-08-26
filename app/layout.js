import "./globals.css";
import { Playfair_Display, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import ClientShell from "@/components/ClientShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap"
});

export const metadata = {
  title: "Enes & Efsa • Bizim Hatıralarımız",
  description: "İkimize ait sıcak, nostaljik ve canlı bir hatıra defteri.",
  applicationName: "Efes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Efes"
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png"
  },
  manifest: "/manifest.webmanifest"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0d0c"
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${plusJakarta.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased bg-[#0f0d0c] text-[#f5f0eb] selection:bg-[#e0a96d]/30 selection:text-[#f5f0eb]">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
