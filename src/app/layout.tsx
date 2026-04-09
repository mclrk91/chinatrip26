import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ChatButton } from "@/components/chat-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "China Trip",
  description: "Thailand & China Oct 2026 — Family Trip Planner",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "China Trip",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
        <ChatButton />
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
