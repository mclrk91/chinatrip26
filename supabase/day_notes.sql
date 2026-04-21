-- Per-day notes (checklists, weather, anything not tied to a booking)

CREATE TABLE IF NOT EXISTS day_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_day_notes_date ON day_notes (date);

ALTER TABLE day_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON day_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reuses update_updated_at() from schema.sql
CREATE TRIGGER day_notes_updated_at
  BEFORE UPDATE ON day_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
