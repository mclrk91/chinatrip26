"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";

export default function SettingsPage() {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setSeedResult(`Success: ${data.message}`);
      } else {
        toast.error(data.error || "Seed failed");
        setSeedResult(`Error: ${data.error || `Status ${res.status}`}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to seed database";
      toast.error(msg);
      setSeedResult(`Error: ${msg}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-base">
            <p><strong>Trip:</strong> Thailand & China Oct 2026</p>
            <p><strong>Dates:</strong> October 5 – 24, 2026</p>
            <p><strong>Travelers:</strong> Mike Clark, Tonya Clark, David Ramos, Amanda Ford</p>
            <p><strong>Route:</strong> Tampa → Cairo → Beijing → Bangkok → Koh Samui → Chiang Mai → Shenzhen → Tianjin → Xi&apos;an → Chongqing → Hong Kong → Tampa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://drive.google.com/drive/folders/1ZUnI2iQUPp4R7CZ49BRXxPURK0UwaWJp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-china-red text-base font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Google Drive Folder
            </a>
            <a
              href="https://wanderlog.com/plan/ktjcyxxyeodikoxk/trip-to-china"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-china-red text-base font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Wanderlog Itinerary
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              variant="outline"
              className="w-full"
            >
              {seeding ? "Seeding..." : "Reload Sample Bookings"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will reset the database with the original flight and hotel bookings.
            </p>
            {seedResult && (
              <p className={`text-sm mt-2 ${seedResult.startsWith("Success") ? "text-jade" : "text-red-600"}`}>
                {seedResult}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="text-base text-muted-foreground">
            <p>Trip Command Center v1.0</p>
            <p>Built with Next.js, Supabase, and Claude AI</p>
          </CardContent>
        </Card>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-600 border-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
