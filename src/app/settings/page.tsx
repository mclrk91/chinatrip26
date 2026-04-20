"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <h1
        className="font-display mb-6"
        style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em", color: "#6B3410" }}
      >
        Settings
      </h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-base">
            <p><strong>Trip:</strong> Thailand &amp; China Oct 2026</p>
            <p><strong>Dates:</strong> October 5 – 24, 2026</p>
            <p><strong>Travelers:</strong> Mike Clark, Tonya Clark, David Ramos, Amanda Ford</p>
            <p><strong>Route:</strong> Tampa → Cairo → Beijing → Bangkok → Koh Samui → Chiang Mai → Shenzhen → Tianjin → Xi&apos;an → Chongqing → Hong Kong → Tampa</p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
