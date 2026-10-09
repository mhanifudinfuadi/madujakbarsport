import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Madu Jakbar Sport | Bergerak Bersama",
  description: "Direktori kegiatan olahraga KPP Madya Dua Jakarta Barat: Badminton, Running, Panahan, Futsal, Tenis, e-Sport, dan cerita komunitas.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}