import type { Metadata } from "next";
import { Geist, Geist_Mono, Bungee, Archivo, Space_Mono, Anton } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { LoggingModalProvider } from "@/components/logging/logging-modal-provider";
import { getCurrentUser } from "@/lib/auth/current-user";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const archivo = Archivo({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-archivo",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });

export const metadata: Metadata = {
  title: "deepcutz",
  description: "Letterboxd for music",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} ${archivo.variable} ${spaceMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {user ? (
            <LoggingModalProvider>
              <div className="flex min-h-screen bg-ink">
                <Sidebar />
                <div className="flex-1 min-w-0">{children}</div>
              </div>
            </LoggingModalProvider>
          ) : (
            children
          )}
        </TooltipProvider>
      </body>
    </html>
  );
}
