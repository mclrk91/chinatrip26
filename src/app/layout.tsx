import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "China Trip 2026",
  description: "Trip Command Center for Thailand & China Oct 2026",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "China Trip",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C41E3A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="China Trip" />
      </head>
      <body className="antialiased min-h-screen">
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
