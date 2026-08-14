-- 002_align_certificates_schema.sql
-- Databases created from an earlier revision of 001_init.sql have
-- certificates.issue_date and no internship_duration column. Align them
-- with the current schema. No-op on databases already at the current schema.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'issue_date'
  ) THEN
    ALTER TABLE certificates RENAME COLUMN issue_date TO completion_date;
  END IF;
END $$;

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS internship_duration TEXT;
