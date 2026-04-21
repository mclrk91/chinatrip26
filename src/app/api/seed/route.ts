import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

const D = (id: string) => ({
  raw_file_url: `https://drive.google.com/file/d/${id}/view?usp=drivesdk`,
  gdrive_file_id: id,
  booking_url: `https://drive.google.com/file/d/${id}/view`,
});

const SEED_BOOKINGS = [
  // === OUTBOUND: US → Beijing ===
  {
    type: "flight", status: "confirmed", title: "Tampa to New York (JFK)",
    date_start: "2026-10-05T06:00:00-04:00", date_end: "2026-10-05T09:30:00-04:00",
    provider: "Delta Air Lines", confirmation_code: "JJ45B9",
    alt_codes: { "David Ramos": "JJ4589" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "DL2475", departure_airport: "TPA", arrival_airport: "JFK", timezone: "EDT" },
    ...D("19cTPf66HHOECsIfjQUkOyambZSTbXmgK"),
  },
  {
    type: "flight", status: "confirmed", title: "New York (JFK) to Cairo",
    date_start: "2026-10-05T20:00:00-04:00", date_end: "2026-10-06T14:00:00+02:00",
    provider: "EgyptAir", confirmation_code: "A5WIT3",
    travelers: ["Tonya Clark", "Mike Clark"],
    details: { flight_number: "MS986", departure_airport: "JFK", arrival_airport: "CAI", timezone: "EDT" },
    ...D("12hGicLHetLVw0Sx-l37-0JM7Poc9eowY"),
  },
  {
    type: "flight", status: "confirmed", title: "Cairo to Beijing",
    date_start: "2026-10-07T01:00:00+02:00", date_end: "2026-10-07T18:00:00+08:00",
    provider: "EgyptAir", confirmation_code: "A5WIT3",
    travelers: ["Tonya Clark", "Mike Clark"],
    details: { flight_number: "MS955", departure_airport: "CAI", arrival_airport: "PEK", timezone: "EET" },
    ...D("12hGicLHetLVw0Sx-l37-0JM7Poc9eowY"),
  },
  // David's separate EgyptAir booking (Flight Network, $3,598.79)
  {
    type: "flight", status: "confirmed", title: "New York (JFK) to Cairo — David",
    date_start: "2026-10-05T20:00:00-04:00", date_end: "2026-10-06T14:00:00+02:00",
    provider: "EgyptAir", confirmation_code: "1114-237-039",
    travelers: ["David Ramos"],
    details: { flight_number: "MS986", departure_airport: "JFK", arrival_airport: "CAI", cabin: "Business", booking_source: "Flight Network", timezone: "EDT" },
    cost: { total_usd: 3598.79, scope: "JFK→CAI→PEK round booking" },
    ...D("1mNDiGtOCqhstWgoTjfcgkSkizMtFSk31"),
  },
  {
    type: "flight", status: "confirmed", title: "Cairo to Beijing — David",
    date_start: "2026-10-07T01:00:00+02:00", date_end: "2026-10-07T18:00:00+08:00",
    provider: "EgyptAir", confirmation_code: "1114-237-039",
    travelers: ["David Ramos"],
    details: { flight_number: "MS955", departure_airport: "CAI", arrival_airport: "PEK", cabin: "Business", booking_source: "Flight Network", timezone: "EET" },
    ...D("1mNDiGtOCqhstWgoTjfcgkSkizMtFSk31"),
  },

  // === Amanda's outbound ===
  {
    type: "flight", status: "confirmed", title: "Stuttgart to London (Heathrow)",
    date_start: "2026-10-05T08:00:00+02:00",
    provider: "Air Canada", confirmation_code: "CMVPZX",
    travelers: ["Amanda Ford"],
    details: { departure_airport: "STR", arrival_airport: "LHR", timezone: "CEST" },
  },
  {
    type: "flight", status: "confirmed", title: "London (Heathrow) to Cairo",
    date_start: "2026-10-05T14:00:00+01:00",
    provider: "Air Canada", confirmation_code: "CMVPZX",
    travelers: ["Amanda Ford"],
    details: { departure_airport: "LHR", arrival_airport: "CAI", timezone: "BST" },
  },
  {
    type: "flight", status: "confirmed", title: "Cairo to Beijing (Amanda)",
    date_start: "2026-10-07T01:00:00+02:00",
    provider: "Air Canada (codeshare)", confirmation_code: "CMVPZX",
    travelers: ["Amanda Ford"],
    details: { flight_number: "CNG655", departure_airport: "CAI", arrival_airport: "PEK", timezone: "EET" },
  },

  // === Beijing Oct 7–8 lodging ===
  {
    type: "hotel", status: "confirmed", title: "Hilton Beijing Capital Airport — Mike",
    date_start: "2026-10-07T15:00:00+08:00", date_end: "2026-10-08T12:00:00+08:00",
    provider: "Hilton", confirmation_code: "2442587850",
    travelers: ["Mike Clark", "Tonya Clark"],
    details: { city: "Beijing", room: "King Hilton Guestroom", guests: 2, booking_source: "Chase Travel Trip 1016467277", timezone: "China Time", address: "1 Erjing Rd, Shunyi District, Beijing 101312, China", phone: "+86 10 6458 8888", website: "https://www.hilton.com/en/hotels/bjsapcc-hilton-beijing-capital-airport/" },
    cost: { total_usd: 161.10, points: "16,110 UR pts" },
    cancellation_policy: "Free cancellation until Oct 6 2026",
    ...D("1c79jjoFtAoLaIB2Ge-M-fwmRWKvCAGwQ"),
  },
  {
    type: "hotel", status: "pending", title: "Beijing Oct 7–8 — David & Amanda lodging",
    date_start: "2026-10-07T15:00:00+08:00", date_end: "2026-10-08T12:00:00+08:00",
    provider: "TBD", confirmation_code: null,
    travelers: ["David Ramos", "Amanda Ford"],
    details: { city: "Beijing", timezone: "China Time", address: "", phone: "", website: "" },
    notes: "Pending: confirm David/Amanda room for Oct 7–8 Beijing. Only Mike's Hilton Beijing is confirmed.",
  },

  // === Oct 8 Beijing → Bangkok → Koh Samui ===
  {
    type: "flight", status: "pending", title: "Beijing to Bangkok",
    date_start: "2026-10-08T08:00:00+08:00", date_end: "2026-10-08T12:30:00+07:00",
    provider: "Hainan Airlines (tentative)", confirmation_code: "PDK6KW",
    alt_codes: { "David Ramos": "QCK7K5" },
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { flight_number: "HU429", departure_airport: "PEK", arrival_airport: "BKK", timezone: "CST (Beijing)" },
    notes: "Pending: Beijing→Bangkok flight to connect with PG165 BKK→USM at 15:30. No confirmation PDF found in Drive.",
  },
  {
    type: "flight", status: "confirmed", title: "Bangkok to Koh Samui",
    date_start: "2026-10-08T15:00:00+07:00", date_end: "2026-10-08T16:20:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "DL2BJG",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "PG165", departure_airport: "BKK", arrival_airport: "USM", timezone: "ICT" },
    ...D("1ayaYbxIEh5XJSA15_9mG7hnb_yWRawan"),
  },
  {
    type: "flight", status: "confirmed", title: "Bangkok to Koh Samui (Amanda)",
    date_start: "2026-10-08T15:00:00+07:00", date_end: "2026-10-08T16:20:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "DYJW53",
    travelers: ["Amanda Ford"],
    details: { flight_number: "PG165", departure_airport: "BKK", arrival_airport: "USM", note: "Combined booking with Oct 11 USM→CNX", timezone: "ICT" },
    ...D("1eXcYTBAN1dlgyGSKIDznxhOlFVDkaBBP"),
  },

  // === Oct 11 USM → CNX ===
  {
    type: "flight", status: "confirmed", title: "Koh Samui to Chiang Mai",
    date_start: "2026-10-11T08:55:00+07:00", date_end: "2026-10-11T10:40:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "DL2BJG",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos"],
    details: { flight_number: "PG241", departure_airport: "USM", arrival_airport: "CNX", timezone: "ICT" },
    ...D("1jWr-aw09wQPkuryvvtHvvArNODL6Nxzn"),
  },
  {
    type: "flight", status: "confirmed", title: "Koh Samui to Chiang Mai (Amanda)",
    date_start: "2026-10-11T08:55:00+07:00", date_end: "2026-10-11T10:40:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "DYJW53",
    travelers: ["Amanda Ford"],
    details: { flight_number: "PG241", departure_airport: "USM", arrival_airport: "CNX", note: "Combined booking with Oct 8 BKK→USM", timezone: "ICT" },
    ...D("1eXcYTBAN1dlgyGSKIDznxhOlFVDkaBBP"),
  },

  // === Chiang Mai Oct 11–13 ===
  {
    type: "tour", status: "cancelled", title: "Chai Lai Orchid Elephant Sanctuary — 8am tour",
    date_start: "2026-10-11T08:00:00+07:00", date_end: "2026-10-11T12:00:00+07:00",
    provider: "Chai Lai Orchid", confirmation_code: "353603244377307",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { city: "Chiang Mai", timezone: "ICT" },
    notes: "Cancelled March 24 2026.",
    ...D("1Ei_0xWFwXyh7fCzoWCmEJC6NfYM_9R8n"),
  },
  {
    type: "hotel", status: "pending", title: "Raweekanlaya Bangkok Hotel",
    date_start: "2026-10-12T15:00:00+07:00", date_end: "2026-10-13T12:00:00+07:00",
    provider: "Raweekanlaya", confirmation_code: null,
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { city: "Bangkok", timezone: "ICT", address: "78 Thanon Luang, Wat Ratchabophit, Phra Nakhon, Bangkok 10200, Thailand", phone: "+66 2 029 9981", website: "https://raweekanlaya.com/" },
    notes: "Pending confirmation — no booking PDF found in Drive.",
  },
  {
    type: "hotel", status: "pending", title: "Chai Lai Orchid Chiang Mai — Tonya",
    date_start: "2026-10-12T14:00:00+07:00", date_end: "2026-10-13T12:00:00+07:00",
    provider: "Chai Lai Orchid", confirmation_code: "7636354423128",
    travelers: ["Tonya Clark"],
    details: { city: "Chiang Mai", room: "Chai Lai River view", check_in: "14:00", check_out: "12:00", timezone: "ICT", address: "202 Moo 9, Mae Win, Mae Wang District, Chiang Mai 50360, Thailand", phone: "+66 81 952 0983", website: "https://chailaiorchid.com/" },
    payment_method: "Pending payment",
    notes: "Pending payment per booking PDF.",
    ...D("1ZvDtusNKHPBB8LBArmnD5yls0O6QIUWu"),
  },

  // === Oct 13 CNX → BKK → SZX ===
  {
    type: "flight", status: "confirmed", title: "Chiang Mai to Bangkok",
    date_start: "2026-10-13T12:35:00+07:00", date_end: "2026-10-13T13:55:00+07:00",
    provider: "Bangkok Airways", confirmation_code: "1120-215-062",
    travelers: ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"],
    details: { departure_airport: "CNX", arrival_airport: "BKK", booking_source: "Flight Network", timezone: "ICT" },
    cost: { total_usd: 670.43 },
    ...D("13pna9uFxzdn15tRH_QBETXbssiVy9WFd"),
  },
  {
    type: "flight", status: "confirmed", title: "Bangkok to Shenzhen",
    date_start: "2026-10-13T17:00:00+07:00",
    provider: "China Southern", confirmation_code: "QCM6F7",
    travelers: ["Mike Clark", "Tonya Clark"],
    details: { flight_number: "CZ8324", departure_airport: "BKK", arrival_airport: "SZX", timezone: "ICT" },
    ...D("1WOsr4qDtebXB41BY09cpKJi4krnwMobp"),
  },
  {
    type: "flight", status: "confirmed", title: "Bangkok to Shenzhen (David & Amanda)",
    date_start: "2026-10-13T17:00:00+07:00",
    provider: "China Southern", confirmation_code: "MD48B7",
    travelers: ["David Ramos", "Amanda Ford"],
    details: { flight_number: "CZ8324", departure_airport: "BKK", arrival_airport: "SZX", timezone: "ICT" },
    ...D("1BsfbyoSdbNTHeeNzRC_AH33o9yqOIuiA"),
  },

  // === Shenzhen Oct 13–16 ===
  {
    type: "hotel", status: "confirmed", title: "JW Marriott Shenzhen Bao'an — David",
    date_start: "2026-10-13T15:00:00+08:00", date_end: "2026-10-16T12:00:00+08:00",
    provider: "JW Marriott", confirmation_code: "70266129",
    travelers: ["David Ramos"],
    details: { city: "Shenzhen", room: "2 King Beds, City View Glory Tower", timezone: "China Time", address: "8 Baoxing Road, Bao'an District, Shenzhen 518101, China", phone: "+86 755 2323 8888", website: "https://www.marriott.com/en-us/hotels/szxbj-jw-marriott-hotel-shenzhen-baoan/overview/" },
    payment_method: "Cash",
    ...D("1jCxNsoyzfnHW0pEr9xVvC8eY_JaEtuSI"),
  },
  {
    type: "hotel", status: "confirmed", title: "JW Marriott Shenzhen Bao'an — Mike",
    date_start: "2026-10-13T15:00:00+08:00", date_end: "2026-10-16T12:00:00+08:00",
    provider: "JW Marriott", confirmation_code: "98550030",
    travelers: ["Mike Clark", "Tonya Clark"],
    details: { city: "Shenzhen", room: "1 King, City View Main Tower", timezone: "China Time", address: "8 Baoxing Road, Bao'an District, Shenzhen 518101, China", phone: "+86 755 2323 8888", website: "https://www.marriott.com/en-us/hotels/szxbj-jw-marriott-hotel-shenzhen-baoan/overview/" },
    cost: { points: "107,000 Marriott Bonvoy pts" },
    ...D("1p8it1R6ynHsNYs763B9IEihRmfftJLF5"),
  },

  // === Oct 16 SZX → TSN ===
  {
    type: "flight", status: "confirmed", title: "Shenzhen to Tianjin",
    date_start: "2026-10-16T13:15:00+08:00", date_end: "2026-10-16T16:30:00+08:00",
    provider: "China Southern", confirmation_code: "QKP0KP",
    travelers: ["Mike Clark", "Tonya Clark"],
    details: { flight_number: "CZ8491", aircraft: "A320neo", cabin: "Economy", departure_airport: "SZX", arrival_airport: "TSN", booking_source: "Chase Travel Trip 1016464870", timezone: "China Time" },
    cost: { total_usd: 679.80, points: "55,150 UR pts" },
    ...D("16Pw_Dig-n6mQuNa4TZfTEHSuzrkgBzEP"),
  },
  {
    type: "flight", status: "confirmed", title: "Shenzhen to Tianjin (David & Amanda)",
    date_start: "2026-10-16T13:15:00+08:00", date_end: "2026-10-16T16:30:00+08:00",
    provider: "China Southern", confirmation_code: "QL6J4E",
    travelers: ["David Ramos", "Amanda Ford"],
    details: { flight_number: "CZ8491", aircraft: "A320neo", cabin: "Economy", departure_airport: "SZX", arrival_airport: "TSN", booking_source: "Chase Travel Trip 1016457572", timezone: "China Time" },
    cost: { total_usd: 679.80, points: "4,981 pts + $629.99" },
    ...D("11ILLolBGu7EnrtsHIq3OwgylO91faZwQ"),
  },

  // === Tianjin Oct 16–18 ===
  {
    type: "hotel", status: "confirmed", title: "Conrad Tianjin — Tonya",
    date_start: "2026-10-16T15:00:00+08:00", date_end: "2026-10-18T12:00:00+08:00",
    provider: "Conrad Hotels (Hilton)", confirmation_code: "9091528334393",
    travelers: ["Tonya Clark", "Mike Clark"],
    details: { city: "Tianjin", room: "Deluxe King", guests: 2, booking_source: "Amex Travel", hilton_honors: "2039501537", timezone: "China Time", address: "2 Youyi Road, Hexi District, Tianjin 300061, China", phone: "+86 22 6550 8888", website: "https://www.hilton.com/en/hotels/tsnhcci-conrad-tianjin/" },
    cost: { total_usd: 354.66 },
    ...D("1ZUu_Ku40eF2GoBG1eUiMA5WiYJmosxkJ"),
  },

  // === Xi'an Oct 18–20 ===
  {
    type: "hotel", status: "pending", title: "Westin Xi'an",
    date_start: "2026-10-18T15:00:00+08:00", date_end: "2026-10-20T12:00:00+08:00",
    provider: "Westin (Marriott)", confirmation_code: "76505296",
    travelers: ["Mike Clark", "Tonya Clark", "Amanda Ford"],
    details: { city: "Xi'an", check_in: "15:00", check_out: "12:00", timezone: "China Time", address: "66 Ci En Road, Yanta District, Xi'an 710061, China", phone: "+86 29 6568 6568", website: "https://www.marriott.com/en-us/hotels/sianw-the-westin-xian/overview/" },
    notes: "Pending confirmation — no booking PDF in Drive. David has Glenview Chongqing Oct 20–22 instead; party may be splitting up.",
  },

  // === Chongqing Oct 20–22 (David only) ===
  {
    type: "hotel", status: "confirmed", title: "Glenview ITC Plaza Chongqing — David",
    date_start: "2026-10-20T15:00:00+08:00", date_end: "2026-10-22T12:00:00+08:00",
    provider: "Glenview ITC Plaza", confirmation_code: null,
    travelers: ["David Ramos"],
    details: { city: "Chongqing", room: "Executive Suite", timezone: "China Time", address: "1 Qingyun Road, Yubei District, Chongqing 401147, China", phone: "+86 23 6755 9999", website: "https://www.glenviewhotels.com/" },
    cost: { total_usd: 284.60 },
    notes: "Confirmation code to be extracted from booking PDF.",
    ...D("16a3jDSS06ASW1Cr91Z78M1Shdr82til4"),
  },

  // === Departures ===
  // Amanda: HKG → ZRH → STR (Oct 22–23)
  {
    type: "flight", status: "confirmed", title: "Hong Kong to Zurich (Amanda)",
    date_start: "2026-10-22T23:00:00+08:00", date_end: "2026-10-23T06:00:00+02:00",
    provider: "Swiss", confirmation_code: "XJGCCS",
    alt_codes: { e_ticket: "724-2347588933" },
    travelers: ["Amanda Ford"],
    details: { flight_number: "LX1164", cabin: "Business Flex", departure_airport: "HKG", arrival_airport: "ZRH", timezone: "HKT" },
    cost: { total_hkd: 27959 },
    notes: "Times approximate — confirm from PDF.",
    ...D("1BK0oUsvOF1hAb3uzHNtSA-6A4Iv6GxLX"),
  },
  {
    type: "flight", status: "confirmed", title: "Zurich to Stuttgart (Amanda)",
    date_start: "2026-10-23T09:00:00+02:00", date_end: "2026-10-23T10:00:00+02:00",
    provider: "Swiss", confirmation_code: "XJGCCS",
    alt_codes: { e_ticket: "724-2347588933" },
    travelers: ["Amanda Ford"],
    details: { flight_number: "LX139", cabin: "Business Flex", departure_airport: "ZRH", arrival_airport: "STR", timezone: "CEST" },
    notes: "Times approximate — confirm from PDF.",
    ...D("1BK0oUsvOF1hAb3uzHNtSA-6A4Iv6GxLX"),
  },
  // David: HKG → DOH → DFW (Oct 22–23) on 7NGTZ7
  {
    type: "flight", status: "confirmed", title: "Hong Kong to Doha (David)",
    date_start: "2026-10-22T23:50:00+08:00", date_end: "2026-10-23T04:20:00+03:00",
    provider: "Qatar Airways", confirmation_code: "7NGTZ7",
    travelers: ["David Ramos"],
    details: { flight_number: "QR815", departure_airport: "HKG", arrival_airport: "DOH", seat: "18G", timezone: "HKT" },
    ...D("13P9kyLVBakN_up_DBoynKgxeyaSdIHS0"),
  },
  {
    type: "flight", status: "confirmed", title: "Doha to Dallas (David)",
    date_start: "2026-10-23T08:00:00+03:00", date_end: "2026-10-23T14:30:00-05:00",
    provider: "Qatar Airways", confirmation_code: "7NGTZ7",
    travelers: ["David Ramos"],
    details: { flight_number: "QR731", departure_airport: "DOH", arrival_airport: "DFW", seat: "4B", timezone: "AST (Doha)" },
    ...D("13P9kyLVBakN_up_DBoynKgxeyaSdIHS0"),
  },
  // Mike: HKG → DOH → DFW (Oct 23–24) on 7MWYZ9
  {
    type: "flight", status: "confirmed", title: "Hong Kong to Doha (Mike)",
    date_start: "2026-10-23T23:50:00+08:00", date_end: "2026-10-24T04:20:00+03:00",
    provider: "Qatar Airways", confirmation_code: "7MWYZ9",
    travelers: ["Mike Clark"],
    details: { flight_number: "QR815", departure_airport: "HKG", arrival_airport: "DOH", seat: "18D", pax_on_booking: 1, timezone: "HKT" },
    ...D("1J2XGLfH5-VO0lTcLHpAVgerkC5y2nYmG"),
  },
  {
    type: "flight", status: "confirmed", title: "Doha to Dallas (Mike)",
    date_start: "2026-10-24T08:00:00+03:00", date_end: "2026-10-24T14:30:00-05:00",
    provider: "Qatar Airways", confirmation_code: "7MWYZ9",
    travelers: ["Mike Clark"],
    details: { flight_number: "QR731", departure_airport: "DOH", arrival_airport: "DFW", pax_on_booking: 1, timezone: "AST (Doha)" },
    ...D("1J2XGLfH5-VO0lTcLHpAVgerkC5y2nYmG"),
  },
  // Tonya: Qatar HKG→DOH→DFW — pending
  {
    type: "flight", status: "pending", title: "Hong Kong to Doha (Tonya)",
    date_start: "2026-10-23T23:50:00+08:00", date_end: "2026-10-24T04:20:00+03:00",
    provider: "Qatar Airways", confirmation_code: null,
    travelers: ["Tonya Clark"],
    details: { flight_number: "QR815", departure_airport: "HKG", arrival_airport: "DOH", timezone: "HKT" },
    notes: "Pending: Tonya's Qatar booking not yet confirmed — only Mike on PNR 7MWYZ9 (booking shows 1 pax).",
  },
  {
    type: "flight", status: "pending", title: "Doha to Dallas (Tonya)",
    date_start: "2026-10-24T08:00:00+03:00", date_end: "2026-10-24T14:30:00-05:00",
    provider: "Qatar Airways", confirmation_code: null,
    travelers: ["Tonya Clark"],
    details: { flight_number: "QR731", departure_airport: "DOH", arrival_airport: "DFW", timezone: "AST (Doha)" },
    notes: "Pending: Tonya's Qatar booking not yet confirmed.",
  },
  // Final leg DFW→TPA — pending
  {
    type: "flight", status: "pending", title: "Dallas to Tampa",
    date_start: "2026-10-24T17:00:00-05:00", date_end: "2026-10-24T20:30:00-04:00",
    provider: "American Airlines", confirmation_code: "CSTEDD",
    alt_codes: { "David Ramos": "KXRQUY" },
    travelers: ["Tonya Clark", "David Ramos"],
    details: { flight_number: "AA2512", departure_airport: "DFW", arrival_airport: "TPA", timezone: "CDT" },
    notes: "Pending: no confirmation PDF found in Drive.",
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
