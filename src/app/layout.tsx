import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Command Center",
  description: "Thailand & China Oct 2026 — Family Trip Planner",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-brand-bg text-brand-text font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { fontSize: "16px" },
          }}
        />
      </body>
    </html>
  );
}
