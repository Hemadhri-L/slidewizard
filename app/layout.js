import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SlideWizard Pro – Free AI PPT Maker & Presentation Generator",
  description:
    "SlideWizard Pro is a free AI-powered PPT maker that creates stunning presentations instantly. Generate slides in seconds with smart design and AI content.",
  verification: {
    google: "TVFY2lokGI_6Lzw2eDu_3Zrw773c7g-qcpV8yyjpHBU",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
