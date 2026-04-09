-- Phase 3: AI Actions + Smart Management - Additional Tables

-- Insights table for caching AI-generated trip insights
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('missing_accommodation', 'tight_connection', 'missing_booking', 'status_alert', 'traveler_gap', 'conflict', 'general')),
  severity text NOT NULL CHECK (severity IN ('red', 'yellow', 'green')),
  related_booking_ids uuid[] DEFAULT '{}',
  related_dates text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access on insights" ON insights FOR ALL USING (true) WITH CHECK (true);

-- Checklist table for pre-trip checklist items
CREATE TABLE IF NOT EXISTS checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  item text NOT NULL,
  checked boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access on checklist" ON checklist FOR ALL USING (true) WITH CHECK (true);

-- Points balances table for tracking loyalty points and credits
CREATE TABLE IF NOT EXISTS points_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('points', 'credits')),
  starting_balance numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'points',
  notes text,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE points_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access on points_balances" ON points_balances FOR ALL USING (true) WITH CHECK (true);

-- Trigger for points_balances updated_at
CREATE TRIGGER points_balances_updated_at
  BEFORE UPDATE ON points_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
