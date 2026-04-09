-- China Trip Command Center - Database Schema

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('flight','hotel','tour','activity','transport','restaurant','other')),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','pending','modified')),
  title text NOT NULL,
  date_start timestamptz,
  date_end timestamptz,
  provider text,
  confirmation_code text,
  alt_codes jsonb DEFAULT '{}',
  travelers text[] DEFAULT '{}',
  details jsonb DEFAULT '{}',
  payment_method text,
  cost jsonb DEFAULT '{}',
  cancellation_policy text,
  booking_url text,
  notes text,
  raw_file_url text,
  gdrive_file_id text,
  wanderlog_synced boolean DEFAULT false,
  extracted_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for timeline queries
CREATE INDEX IF NOT EXISTS idx_bookings_date_start ON bookings (date_start);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings (type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- Row Level Security (open access since we use PIN auth, not Supabase auth)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Draft bookings (survives page refresh)
CREATE TABLE IF NOT EXISTS booking_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on drafts" ON booking_drafts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup old drafts (older than 24 hours)
-- Run periodically via cron or cleanup endpoint

-- Storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-files', 'booking-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'booking-files');

CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'booking-files');

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'booking-files');
