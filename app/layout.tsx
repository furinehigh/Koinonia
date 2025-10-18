import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "./auth-provider";
import MagicalBG from "@/components/MagicalBG";
import { getUserSpellsCount } from "@/lib/data/spells";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const poppings = Poppins({ subsets: ["latin"], weight: ["200", "800"] });

export const metadata: Metadata = {
  title: "Koinonia",
  description: "Coins based community forum",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  const userSpells = await getUserSpellsCount(session?.user?.id)
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppings.className} antialiased`}
      >
        <AuthProvider>
          <div className="flex flex-col relative">
            <MagicalBG />
            <Header />
            <div className="flex">
              <Sidebar recentCommunities={[]} userSpells={session ? userSpells : []}/>
              <div className="mt-15 z-40 w-full">
                {children}
              </div>
            </div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
