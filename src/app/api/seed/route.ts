import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

const SEED_BOOKINGS = [
  {
    type: "flight", status: "confirmed", title: "Tampa to New York (JFK)",
    date_start: "2026-10-05T06:00:00-04:00", date_end: "2026-10-05T09:30:00-04:00",
    provider: "Delta Air Lines", confirmation_code: "JJ45B9",
    alt_codes: { "David Ramos": "JJ4589" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "DL2475", departure_airport: "TPA", arrival_airport: "JFK", airline_iata: "DL", departure_timezone: "UTC-4", arrival_timezone: "UTC-4" },
  },
  {
    type: "flight", status: "confirmed", title: "New York (JFK) to Cairo",
    date_start: "2026-10-05T20:00:00-04:00", date_end: "2026-10-06T14:00:00+02:00",
    provider: "EgyptAir", confirmation_code: "A5WIT3",
    travelers: ["Tonya Clark", "Mike Clark"],
    details: { flight_number: "MS986", departure_airport: "JFK", arrival_airport: "CAI", airline_iata: "MS", departure_timezone: "UTC-4", arrival_timezone: "UTC+2" },
  },
  {
    type: "flight", status: "confirmed", title: "Cairo to Beijing",
    date_start: "2026-10-07T01:00:00+02:00", date_end: "2026-10-07T18:00:00+08:00",
    provider: "EgyptAir", confirmation_code: "A5WIT3",
    travelers: ["Tonya Clark", "Mike Clark"],
    details: { flight_number: "MS955", departure_airport: "CAI", arrival_airport: "PEK", airline_iata: "MS", departure_timezone: "UTC+2", arrival_timezone: "UTC+8" },
  },
  {
    type: "flight", status: "confirmed", title: "Beijing to Bangkok",
    date_start: "2026-10-08T08:00:00+08:00", date_end: "2026-10-08T12:30:00+07:00",
    provider: "Hainan Airlines", confirmation_code: "PDK6KW",
    alt_codes: { "David Ramos": "QCK7K5" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "HU429", departure_airport: "PEK", arrival_airport: "BKK", airline_iata: "HU", departure_timezone: "UTC+8", arrival_timezone: "UTC+7" },
  },
  {
    type: "flight", status: "confirmed", title: "Bangkok to Koh Samui",
    date_start: "2026-10-08T15:00:00+07:00", date_end: "2026-10-08T16:20:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "DL2BJG",
    alt_codes: { "David Ramos": "DYJW53" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "PG165", departure_airport: "BKK", arrival_airport: "USM", airline_iata: "PG", departure_timezone: "UTC+7", arrival_timezone: "UTC+7" },
  },
  {
    type: "flight", status: "confirmed", title: "Koh Samui to Chiang Mai",
    date_start: "2026-10-11T10:00:00+07:00", date_end: "2026-10-11T11:40:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "DL2BJG",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "PG241", departure_airport: "USM", arrival_airport: "CNX", airline_iata: "PG", departure_timezone: "UTC+7", arrival_timezone: "UTC+7" },
  },
  {
    type: "flight", status: "pending", title: "Chiang Mai to Shenzhen/Hong Kong",
    date_start: "2026-10-13T12:00:00+07:00",
    provider: "TBD", confirmation_code: "TBD",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { departure_airport: "CNX", arrival_airport: "SZX/HKG", departure_timezone: "UTC+7", arrival_timezone: "UTC+8" },
    notes: "Flight details to be confirmed",
  },
  {
    type: "flight", status: "confirmed", title: "Hong Kong to Doha",
    date_start: "2026-10-23T23:50:00+08:00", date_end: "2026-10-24T04:20:00+03:00",
    provider: "Qatar Airways", confirmation_code: "7MWYZ9",
    alt_codes: { alt: "77R8A7" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "QR815", departure_airport: "HKG", arrival_airport: "DOH", airline_iata: "QR", departure_timezone: "UTC+8", arrival_timezone: "UTC+3" },
  },
  {
    type: "flight", status: "confirmed", title: "Doha to Dallas",
    date_start: "2026-10-24T08:00:00+03:00", date_end: "2026-10-24T14:30:00-05:00",
    provider: "Qatar Airways", confirmation_code: "7MWYZ9",
    alt_codes: { alt: "77R8A7" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "QR731", departure_airport: "DOH", arrival_airport: "DFW", airline_iata: "QR", departure_timezone: "UTC+3", arrival_timezone: "UTC-5" },
  },
  {
    type: "flight", status: "confirmed", title: "Dallas to Tampa",
    date_start: "2026-10-24T17:00:00-05:00", date_end: "2026-10-24T20:30:00-04:00",
    provider: "American Airlines", confirmation_code: "CSTEDD",
    alt_codes: { "David Ramos": "KXRQUY" },
    travelers: ["Tonya Clark", "David Ramos"],
    details: { flight_number: "AA2512", departure_airport: "DFW", arrival_airport: "TPA", airline_iata: "AA", departure_timezone: "UTC-5", arrival_timezone: "UTC-4" },
  },
  // Hotels
  {
    type: "hotel", status: "confirmed", title: "Raweekanlaya Resort (Chai Lai Orchid)",
    date_start: "2026-10-12T14:00:00+07:00", date_end: "2026-10-13T12:00:00+07:00",
    provider: "Chai Lai Orchid", confirmation_code: "7636354423128",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { city: "Chiang Mai", check_in: "14:00", check_out: "12:00" },
  },
  {
    type: "hotel", status: "confirmed", title: "Conrad Tianjin",
    date_start: "2026-10-16T15:00:00+08:00", date_end: "2026-10-18T12:00:00+08:00",
    provider: "Conrad Hotels (Hilton)", confirmation_code: "9091528334393",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { city: "Tianjin", check_in: "15:00", check_out: "12:00" },
  },
  {
    type: "hotel", status: "confirmed", title: "Westin Xi'an",
    date_start: "2026-10-18T15:00:00+08:00", date_end: "2026-10-20T12:00:00+08:00",
    provider: "Westin (Marriott)", confirmation_code: "76505296",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { city: "Xi'an", check_in: "15:00", check_out: "12:00" },
  },
  // Amanda's separate flights
  {
    type: "flight", status: "confirmed", title: "Stuttgart to London (Heathrow)",
    date_start: "2026-10-05T08:00:00+02:00",
    provider: "Air Canada", confirmation_code: "CMVPZX",
    travelers: ["Amanda Ford"],
    details: { departure_airport: "STR", arrival_airport: "LHR", airline_iata: "AC", departure_timezone: "UTC+2", arrival_timezone: "UTC+1" },
  },
  {
    type: "flight", status: "confirmed", title: "London (Heathrow) to Cairo",
    date_start: "2026-10-05T14:00:00+01:00",
    provider: "Air Canada", confirmation_code: "CMVPZX",
    travelers: ["Amanda Ford"],
    details: { departure_airport: "LHR", arrival_airport: "CAI", airline_iata: "AC", departure_timezone: "UTC+1", arrival_timezone: "UTC+2" },
  },
  {
    type: "flight", status: "confirmed", title: "Cairo to Beijing",
    date_start: "2026-10-07T01:00:00+02:00",
    provider: "CNG655", confirmation_code: "CMVPZX",
    travelers: ["Amanda Ford"],
    details: { flight_number: "CNG655", departure_airport: "CAI", arrival_airport: "PEK", departure_timezone: "UTC+2", arrival_timezone: "UTC+8" },
  },
];

export async function POST() {
  try {
    const supabase = getServiceClient();

    // Clear existing bookings
    await supabase.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert seed data
    const { data, error } = await supabase.from("bookings").insert(SEED_BOOKINGS).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Seeded ${data.length} bookings successfully`,
      count: data.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}
