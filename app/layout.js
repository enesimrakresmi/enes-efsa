import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Bizim Alanımız",
  description: "Sadece ikimize ait küçük, canlı ve karanlık bir anı alanı."
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <Navigation />
        <main className="min-h-screen px-4 pb-24 pt-5 sm:px-5 sm:pb-28 sm:pt-8 md:ml-24 md:px-10 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
