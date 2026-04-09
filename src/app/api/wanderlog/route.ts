import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/supabase/types";

function buildFlightEmail(booking: Booking): { subject: string; html: string } {
  const details = booking.details as Record<string, string>;
  const dateStart = booking.date_start ? new Date(booking.date_start) : null;
  const dateFormatted = dateStart
    ? dateStart.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "TBD";
  const route = details?.departure_airport && details?.arrival_airport
    ? `${details.departure_airport} to ${details.arrival_airport}`
    : booking.title;

  const subject = `Booking Confirmation - ${booking.provider || "Flight"} ${details?.flight_number || ""} ${route} - ${dateFormatted}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Flight Booking Confirmation</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Airline</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.provider || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Flight Number</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details?.flight_number || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Route</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${route}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${dateFormatted}</td></tr>
        ${booking.date_start ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Departure Time</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(booking.date_start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td></tr>` : ""}
        ${booking.date_end ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Arrival Time</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(booking.date_end).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td></tr>` : ""}
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Confirmation Number</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.confirmation_code || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Passengers</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.travelers?.join(", ") || "N/A"}</td></tr>
        ${details?.seats ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Seats</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.seats}</td></tr>` : ""}
      </table>
      ${booking.alt_codes && Object.keys(booking.alt_codes).length > 0 ? `
        <h3 style="margin-top: 20px;">Individual Confirmation Codes</h3>
        <ul>${Object.entries(booking.alt_codes).map(([name, code]) => `<li>${name}: <strong>${code}</strong></li>`).join("")}</ul>
      ` : ""}
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This confirmation was sent from Trip Command Center.</p>
    </div>
  `;

  return { subject, html };
}

function buildHotelEmail(booking: Booking): { subject: string; html: string } {
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const checkIn = details?.check_in || (booking.date_start ? new Date(booking.date_start).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD");
  const checkOut = details?.check_out || (booking.date_end ? new Date(booking.date_end).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD");

  const subject = `Booking Confirmation - ${booking.title} - ${checkIn} to ${checkOut}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hotel Booking Confirmation</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Hotel</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.title}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Provider</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.provider || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Check-in</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkIn}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Check-out</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkOut}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Confirmation Number</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.confirmation_code || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Guests</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.travelers?.join(", ") || "N/A"}</td></tr>
        ${details?.room_type ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Room Type</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.room_type}</td></tr>` : ""}
        ${details?.city ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">City</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.city}</td></tr>` : ""}
        ${cost?.amount != null ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Total Cost</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${cost.currency || "USD"} ${cost.amount}</td></tr>` : ""}
      </table>
      ${booking.cancellation_policy ? `<p style="margin-top: 16px;"><strong>Cancellation Policy:</strong> ${booking.cancellation_policy}</p>` : ""}
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This confirmation was sent from Trip Command Center.</p>
    </div>
  `;

  return { subject, html };
}

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const supabase = getServiceClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.type !== "flight" && booking.type !== "hotel") {
      return NextResponse.json({ error: "Wanderlog only supports flights and hotels" }, { status: 400 });
    }

    const { subject, html } = booking.type === "flight"
      ? buildFlightEmail(booking as Booking)
      : buildHotelEmail(booking as Booking);

    const resend = new Resend(resendApiKey);

    const { error: sendError } = await resend.emails.send({
      from: "Trip Command Center <onboarding@resend.dev>",
      to: "trip+17597298@wanderlog.com",
      subject,
      html,
    });

    if (sendError) {
      console.error("Wanderlog email send error:", sendError);
      await supabase.from("bookings").update({ wanderlog_synced: false }).eq("id", bookingId);
      return NextResponse.json({ error: "Failed to send email", details: sendError }, { status: 500 });
    }

    await supabase.from("bookings").update({ wanderlog_synced: true }).eq("id", bookingId);

    return NextResponse.json({ success: true, message: "Sent to Wanderlog!" });
  } catch (error) {
    console.error("Wanderlog sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wanderlog sync failed" },
      { status: 500 }
    );
  }
}
