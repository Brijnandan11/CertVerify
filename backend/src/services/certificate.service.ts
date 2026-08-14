import { query } from "../config/db";
import { AppError } from "../utils/AppError";
import { generateCertificateId } from "../utils/certificateId";
import { computeCertificateHash } from "../utils/hash";
import { CreateCertificateInput } from "../validators/certificate.validator";
import { Certificate, CertificateStatus } from "../types";

// Derive real-time status: DB stores REVOKED explicitly, but EXPIRED is
// computed on read against expiry_date vs now — spec section 5 rule.
export function deriveStatus(cert: Certificate): CertificateStatus {
  if (cert.status === "REVOKED") return "REVOKED";
  if (cert.expiry_date && new Date(cert.expiry_date) < new Date()) return "EXPIRED";
  return "VALID";
}

export async function createCertificate(organizationId: string, organizationName: string, input: CreateCertificateInput) {
  let certificateId = generateCertificateId();
  // collision check — astronomically unlikely, but verify anyway (spec: collision-resistant)
  for (let i = 0; i < 5; i++) {
    const existing = await query("SELECT 1 FROM certificates WHERE certificate_id = $1", [certificateId]);
    if (existing.rowCount === 0) break;
    certificateId = generateCertificateId();
  }

  const hash = computeCertificateHash({
    recipient_name: input.recipientName,
    certificate_title: input.certificateTitle,
    course_name: input.courseName,
    organization_name: organizationName,
    completion_date: input.completionDate,
    certificate_id: certificateId,
  });

  const res = await query<Certificate>(
    `INSERT INTO certificates
      (organization_id, certificate_id, recipient_name, recipient_email, certificate_title,
       course_name, description, organization_name, internship_duration, completion_date, expiry_date,
       signatory_name, signatory_designation, certificate_hash, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      organizationId,
      certificateId,
      input.recipientName,
      input.recipientEmail,
      input.certificateTitle,
      input.courseName,
      input.description ?? null,
      organizationName,
      input.internshipDuration,
      input.completionDate,
      input.expiryDate ?? null,
      input.signatoryName,
      input.signatoryDesignation,
      hash,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ]
  );
  return res.rows[0];
}

export async function listCertificates(
  organizationId: string,
  opts: { page: number; pageSize: number; status?: string; search?: string; from?: string; to?: string }
) {
  const conditions = ["organization_id = $1"];
  const params: any[] = [organizationId];
  let idx = 2;

  if (opts.status) {
    conditions.push(`status = $${idx++}`);
    params.push(opts.status);
  }
  if (opts.search) {
    conditions.push(`(recipient_name ILIKE $${idx} OR certificate_id ILIKE $${idx} OR course_name ILIKE $${idx})`);
    params.push(`%${opts.search}%`);
    idx++;
  }
  if (opts.from) {
    conditions.push(`completion_date >= $${idx++}`);
    params.push(opts.from);
  }
  if (opts.to) {
    conditions.push(`completion_date <= $${idx++}`);
    params.push(opts.to);
  }

  const where = conditions.join(" AND ");
  const offset = (opts.page - 1) * opts.pageSize;

  const rows = await query<Certificate>(
    `SELECT * FROM certificates WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, opts.pageSize, offset]
  );
  const count = await query<{ count: string }>(`SELECT COUNT(*) FROM certificates WHERE ${where}`, params);

  return {
    items: rows.rows.map((c) => ({ ...c, status: deriveStatus(c) })),
    total: parseInt(count.rows[0].count, 10),
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function getCertificateForOrg(organizationId: string, id: string): Promise<Certificate> {
  const res = await query<Certificate>(
    "SELECT * FROM certificates WHERE id = $1 AND organization_id = $2",
    [id, organizationId]
  );
  if (res.rowCount === 0) throw new AppError(404, "Certificate not found");
  return res.rows[0];
}

export async function revokeCertificate(organizationId: string, id: string): Promise<Certificate> {
  const res = await query<Certificate>(
    `UPDATE certificates SET status = 'REVOKED', revoked_at = now(), updated_at = now()
     WHERE id = $1 AND organization_id = $2 RETURNING *`,
    [id, organizationId]
  );
  if (res.rowCount === 0) throw new AppError(404, "Certificate not found");
  return res.rows[0];
}

export async function getDashboardStats(organizationId: string) {
  const res = await query<{ status: string; count: string }>(
    `SELECT
       CASE
         WHEN status = 'REVOKED' THEN 'REVOKED'
         WHEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE THEN 'EXPIRED'
         ELSE 'VALID'
       END as status,
       COUNT(*) as count
     FROM certificates WHERE organization_id = $1 GROUP BY 1`,
    [organizationId]
  );
  const stats = { total: 0, valid: 0, revoked: 0, expired: 0 };
  for (const row of res.rows) {
    const n = parseInt(row.count, 10);
    stats.total += n;
    if (row.status === "VALID") stats.valid = n;
    if (row.status === "REVOKED") stats.revoked = n;
    if (row.status === "EXPIRED") stats.expired = n;
  }
  return stats;
}
