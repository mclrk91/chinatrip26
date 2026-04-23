-- Loyalty / membership / known-traveler numbers per traveler.
-- Editable from the in-app "Numbers" tab.

CREATE TABLE IF NOT EXISTS loyalty_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('airline','hotel','known_traveler','credit_card','other')),
  program_name text NOT NULL,
  number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_traveler ON loyalty_numbers (traveler_name);
CREATE INDEX IF NOT EXISTS idx_loyalty_category ON loyalty_numbers (category);

ALTER TABLE loyalty_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON loyalty_numbers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reuses update_updated_at() from schema.sql
CREATE TRIGGER loyalty_numbers_updated_at
  BEFORE UPDATE ON loyalty_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
