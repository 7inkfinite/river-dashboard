import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "River Dashboard",
  description: "Transform YouTube videos into social media content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
