-- One-shot migration: rename "David P" → "David Ramos" in live bookings.
-- Safe to re-run (idempotent via the WHERE guards).

-- 1. travelers text[]: replace any "David P" element with "David Ramos".
UPDATE bookings
SET travelers = (
  SELECT array_agg(CASE WHEN t = 'David P' THEN 'David Ramos' ELSE t END)
  FROM unnest(travelers) AS t
)
WHERE 'David P' = ANY(travelers);

-- 2. alt_codes jsonb: rename the key "David P" → "David Ramos" (preserving its value).
UPDATE bookings
SET alt_codes = (alt_codes - 'David P') || jsonb_build_object('David Ramos', alt_codes->'David P')
WHERE alt_codes ? 'David P';
