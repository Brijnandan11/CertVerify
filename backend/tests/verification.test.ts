import { describe, it, expect } from "vitest";
import { deriveStatus } from "../src/services/certificate.service";
import { Certificate } from "../src/types";

function baseCert(overrides: Partial<Certificate> = {}): Certificate {
  return {
    id: "1",
    organization_id: "org1",
    certificate_id: "CERT-2026-TEST0001",
    recipient_name: "Test",
    recipient_email: "test@example.com",
    certificate_title: "Title",
    course_name: "Course",
    description: null,
    organization_name: "Org",
    internship_duration: "3 months",
    completion_date: "2026-01-01",
    expiry_date: null,
    signatory_name: "Sig",
    signatory_designation: "Role",
    status: "VALID",
    certificate_hash: "hash",
    pdf_url: null,
    metadata: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    revoked_at: null,
    ...overrides,
  };
}

describe("deriveStatus", () => {
  it("returns VALID for a normal certificate with no expiry", () => {
    expect(deriveStatus(baseCert())).toBe("VALID");
  });

  it("returns REVOKED when status is REVOKED regardless of expiry", () => {
    expect(deriveStatus(baseCert({ status: "REVOKED", expiry_date: "2099-01-01" }))).toBe("REVOKED");
  });

  it("returns EXPIRED when expiry_date is in the past", () => {
    expect(deriveStatus(baseCert({ expiry_date: "2000-01-01" }))).toBe("EXPIRED");
  });

  it("returns VALID when expiry_date is in the future", () => {
    expect(deriveStatus(baseCert({ expiry_date: "2099-01-01" }))).toBe("VALID");
  });
});
