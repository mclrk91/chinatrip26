-- Back-fill details.timezone and booking_url on existing seed bookings.
-- Time zones taken from the departure tz of each reservation confirmation
-- (hotels use the local tz of the city). booking_url values come from the
-- trip's master booking sheet (individual Drive PDFs, one per reservation).

-- Helper pattern: merge timezone into the existing details jsonb.
-- jsonb || jsonb overwrites keys on the right, so it's safe.

-- Flights ---------------------------------------------------------------

-- TPA -> JFK (Delta DL2475)
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'EDT'),
    booking_url = 'https://drive.google.com/file/d/19cTPf66HHOECsIfjQUkOyambZSTbXmgK/view'
WHERE confirmation_code = 'JJ45B9';

-- JFK -> CAI (EgyptAir MS986) and CAI -> PEK (EgyptAir MS955) share PNR A5WIT3.
-- Different legs fly in different zones, so match by title to set each tz.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'EDT'),
    booking_url = 'https://drive.google.com/file/d/12hGicLHetLVw0Sx-l37-0JM7Poc9eowY/view'
WHERE confirmation_code = 'A5WIT3' AND title = 'New York (JFK) to Cairo';

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'EET'),
    booking_url = 'https://drive.google.com/file/d/12hGicLHetLVw0Sx-l37-0JM7Poc9eowY/view'
WHERE confirmation_code = 'A5WIT3' AND title = 'Cairo to Beijing';

-- PEK -> BKK (Hainan HU429) — no sheet entry, just set tz.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'CST (Beijing)')
WHERE confirmation_code = 'PDK6KW';

-- BKK -> USM and USM -> CNX share PNR DL2BJG. Same tz (ICT); different Drive PDFs.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'ICT'),
    booking_url = 'https://drive.google.com/file/d/1ayaYbxIEh5XJSA15_9mG7hnb_yWRawan/view'
WHERE confirmation_code = 'DL2BJG' AND title = 'Bangkok to Koh Samui';

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'ICT'),
    booking_url = 'https://drive.google.com/file/d/1jWr-aw09wQPkuryvvtHvvArNODL6Nxzn/view'
WHERE confirmation_code = 'DL2BJG' AND title = 'Koh Samui to Chiang Mai';

-- CNX -> SZX/HKG (TBD): still pending, just set tz.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'ICT')
WHERE title = 'Chiang Mai to Shenzhen/Hong Kong';

-- HKG -> DOH (QR815) and DOH -> DFW (QR731) share PNR 7MWYZ9, different zones.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'HKT'),
    booking_url = 'https://drive.google.com/file/d/1J2XGLfH5-VO0lTcLHpAVgerkC5y2nYmG/view'
WHERE confirmation_code = '7MWYZ9' AND title = 'Hong Kong to Doha';

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'AST (Doha)'),
    booking_url = 'https://drive.google.com/file/d/1J2XGLfH5-VO0lTcLHpAVgerkC5y2nYmG/view'
WHERE confirmation_code = '7MWYZ9' AND title = 'Doha to Dallas';

-- DFW -> TPA (AA2512) — not in sheet; tz only.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'CDT')
WHERE confirmation_code = 'CSTEDD';

-- Hotels ----------------------------------------------------------------

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'ICT'),
    booking_url = 'https://drive.google.com/file/d/1ZvDtusNKHPBB8LBArmnD5yls0O6QIUWu/view'
WHERE confirmation_code = '7636354423128';

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'China Time'),
    booking_url = 'https://drive.google.com/file/d/1ZUu_Ku40eF2GoBG1eUiMA5WiYJmosxkJ/view'
WHERE confirmation_code = '9091528334393';

-- Westin Xi'an — not in sheet; tz only.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'China Time')
WHERE confirmation_code = '76505296';

-- Amanda's separate flights (CMVPZX) — not in sheet; tz only, matched by title.
UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'CEST')
WHERE confirmation_code = 'CMVPZX' AND title = 'Stuttgart to London (Heathrow)';

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'BST')
WHERE confirmation_code = 'CMVPZX' AND title = 'London (Heathrow) to Cairo';

UPDATE bookings
SET details = details || jsonb_build_object('timezone', 'EET')
WHERE confirmation_code = 'CMVPZX' AND title = 'Cairo to Beijing';
