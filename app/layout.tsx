import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans, Titan_One } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "./components/AudioProvider";
import MusicToggle from "./components/MusicToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const titanOne = Titan_One({
  variable: "--font-titan-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manga Maker",
  description: "Create amazing manga panels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${titanOne.variable} antialiased`}
      >
        <AudioProvider initialMusic="/audio/OK POP KO! - Freedom Trail Studio.m4a">
          <MusicToggle />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
