"use client";

// 🧪 TEST PAGE — Remove before production

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingCard } from "@/components/booking-card";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const THEME_COLORS = [
  { name: "Cream (Background)", hex: "#F5F0EB", var: "cream" },
  { name: "Chinese Red (Primary)", hex: "#C41E3A", var: "china-red" },
  { name: "Gold (Secondary)", hex: "#D4AF37", var: "gold" },
  { name: "Jade (Accent)", hex: "#1B4D3E", var: "jade" },
  { name: "Sky Blue (Transport)", hex: "#4A90D9", var: "sky-blue" },
  { name: "Coral (Alerts)", hex: "#E8735A", var: "coral" },
  { name: "Near Black (Text)", hex: "#1A1A2E", var: "near-black" },
];

const MOCK_BOOKINGS: Partial<Booking>[] = [
  {
    id: "test-1", type: "flight", status: "confirmed", title: "Tampa to New York (JFK)",
    provider: "Delta Air Lines", confirmation_code: "JJ45B9", date_start: "2026-10-05T06:00:00-04:00",
    travelers: ["Mike Clark", "Tonya Clark"], details: { departure_airport: "TPA", arrival_airport: "JFK", flight_number: "DL2475" },
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null, date_end: null,
  },
  {
    id: "test-2", type: "hotel", status: "confirmed", title: "Conrad Tianjin",
    provider: "Conrad Hotels (Hilton)", confirmation_code: "9091528334393",
    date_start: "2026-10-16T15:00:00+08:00", date_end: "2026-10-18T12:00:00+08:00",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { city: "Tianjin", check_in: "15:00", check_out: "12:00" },
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null,
  },
  {
    id: "test-3", type: "tour", status: "confirmed", title: "Great Wall Day Tour",
    provider: "Beijing Tours", confirmation_code: "GW1234",
    date_start: "2026-10-14T08:00:00+08:00",
    travelers: ["Mike Clark", "Tonya Clark"], details: { city: "Beijing" },
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null, date_end: null,
  },
  {
    id: "test-4", type: "transport", status: "confirmed", title: "Airport Shuttle to Hotel",
    provider: "Bangkok Transfer", confirmation_code: "BT789",
    date_start: "2026-10-08T17:00:00+07:00",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"], details: {},
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null, date_end: null,
  },
  {
    id: "test-5", type: "restaurant", status: "confirmed", title: "Dinner at Jade Dragon",
    provider: "Jade Dragon", confirmation_code: "JD456",
    date_start: "2026-10-19T19:00:00+08:00",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"], details: { city: "Xi'an" },
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null, date_end: null,
  },
  {
    id: "test-6", type: "other", status: "confirmed", title: "Travel Insurance",
    provider: "Allianz", confirmation_code: "INS999",
    date_start: "2026-10-05T00:00:00-04:00",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"], details: {},
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null, date_end: null,
  },
  {
    id: "test-7", type: "flight", status: "cancelled", title: "Cancelled: Old Flight BKK→CNX",
    provider: "Thai Airways", confirmation_code: "CANC01",
    date_start: "2026-10-11T08:00:00+07:00",
    travelers: ["Mike Clark", "Tonya Clark"], details: { departure_airport: "BKK", arrival_airport: "CNX" },
    alt_codes: {}, cost: {}, booking_url: null, cancellation_policy: null, payment_method: null,
    notes: null, raw_file_url: null, gdrive_file_id: null, wanderlog_synced: false, extracted_text: null,
    created_at: "", updated_at: "", created_by: null, date_end: null,
  },
];

export default function TestWebPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-coral text-white p-4 rounded-xl mb-8 text-center">
        <p className="text-xl font-bold">TEST PAGE — Remove before production</p>
        <p className="text-sm opacity-90">Web Design & Functionality Test</p>
      </div>

      {/* 1. Theme Colors */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Theme Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEME_COLORS.map((color) => (
            <div key={color.hex} className="text-center">
              <div
                className="w-full h-20 rounded-lg border shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-sm font-medium mt-2">{color.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Typography</h2>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p style={{ fontSize: "32px" }}>32px — Page Title</p>
            <p style={{ fontSize: "24px" }}>24px — Section Header</p>
            <p style={{ fontSize: "20px" }}>20px — Card Title</p>
            <p style={{ fontSize: "18px" }}>18px — Large Body</p>
            <p style={{ fontSize: "16px" }}>16px — Body Text (minimum for body)</p>
            <p style={{ fontSize: "14px" }}>14px — Small Text (absolute minimum)</p>
            <p className="text-muted-foreground" style={{ fontSize: "16px" }}>
              16px muted — Secondary text on cream background
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 3. Booking Type Badges */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Booking Type Badges</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(BOOKING_TYPE_LABELS).map(([type, label]) => (
            <Badge
              key={type}
              style={{
                backgroundColor: BOOKING_TYPE_COLORS[type as keyof typeof BOOKING_TYPE_COLORS],
                color: "white",
              }}
            >
              {label}
            </Badge>
          ))}
        </div>
      </section>

      {/* 4. Buttons */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary (Chinese Red)</Button>
          <Button variant="secondary">Secondary (Gold)</Button>
          <Button variant="destructive">Destructive (Coral)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button size="lg">Large Button</Button>
          <Button size="sm">Small</Button>
        </div>
      </section>

      {/* 5. Form Components */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Form Components</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Input Field (48px height target)</Label>
              <Input id="test-input" placeholder="Type something here..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-textarea">Textarea</Label>
              <Textarea id="test-textarea" placeholder="Multi-line text..." />
            </div>
            <div className="space-y-2">
              <Label>Select Dropdown</Label>
              <Select value={selectValue} onValueChange={setSelectValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. Booking Card Gallery */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Booking Cards (All Types + Cancelled)</h2>
        <div className="space-y-3">
          {MOCK_BOOKINGS.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking as Booking}
              onClick={() => toast.info(`Clicked: ${booking.title}`)}
            />
          ))}
        </div>
      </section>

      {/* 7. Interactive Tests */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Interactive Tests</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toast Notifications</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => toast.success("Booking saved successfully!")}>
              Success Toast
            </Button>
            <Button
              variant="destructive"
              onClick={() => toast.error("Failed to save. Please try again.")}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Processing your file...")}
            >
              Info Toast
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Dialog Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Open Delete Confirmation</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription className="text-base">
                    This will remove &ldquo;Test Booking&rdquo; from your itinerary. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-3 sm:gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    No, Keep It
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDialogOpen(false);
                      toast.success("Deleted (mock)");
                    }}
                  >
                    Yes, Delete It
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Loading Spinner</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-china-red" />
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-china-red" />
          </CardContent>
        </Card>
      </section>

      {/* 8. Card Styles */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Card Styles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>White background with subtle shadow on cream</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-china-red">
            <CardHeader>
              <CardTitle>Flight Card Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Left border in Chinese Red</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
