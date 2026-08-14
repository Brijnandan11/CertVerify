import { describe, it, expect } from "vitest";
import { generateCertificateId } from "../src/utils/certificateId";

describe("generateCertificateId", () => {
  it("matches CERT-YYYY-XXXXXXXX format", () => {
    const id = generateCertificateId();
    expect(id).toMatch(/^CERT-\d{4}-[A-Z2-9]{8}$/);
  });

  it("generates different ids across calls (collision-resistant)", () => {
    const ids = new Set(Array.from({ length: 200 }, () => generateCertificateId()));
    expect(ids.size).toBe(200);
  });
});
