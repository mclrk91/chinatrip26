-- Seed Data: Flights

-- 1. Oct 5: TPA→JFK, Delta DL2475
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details)
VALUES (
  'flight', 'confirmed', 'Tampa to New York (JFK)',
  '2026-10-05T06:00:00-04:00', '2026-10-05T09:30:00-04:00',
  'Delta Air Lines', 'JJ45B9',
  '{"David Ramos": "JJ4589"}',
  '{"Mike Clark","Tonya Clark","David Ramos"}',
  '{"flight_number": "DL2475", "departure_airport": "TPA", "arrival_airport": "JFK"}'
);

-- 2. Oct 5-6: JFK→CAI, EgyptAir MS986
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, travelers, details)
VALUES (
  'flight', 'confirmed', 'New York (JFK) to Cairo',
  '2026-10-05T20:00:00-04:00', '2026-10-06T14:00:00+02:00',
  'EgyptAir', 'A5WIT3',
  '{"Tonya Clark","Mike Clark"}',
  '{"flight_number": "MS986", "departure_airport": "JFK", "arrival_airport": "CAI"}'
);

-- 3. Oct 7: CAI→PEK, EgyptAir MS955
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, travelers, details)
VALUES (
  'flight', 'confirmed', 'Cairo to Beijing',
  '2026-10-07T01:00:00+02:00', '2026-10-07T18:00:00+08:00',
  'EgyptAir', 'A5WIT3',
  '{"Tonya Clark","Mike Clark"}',
  '{"flight_number": "MS955", "departure_airport": "CAI", "arrival_airport": "PEK"}'
);

-- 4. Oct 8: PEK→BKK, Hainan HU429
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details)
VALUES (
  'flight', 'confirmed', 'Beijing to Bangkok',
  '2026-10-08T08:00:00+08:00', '2026-10-08T12:30:00+07:00',
  'Hainan Airlines', 'PDK6KW',
  '{"David Ramos": "QCK7K5"}',
  '{"Mike Clark","Tonya Clark","David Ramos"}',
  '{"flight_number": "HU429", "departure_airport": "PEK", "arrival_airport": "BKK"}'
);

-- 5. Oct 8: BKK→USM, Bangkok Air PG165
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details)
VALUES (
  'flight', 'confirmed', 'Bangkok to Koh Samui',
  '2026-10-08T15:00:00+07:00', '2026-10-08T16:20:00+07:00',
  'Bangkok Airways', 'DL2BJG',
  '{"David Ramos": "DYJW53"}',
  '{"Mike Clark","Tonya Clark","David Ramos"}',
  '{"flight_number": "PG165", "departure_airport": "BKK", "arrival_airport": "USM"}'
);

-- 6. Oct 11: USM→CNX, Bangkok Air PG241
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, travelers, details)
VALUES (
  'flight', 'confirmed', 'Koh Samui to Chiang Mai',
  '2026-10-11T10:00:00+07:00', '2026-10-11T11:40:00+07:00',
  'Bangkok Airways', 'DL2BJG',
  '{"Mike Clark","Tonya Clark","David Ramos"}',
  '{"flight_number": "PG241", "departure_airport": "USM", "arrival_airport": "CNX"}'
);

-- 7. Oct 13: CNX→SZX/HKG (TBD)
INSERT INTO bookings (type, status, title, date_start, provider, confirmation_code, travelers, details, notes)
VALUES (
  'flight', 'pending', 'Chiang Mai to Shenzhen/Hong Kong',
  '2026-10-13T12:00:00+07:00',
  'TBD', 'TBD',
  '{"Mike Clark","Tonya Clark","David Ramos","Amanda Ford"}',
  '{"departure_airport": "CNX", "arrival_airport": "SZX/HKG"}',
  'Flight details to be confirmed'
);

-- 8. Oct 23: HKG→DOH, Qatar QR815
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details)
VALUES (
  'flight', 'confirmed', 'Hong Kong to Doha',
  '2026-10-23T23:50:00+08:00', '2026-10-24T04:20:00+03:00',
  'Qatar Airways', '7MWYZ9',
  '{"alt": "77R8A7"}',
  '{"Mike Clark","Tonya Clark","David Ramos"}',
  '{"flight_number": "QR815", "departure_airport": "HKG", "arrival_airport": "DOH"}'
);

