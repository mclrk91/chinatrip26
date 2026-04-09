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
  date_start: string;
  date_end: string;
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

// Default trip date range for date pickers
const TRIP_DATE_MIN = "2026-10-05T00:00";
const TRIP_DATE_MAX = "2026-10-24T23:59";

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const details = formData.details as Record<string, string>;

  const updateDetail = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
  };

  const toggleTraveler = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      travelers: prev.travelers.includes(name)
        ? prev.travelers.filter((t) => t !== name)
        : [...prev.travelers, name],
    }));
  };

  const toggleAllTravelers = () => {
    setFormData((prev) => ({
      ...prev,
      travelers:
        prev.travelers.length === TRAVELERS.length
          ? []
          : [...TRAVELERS],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.date_start && formData.date_end) {
      if (new Date(formData.date_end) < new Date(formData.date_start)) {
        newErrors.date_end = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validate()) return;

    const submitData = {
      ...formData,
      date_start: formData.date_start
        ? new Date(formData.date_start).toISOString()
        : "",
      date_end: formData.date_end
        ? new Date(formData.date_end).toISOString()
        : "",
    };
    await onSubmit(submitData);
  };

  const showTitleError = submitted && !formData.title.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type */}
      <div className="space-y-2">
        <Label>Booking Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="active:scale-[0.98] transition-all">
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
        <Label htmlFor="title">Title <span className="text-china-red">*</span></Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          placeholder="e.g., Tampa to New York"
          className={showTitleError ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {showTitleError && (
          <p className="text-sm text-red-500">Title is required</p>
        )}
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

      {/* Type-Specific Fields */}
      {formData.type === "flight" && (
        <div className="space-y-4 p-4 bg-red-50/50 rounded-lg border border-red-100">
          <p className="text-sm font-semibold text-china-red">Flight Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="departure_airport" className="text-sm">Departure Airport</Label>
              <Input
                id="departure_airport"
                value={details.departure_airport || ""}
                onChange={(e) => updateDetail("departure_airport", e.target.value)}
                placeholder="e.g., TPA"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="arrival_airport" className="text-sm">Arrival Airport</Label>
              <Input
                id="arrival_airport"
                value={details.arrival_airport || ""}
                onChange={(e) => updateDetail("arrival_airport", e.target.value)}
                placeholder="e.g., JFK"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="flight_number" className="text-sm">Flight Number</Label>
              <Input
                id="flight_number"
                value={details.flight_number || ""}
                onChange={(e) => updateDetail("flight_number", e.target.value)}
                placeholder="e.g., DL1234"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seats" className="text-sm">Seat Assignments</Label>
              <Input
                id="seats"
                value={details.seats || ""}
                onChange={(e) => updateDetail("seats", e.target.value)}
                placeholder="e.g., 12A, 12B"
              />
            </div>
          </div>
        </div>
      )}

      {formData.type === "hotel" && (
        <div className="space-y-4 p-4 bg-yellow-50/50 rounded-lg border border-yellow-100">
          <p className="text-sm font-semibold text-yellow-700">Hotel Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input
                id="city"
                value={details.city || ""}
                onChange={(e) => updateDetail("city", e.target.value)}
                placeholder="e.g., Bangkok"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="room_type" className="text-sm">Room Type</Label>
              <Input
                id="room_type"
                value={details.room_type || ""}
                onChange={(e) => updateDetail("room_type", e.target.value)}
                placeholder="e.g., Deluxe King"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="check_in" className="text-sm">Check-in Time</Label>
              <Input
                id="check_in"
                value={details.check_in || ""}
                onChange={(e) => updateDetail("check_in", e.target.value)}
                placeholder="e.g., 3:00 PM"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="check_out" className="text-sm">Check-out Time</Label>
              <Input
                id="check_out"
                value={details.check_out || ""}
                onChange={(e) => updateDetail("check_out", e.target.value)}
                placeholder="e.g., 11:00 AM"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="num_rooms" className="text-sm">Number of Rooms</Label>
            <Input
              id="num_rooms"
              value={details.num_rooms || ""}
              onChange={(e) => updateDetail("num_rooms", e.target.value)}
              placeholder="e.g., 2"
            />
          </div>
        </div>
      )}

      {(formData.type === "tour" || formData.type === "activity") && (
        <div className="space-y-4 p-4 bg-green-50/50 rounded-lg border border-green-100">
          <p className="text-sm font-semibold text-jade">
            {formData.type === "tour" ? "Tour" : "Activity"} Details
          </p>
          <div className="space-y-1">
            <Label htmlFor="meeting_point" className="text-sm">Meeting Point</Label>
            <Input
              id="meeting_point"
              value={details.meeting_point || ""}
              onChange={(e) => updateDetail("meeting_point", e.target.value)}
              placeholder="e.g., Hotel lobby"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="duration" className="text-sm">Duration</Label>
            <Input
              id="duration"
              value={details.duration || ""}
              onChange={(e) => updateDetail("duration", e.target.value)}
              placeholder="e.g., 4 hours"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="includes" className="text-sm">What&apos;s Included</Label>
            <Textarea
              id="includes"
              value={details.includes || ""}
              onChange={(e) => updateDetail("includes", e.target.value)}
              placeholder="e.g., Guide, entrance fees, lunch"
            />
          </div>
        </div>
      )}

      {/* Travelers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Who is on this booking?</Label>
          <button
            type="button"
            onClick={toggleAllTravelers}
            className="text-sm text-china-red font-medium hover:underline active:scale-95 transition-all"
          >
            {formData.travelers.length === TRAVELERS.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TRAVELERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleTraveler(name)}
              className={`h-12 rounded-lg border text-base font-medium transition-all active:scale-90 ${
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
            value={formData.date_start}
            min={TRIP_DATE_MIN}
            max={TRIP_DATE_MAX}
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
            value={formData.date_end}
            min={TRIP_DATE_MIN}
            max={TRIP_DATE_MAX}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, date_end: e.target.value }));
              if (errors.date_end) setErrors((prev) => ({ ...prev, date_end: "" }));
            }}
            className={errors.date_end ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.date_end && (
            <p className="text-sm text-red-500">{errors.date_end}</p>
          )}
        </div>
      </div>

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

      {/* Actions — Save is dominant, Cancel is secondary */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-[2] active:scale-95 active:opacity-80 transition-all"
          disabled={isLoading}
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
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 active:scale-95 active:opacity-80 transition-all"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
