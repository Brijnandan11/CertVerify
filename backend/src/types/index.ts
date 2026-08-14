export type CertificateStatus = "VALID" | "REVOKED" | "EXPIRED";

export interface Organization {
  id: string;
  name: string;
  email: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "owner";
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  organization_id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  certificate_title: string;
  course_name: string;
  description: string | null;
  organization_name: string;
  internship_duration: string;
  completion_date: string;
  expiry_date: string | null;
  signatory_name: string;
  signatory_designation: string;
  status: CertificateStatus;
  certificate_hash: string;
  pdf_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  revoked_at: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; organizationId: string; role: string };
    }
  }
}
