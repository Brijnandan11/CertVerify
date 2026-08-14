import crypto from "crypto";

export interface CertificateHashInput {
  recipient_name: string;
  certificate_title: string;
  course_name: string;
  organization_name: string;
  completion_date: string;
  certificate_id: string;
}

export function computeCertificateHash(input: CertificateHashInput): string {
  const canonical = JSON.stringify(input, Object.keys(input).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}
