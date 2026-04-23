-- Seed loyalty placeholders derived from the actual airlines/hotels each
-- traveler is booked on (see supabase/seed.sql). All `number` values are
-- left NULL so the UI shows "Add number" — travelers fill in their own.
--
-- Idempotent: each row is keyed by (traveler_name, category, program_name)
-- via a NOT EXISTS guard, so re-running won't duplicate.

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM (VALUES
    -- Mike Clark — Delta, EgyptAir, Hainan, Bangkok Airways, Qatar
    ('Mike Clark',  'airline',         'Delta SkyMiles'),
    ('Mike Clark',  'airline',         'EgyptAir Plus'),
    ('Mike Clark',  'airline',         'Hainan Fortune Wings Club'),
    ('Mike Clark',  'airline',         'Bangkok Airways FlyerBonus'),
    ('Mike Clark',  'airline',         'Qatar Privilege Club'),
    ('Mike Clark',  'hotel',           'Hilton Honors'),
    ('Mike Clark',  'hotel',           'Marriott Bonvoy'),
    ('Mike Clark',  'known_traveler',  'Known Traveler Number (KTN)'),
    ('Mike Clark',  'known_traveler',  'Global Entry'),
    ('Mike Clark',  'known_traveler',  'TSA PreCheck'),
    ('Mike Clark',  'known_traveler',  'Redress Number'),

    -- Tonya Clark — same flights as Mike + American (DFW→TPA)
    ('Tonya Clark', 'airline',         'Delta SkyMiles'),
    ('Tonya Clark', 'airline',         'EgyptAir Plus'),
    ('Tonya Clark', 'airline',         'Hainan Fortune Wings Club'),
    ('Tonya Clark', 'airline',         'Bangkok Airways FlyerBonus'),
    ('Tonya Clark', 'airline',         'Qatar Privilege Club'),
    ('Tonya Clark', 'airline',         'American AAdvantage'),
    ('Tonya Clark', 'hotel',           'Hilton Honors'),
    ('Tonya Clark', 'hotel',           'Marriott Bonvoy'),
    ('Tonya Clark', 'known_traveler',  'Known Traveler Number (KTN)'),
    ('Tonya Clark', 'known_traveler',  'Global Entry'),
    ('Tonya Clark', 'known_traveler',  'TSA PreCheck'),
    ('Tonya Clark', 'known_traveler',  'Redress Number'),

    -- David Ramos — Delta, Hainan, Bangkok Airways, Qatar, American
    ('David Ramos', 'airline',         'Delta SkyMiles'),
    ('David Ramos', 'airline',         'Hainan Fortune Wings Club'),
    ('David Ramos', 'airline',         'Bangkok Airways FlyerBonus'),
    ('David Ramos', 'airline',         'Qatar Privilege Club'),
    ('David Ramos', 'airline',         'American AAdvantage'),
    ('David Ramos', 'hotel',           'Hilton Honors'),
    ('David Ramos', 'hotel',           'Marriott Bonvoy'),
    ('David Ramos', 'known_traveler',  'Known Traveler Number (KTN)'),
    ('David Ramos', 'known_traveler',  'Global Entry'),
    ('David Ramos', 'known_traveler',  'TSA PreCheck'),
    ('David Ramos', 'known_traveler',  'Redress Number'),

    -- Amanda Ford — Air Canada (her solo flights), shares hotels with the group
    ('Amanda Ford', 'airline',         'Air Canada Aeroplan'),
    ('Amanda Ford', 'hotel',           'Hilton Honors'),
    ('Amanda Ford', 'hotel',           'Marriott Bonvoy'),
    ('Amanda Ford', 'known_traveler',  'Known Traveler Number (KTN)'),
    ('Amanda Ford', 'known_traveler',  'Global Entry'),
    ('Amanda Ford', 'known_traveler',  'TSA PreCheck'),
    ('Amanda Ford', 'known_traveler',  'Redress Number')
  ) AS t(traveler_name, category, program_name)
  LOOP
    INSERT INTO loyalty_numbers (traveler_name, category, program_name, number)
    SELECT rec.traveler_name, rec.category, rec.program_name, NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM loyalty_numbers
      WHERE traveler_name = rec.traveler_name
        AND category = rec.category
        AND program_name = rec.program_name
    );
  END LOOP;
END $$;
