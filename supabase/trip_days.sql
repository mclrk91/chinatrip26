-- Per-day city + flag overrides. Editable from the Settings page.
-- Falls back to constants in src/lib/constants.ts if a row is missing.

CREATE TABLE IF NOT EXISTS trip_days (
  date date PRIMARY KEY,
  city text NOT NULL DEFAULT '',
  flag text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON trip_days
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reuses update_updated_at() from schema.sql
CREATE TRIGGER trip_days_updated_at
  BEFORE UPDATE ON trip_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed the 20 trip days (Oct 5–24, 2026).
-- Mismatches fixed vs. old constants:
--   Oct 6: 🇺🇸 → 🇪🇬 (group lands in Cairo early morning)
--   Oct 8: 🇹🇭 → 🇨🇳 (day starts in Beijing on HU429)
--   Oct 13: 🇨🇳 → 🇹🇭 (day starts in Chiang Mai, flies to Shenzhen late)
INSERT INTO trip_days (date, city, flag) VALUES
  ('2026-10-05', 'Tampa → New York', '🇺🇸'),
  ('2026-10-06', 'In Transit (Cairo)', '🇪🇬'),
  ('2026-10-07', 'Cairo → Beijing', '🇨🇳'),
  ('2026-10-08', 'Beijing → Bangkok → Koh Samui', '🇨🇳'),
  ('2026-10-09', 'Koh Samui', '🇹🇭'),
  ('2026-10-10', 'Koh Samui', '🇹🇭'),
  ('2026-10-11', 'Koh Samui → Chiang Mai', '🇹🇭'),
  ('2026-10-12', 'Chiang Mai', '🇹🇭'),
  ('2026-10-13', 'Chiang Mai → Shenzhen/Hong Kong', '🇹🇭'),
  ('2026-10-14', 'Shenzhen', '🇨🇳'),
  ('2026-10-15', 'Shenzhen', '🇨🇳'),
  ('2026-10-16', 'Tianjin', '🇨🇳'),
  ('2026-10-17', 'Tianjin', '🇨🇳'),
  ('2026-10-18', 'Xi''an', '🇨🇳'),
  ('2026-10-19', 'Xi''an', '🇨🇳'),
  ('2026-10-20', 'Chongqing', '🇨🇳'),
  ('2026-10-21', 'Chongqing', '🇨🇳'),
  ('2026-10-22', 'Hong Kong', '🇭🇰'),
  ('2026-10-23', 'Hong Kong → Doha', '🇭🇰'),
  ('2026-10-24', 'Doha → Dallas → Tampa', '🇺🇸')
ON CONFLICT (date) DO NOTHING;
