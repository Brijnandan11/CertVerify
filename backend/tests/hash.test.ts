import { describe, it, expect } from "vitest";
import { computeCertificateHash } from "../src/utils/hash";

describe("computeCertificateHash", () => {
  const input = {
    recipient_name: "Jane Doe",
    certificate_title: "Certificate of Completion",
    course_name: "Backend Engineering",
    organization_name: "Acme Corp",
    completion_date: "2026-08-14",
    certificate_id: "CERT-2026-ABCDEFGH",
  };

  it("produces a 64-char hex sha256 digest", () => {
    const hash = computeCertificateHash(input);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(computeCertificateHash(input)).toBe(computeCertificateHash(input));
  });

  it("changes if any field changes (tamper detection)", () => {
    const tampered = { ...input, recipient_name: "John Doe" };
    expect(computeCertificateHash(input)).not.toBe(computeCertificateHash(tampered));
  });
});
