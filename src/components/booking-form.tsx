"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { BOOKING_TYPES, BOOKING_TYPE_LABELS, TRAVELERS } from "@/lib/constants";

export interface BookingFormData {
  type: string;
  title: string;
  provider: string;
  confirmation_code: string;
  alt_codes: Record<string, string>;
  travelers: string[];
  date_start: string | null;
  date_end: string | null;
  details: Record<string, unknown>;
  cost: Record<string, unknown>;
  payment_method: string;
  cancellation_policy: string;
  booking_url: string;
  notes: string;
  raw_file_url?: string;
  extracted_text?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InitialDataType = Partial<BookingFormData> | Record<string, any>;

interface BookingFormProps {
  initialData?: InitialDataType;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function BookingForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save Booking",
  isLoading = false,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    type: initialData.type || "other",
    title: initialData.title || "",
    provider: initialData.provider || "",
    confirmation_code: initialData.confirmation_code || "",
    alt_codes: initialData.alt_codes || {},
    travelers: initialData.travelers || [],
    date_start: initialData.date_start
      ? new Date(initialData.date_start).toISOString().slice(0, 16)
      : "",
    date_end: initialData.date_end
      ? new Date(initialData.date_end).toISOString().slice(0, 16)
      : "",
    details: initialData.details || {},
    cost: initialData.cost || {},
    payment_method: initialData.payment_method || "",
    cancellation_policy: initialData.cancellation_policy || "",
    booking_url: initialData.booking_url || "",
    notes: initialData.notes || "",
    raw_file_url: initialData.raw_file_url || undefined,
    extracted_text: initialData.extracted_text || undefined,
  });

  const toggleTraveler = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      travelers: prev.travelers.includes(name)
        ? prev.travelers.filter((t) => t !== name)
        : [...prev.travelers, name],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      date_start: formData.date_start
        ? new Date(formData.date_start).toISOString()
        : null,
      date_end: formData.date_end
        ? new Date(formData.date_end).toISOString()
        : null,
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type */}
      <div className="space-y-2">
        <Label>Booking Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {BOOKING_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {BOOKING_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Tampa to New York"
          required
        />
      </div>

      {/* Provider */}
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, provider: e.target.value }))
          }
          placeholder="e.g., Delta Air Lines, Hilton"
        />
      </div>

      {/* Confirmation Code */}
      <div className="space-y-2">
        <Label htmlFor="confirmation_code">Confirmation Number</Label>
        <Input
          id="confirmation_code"
          value={formData.confirmation_code}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              confirmation_code: e.target.value,
            }))
          }
          placeholder="e.g., ABC123"
        />
      </div>

      {/* Travelers */}
      <div className="space-y-2">
        <Label>Who is on this booking?</Label>
        <div className="grid grid-cols-2 gap-2">
          {TRAVELERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleTraveler(name)}
              className={`h-12 rounded-lg border text-base font-medium transition-colors ${
                formData.travelers.includes(name)
                  ? "bg-china-red text-white border-china-red"
                  : "bg-white text-near-black border-gray-300 hover:border-china-red"
              }`}
            >
              {name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_start">Start Date & Time</Label>
          <Input
            id="date_start"
            type="datetime-local"
            value={formData.date_start ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date_start: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_end">End Date & Time</Label>
          <Input
            id="date_end"
            type="datetime-local"
            value={formData.date_end ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date_end: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Time Zone (as listed on the reservation)</Label>
        <Input
          id="timezone"
          value={(formData.details.timezone as string) || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              details: { ...prev.details, timezone: e.target.value },
            }))
          }
          placeholder="e.g., EDT, ICT, HKT, China Time"
        />
      </div>

      {/* Hotel-specific fields */}
      {formData.type === "hotel" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="hotel_address">Hotel Address</Label>
            <Input
              id="hotel_address"
              value={(formData.details.address as string) || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, address: e.target.value },
                }))
              }
              placeholder="Street, city, country"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotel_phone">Hotel Phone</Label>
            <Input
              id="hotel_phone"
              type="tel"
              value={(formData.details.phone as string) || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, phone: e.target.value },
                }))
              }
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotel_website">Hotel Website</Label>
            <Input
              id="hotel_website"
              type="url"
              value={(formData.details.website as string) || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, website: e.target.value },
                }))
              }
              placeholder="https://…"
            />
          </div>
        </>
      )}

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="payment_method">Payment Method</Label>
        <Input
          id="payment_method"
          value={formData.payment_method}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, payment_method: e.target.value }))
          }
          placeholder="e.g., Visa ending 1234, Chase points"
        />
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-2">
        <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
        <Textarea
          id="cancellation_policy"
          value={formData.cancellation_policy}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cancellation_policy: e.target.value,
            }))
          }
          placeholder="e.g., Free cancellation until Oct 1"
        />
      </div>

      {/* Booking URL */}
      <div className="space-y-2">
        <Label htmlFor="booking_url">Booking Website Link</Label>
        <Input
          id="booking_url"
          value={formData.booking_url}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, booking_url: e.target.value }))
          }
          placeholder="e.g., https://www.delta.com/..."
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Any additional notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || !formData.title}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Saving...
            </span>
          ) : (
            submitLabel
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