-- 9. Oct 24: DOH→DFW, Qatar QR731
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details)
VALUES (
  'flight', 'confirmed', 'Doha to Dallas',
  '2026-10-24T08:00:00+03:00', '2026-10-24T14:30:00-05:00',
  'Qatar Airways', '7MWYZ9',
  '{"alt": "77R8A7"}',
  '{"Mike Clark","Tonya Clark","David Ramos"}',
  '{"flight_number": "QR731", "departure_airport": "DOH", "arrival_airport": "DFW"}'
);

-- 10. Oct 24: DFW→TPA, AA 2512
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details)
VALUES (
  'flight', 'confirmed', 'Dallas to Tampa',
  '2026-10-24T17:00:00-05:00', '2026-10-24T20:30:00-04:00',
  'American Airlines', 'CSTEDD',
  '{"David Ramos": "KXRQUY"}',
  '{"Tonya Clark","David Ramos"}',
  '{"flight_number": "AA2512", "departure_airport": "DFW", "arrival_airport": "TPA"}'
);

-- Seed Data: Hotels

-- 1. Oct 12-13: Raweekanlaya Resort
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, travelers, details)
VALUES (
  'hotel', 'confirmed', 'Raweekanlaya Resort (Chai Lai Orchid)',
  '2026-10-12T14:00:00+07:00', '2026-10-13T12:00:00+07:00',
  'Chai Lai Orchid', '7636354423128',
  '{"Mike Clark","Tonya Clark","David Ramos","Amanda Ford"}',
  '{"city": "Chiang Mai", "check_in": "14:00", "check_out": "12:00", "address": "202 Moo 9, Mae Win, Mae Wang District, Chiang Mai 50360, Thailand", "phone": "+66 81 952 0983", "website": "https://chailaiorchid.com/"}'
);

-- 2. Oct 16-18: Conrad Tianjin
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, travelers, details)
VALUES (
  'hotel', 'confirmed', 'Conrad Tianjin',
  '2026-10-16T15:00:00+08:00', '2026-10-18T12:00:00+08:00',
  'Conrad Hotels (Hilton)', '9091528334393',
  '{"Mike Clark","Tonya Clark","David Ramos","Amanda Ford"}',
  '{"city": "Tianjin", "check_in": "15:00", "check_out": "12:00", "address": "2 Youyi Road, Hexi District, Tianjin 300061, China", "phone": "+86 22 6550 8888", "website": "https://www.hilton.com/en/hotels/tsnhcci-conrad-tianjin/"}'
);

-- 3. Oct 18-20: Westin Xi'an
INSERT INTO bookings (type, status, title, date_start, date_end, provider, confirmation_code, travelers, details)
VALUES (
  'hotel', 'confirmed', 'Westin Xi''an',
  '2026-10-18T15:00:00+08:00', '2026-10-20T12:00:00+08:00',
  'Westin (Marriott)', '76505296',
  '{"Mike Clark","Tonya Clark","David Ramos","Amanda Ford"}',
  '{"city": "Xi''an", "check_in": "15:00", "check_out": "12:00", "address": "66 Ci En Road, Yanta District, Xi''an 710061, China", "phone": "+86 29 6568 6568", "website": "https://www.marriott.com/en-us/hotels/sianw-the-westin-xian/overview/"}'
);

-- Seed Data: Amanda's Separate Flights

-- Amanda: STR→LHR
INSERT INTO bookings (type, status, title, date_start, provider, confirmation_code, travelers, details)
VALUES (
  'flight', 'confirmed', 'Stuttgart to London (Heathrow)',
  '2026-10-05T08:00:00+02:00',
  'Air Canada', 'CMVPZX',
  '{"Amanda Ford"}',
  '{"departure_airport": "STR", "arrival_airport": "LHR"}'
);

-- Amanda: LHR→CAI
INSERT INTO bookings (type, status, title, date_start, provider, confirmation_code, travelers, details)
VALUES (
  'flight', 'confirmed', 'London (Heathrow) to Cairo',
  '2026-10-05T14:00:00+01:00',
  'Air Canada', 'CMVPZX',
  '{"Amanda Ford"}',
  '{"departure_airport": "LHR", "arrival_airport": "CAI"}'
);

-- Amanda: CAI→PEK
INSERT INTO bookings (type, status, title, date_start, provider, confirmation_code, travelers, details)
VALUES (
  'flight', 'confirmed', 'Cairo to Beijing',
  '2026-10-07T01:00:00+02:00',
  'CNG655', 'CMVPZX',
  '{"Amanda Ford"}',
  '{"flight_number": "CNG655", "departure_airport": "CAI", "arrival_airport": "PEK"}'
);
