"use client";

// 🧪 TEST PAGE — Remove before production

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { FileDropzone } from "@/components/file-dropzone";
import { BookingCard } from "@/components/booking-card";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const MANY_MOCK_BOOKINGS: Partial<Booking>[] = Array.from({ length: 10 }, (_, i) => ({
  id: `scroll-${i}`,
  type: (["flight", "hotel", "tour", "transport", "restaurant"] as const)[i % 5],
  status: "confirmed" as const,
  title: `Mock Booking #${i + 1} — ${["Flight to Bangkok", "Hotel in Tianjin", "Great Wall Tour", "Airport Shuttle", "Dinner Reservation"][i % 5]}`,
  provider: ["Delta", "Hilton", "Beijing Tours", "BKK Transfer", "Jade Dragon"][i % 5],
  confirmation_code: `TEST${String(i + 1).padStart(3, "0")}`,
  date_start: `2026-10-${String(5 + i).padStart(2, "0")}T${String(8 + i).padStart(2, "0")}:00:00+07:00`,
  travelers: ["Mike Clark", "Tonya Clark"],
  details: {},
  alt_codes: {},
  cost: {},
  booking_url: null,
  cancellation_policy: null,
  payment_method: null,
  notes: null,
  raw_file_url: null,
  gdrive_file_id: null,
  wanderlog_synced: false,
  extracted_text: null,
  created_at: "",
  updated_at: "",
  created_by: null,
  date_end: null,
}));

function TouchTargetOverlay({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 border-2 border-dashed border-china-red/30 rounded-lg pointer-events-none z-10" />
      <div className="absolute -top-5 left-1 text-xs text-china-red font-mono z-10">{label}</div>
      {children}
    </div>
  );
}

export default function TestMobilePage() {
  const [showOverlays, setShowOverlays] = useState(true);

  return (
    <div className="min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-coral text-white p-4 text-center">
        <p className="text-xl font-bold">TEST PAGE — Remove before production</p>
        <p className="text-sm opacity-90">Mobile UI & Touch Target Test</p>
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-8">
        {/* Toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowOverlays(!showOverlays)}
        >
          {showOverlays ? "Hide" : "Show"} Touch Target Boundaries
        </Button>

        {/* 1. Touch Target Audit */}
        <section>
          <h2 className="text-xl font-bold mb-4">Touch Target Audit (min 48px)</h2>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Buttons (h-12 = 48px)</p>
                <div className="space-y-3">
                  {showOverlays ? (
                    <>
                      <TouchTargetOverlay label="48px">
                        <Button className="w-full">Primary Button</Button>
                      </TouchTargetOverlay>
                      <TouchTargetOverlay label="48px">
                        <Button variant="outline" className="w-full">Outline Button</Button>
                      </TouchTargetOverlay>
                    </>
                  ) : (
                    <>
                      <Button className="w-full">Primary Button</Button>
                      <Button variant="outline" className="w-full">Outline Button</Button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Input Fields (h-12 = 48px)</p>
                {showOverlays ? (
                  <TouchTargetOverlay label="48px">
                    <Input placeholder="Type here..." />
                  </TouchTargetOverlay>
                ) : (
                  <Input placeholder="Type here..." />
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Traveler Selection Buttons</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Mike", "Tonya", "David", "Amanda"].map((name) => (
                    <div key={name}>
                      {showOverlays ? (
                        <TouchTargetOverlay label="48px">
                          <button className="w-full h-12 rounded-lg border text-base font-medium bg-china-red text-white">
                            {name}
                          </button>
                        </TouchTargetOverlay>
                      ) : (
                        <button className="w-full h-12 rounded-lg border text-base font-medium bg-china-red text-white">
                          {name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Bottom Nav Test */}
        <section>
          <h2 className="text-xl font-bold mb-4">Bottom Navigation</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-2">
                The bottom nav bar should be visible at the bottom of this page.
                Each tab should be at least 56px tall with clear labels.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">Itinerary</Badge>
                <Badge variant="outline">Add Booking</Badge>
                <Badge variant="outline">Settings</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. iPhone-Width Layout Test */}
        <section>
          <h2 className="text-xl font-bold mb-4">iPhone Width Test (375px)</h2>
          <div className="mx-auto border-2 border-dashed border-gray-300 rounded-xl overflow-hidden" style={{ maxWidth: "375px" }}>
            <div className="bg-cream p-4">
              <h3 className="text-lg font-bold mb-3">
                <span className="text-china-red">Thailand & China</span>{" "}
                <span className="text-muted-foreground font-normal">Oct 2026</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Cards should fill width, no overflow</p>

              <div className="space-y-3">
                {MANY_MOCK_BOOKINGS.slice(0, 3).map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b as Booking}
                    onClick={() => toast.info(`Clicked: ${b.title}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Scroll Test */}
        <section>
          <h2 className="text-xl font-bold mb-4">Scroll Test (Long List)</h2>
          <p className="text-muted-foreground mb-3">
            Scroll through these cards. Bottom nav should stay fixed. Headers should feel natural.
          </p>
          <div className="space-y-3">
            {MANY_MOCK_BOOKINGS.map((b) => (
              <BookingCard
                key={b.id}
                booking={b as Booking}
                onClick={() => toast.info(`Clicked: ${b.title}`)}
              />
            ))}
          </div>
        </section>

        {/* 5. File Upload Test */}
        <section>
          <h2 className="text-xl font-bold mb-4">File Upload (Mobile)</h2>
          <Card>
            <CardContent className="pt-6">
              <FileDropzone
                onFileAccepted={(file) => toast.info(`File accepted: ${file.name}`)}
                isUploading={false}
              />
            </CardContent>
          </Card>
        </section>

        {/* 6. PIN Pad Test */}
        <section>
          <h2 className="text-xl font-bold mb-4">PIN Pad (Mobile Size)</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="max-w-[300px] mx-auto">
                <div className="flex justify-center gap-3 mb-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-lg border-2 border-china-red flex items-center justify-center text-2xl font-bold bg-red-50"
                    >
                      {i < 2 ? "\u2022" : ""}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
                    if (key === "") return <div key="empty" />;
                    return (
                      <div key={key}>
                        {showOverlays ? (
                          <TouchTargetOverlay label={key === "del" ? "48px" : ""}>
                            <Button variant="outline" className="w-full h-14 text-xl font-semibold">
                              {key === "del" ? "Delete" : key}
                            </Button>
                          </TouchTargetOverlay>
                        ) : (
                          <Button variant="outline" className="w-full h-14 text-xl font-semibold">
                            {key === "del" ? "Delete" : key}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. Booking Type Colors Reference */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Booking Type Color Reference</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(BOOKING_TYPE_LABELS).map(([type, label]) => (
              <div
                key={type}
                className="flex items-center gap-2 p-3 rounded-lg bg-white border"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: BOOKING_TYPE_COLORS[type as keyof typeof BOOKING_TYPE_COLORS] }}
                />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground font-mono ml-auto">
                  {BOOKING_TYPE_COLORS[type as keyof typeof BOOKING_TYPE_COLORS]}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
