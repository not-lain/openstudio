import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
