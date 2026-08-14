export type CertificateStatus = "VALID" | "REVOKED" | "EXPIRED";

export interface Certificate {
  id: string;
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
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
}

export type VerificationResult =
  | { result: "NOT_FOUND" }
  | { result: "REVOKED"; certificateId: string }
  | { result: "EXPIRED"; certificateId: string; validUntil: string }
  | {
      result: "VALID";
      certificate: {
        certificateId: string;
        organizationName: string;
        recipientName: string;
        certificateTitle: string;
        courseName: string;
        internshipDuration: string;
        completionDate: string;
        status: "VALID";
      };
    };
