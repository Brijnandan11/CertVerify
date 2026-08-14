import { query } from "../config/db";
import { Certificate } from "../types";
import { deriveStatus } from "./certificate.service";
import { hashIp } from "../utils/hash";

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

export async function verifyCertificate(
  certificateId: string,
  meta: { ip?: string; userAgent?: string }
): Promise<VerificationResult> {
  const res = await query<Certificate>("SELECT * FROM certificates WHERE certificate_id = $1", [certificateId]);

  // log event regardless of outcome (spec section 15) — but never for garbage-length junk ids
  if (certificateId.length <= 64) {
    await query(
      `INSERT INTO verification_events (certificate_id, ip_hash, user_agent) VALUES ($1, $2, $3)`,
      [certificateId, meta.ip ? hashIp(meta.ip) : null, meta.userAgent ?? null]
    ).catch(() => {
      /* if cert doesn't exist, FK will reject the insert — that's fine, non-fatal */
    });
  }

  if (res.rowCount === 0) return { result: "NOT_FOUND" };

  const cert = res.rows[0];
  const status = deriveStatus(cert);

  if (status === "REVOKED") return { result: "REVOKED", certificateId: cert.certificate_id };
  if (status === "EXPIRED")
    return { result: "EXPIRED", certificateId: cert.certificate_id, validUntil: cert.expiry_date as string };

  return {
    result: "VALID",
    certificate: {
      certificateId: cert.certificate_id,
      organizationName: cert.organization_name,
      recipientName: cert.recipient_name,
      certificateTitle: cert.certificate_title,
      courseName: cert.course_name,
      internshipDuration: cert.internship_duration,
      completionDate: cert.completion_date,
      status: "VALID",
    },
  };
}

export async function getVerificationStats(organizationId: string) {
  const totalRes = await query<{ count: string }>(
    `SELECT COUNT(*) FROM verification_events ve
     JOIN certificates c ON c.certificate_id = ve.certificate_id
     WHERE c.organization_id = $1`,
    [organizationId]
  );
  const todayRes = await query<{ count: string }>(
    `SELECT COUNT(*) FROM verification_events ve
     JOIN certificates c ON c.certificate_id = ve.certificate_id
     WHERE c.organization_id = $1 AND ve.verified_at >= CURRENT_DATE`,
    [organizationId]
  );
  return {
    total: parseInt(totalRes.rows[0].count, 10),
    today: parseInt(todayRes.rows[0].count, 10),
  };
}
