-- Back-fill details.website for seeded hotel bookings that may have been
-- inserted before the website field existed. Idempotent: each statement
-- is a no-op when details.website is already set, so it's safe to re-run.

-- Raweekanlaya Resort (Chai Lai Orchid) — Chiang Mai, Thailand
UPDATE bookings
SET details = details || jsonb_build_object('website', 'https://chailaiorchid.com/')
WHERE type = 'hotel'
  AND confirmation_code = '7636354423128'
  AND COALESCE(details->>'website', '') = '';

-- Conrad Tianjin
UPDATE bookings
SET details = details || jsonb_build_object('website', 'https://www.hilton.com/en/hotels/tsnhcci-conrad-tianjin/')
WHERE type = 'hotel'
  AND confirmation_code = '9091528334393'
  AND COALESCE(details->>'website', '') = '';

-- Westin Xi'an
UPDATE bookings
SET details = details || jsonb_build_object('website', 'https://www.marriott.com/en-us/hotels/sianw-the-westin-xian/overview/')
WHERE type = 'hotel'
  AND confirmation_code = '76505296'
  AND COALESCE(details->>'website', '') = '';
