import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "CRM — Soutien Omni Scolaire",
  description:
    "Machine commerciale SOS — Acquisition, conversion, rétention et réactivation des familles",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-gray-50 flex-col lg:flex-row">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden w-full">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 sm:p-7">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
