-- 001_init.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_organization_id ON users(organization_id);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  certificate_id TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  certificate_title TEXT NOT NULL,
  course_name TEXT NOT NULL,
  description TEXT,
  organization_name TEXT NOT NULL,
  internship_duration TEXT NOT NULL,
  completion_date DATE NOT NULL,
  expiry_date DATE,
  signatory_name TEXT NOT NULL,
  signatory_designation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'REVOKED', 'EXPIRED')),
  certificate_hash TEXT NOT NULL,
  pdf_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- fast public verification lookup
CREATE UNIQUE INDEX idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX idx_certificates_organization_id ON certificates(organization_id);
CREATE INDEX idx_certificates_status ON certificates(status);

CREATE TABLE verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL REFERENCES certificates(certificate_id) ON DELETE CASCADE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX idx_verification_events_certificate_id ON verification_events(certificate_id);
