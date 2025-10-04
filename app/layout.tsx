import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "./auth-provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppings.className} antialiased`}
      >
        <AuthProvider>
          <Header />
          <Sidebar recentCommunities={[]} />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
