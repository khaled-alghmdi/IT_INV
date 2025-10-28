import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Inventory Management",
  description: "Track and manage IT department assets and devices",
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

