import type { Metadata } from "next";
import "./globals.css";
import '@/app/globals.css'

export const metadata: Metadata = {
  title: "OpenStudio",
  description: "Created with OpenStudio",
  generator: "OpenStudio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
