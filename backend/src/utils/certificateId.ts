import crypto from "crypto";

// Collision-resistant, non-sequential certificate ID: CERT-<YEAR>-<8 random base32 chars>
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const bytes = crypto.randomBytes(6);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += alphabet[bytes[i % bytes.length] % alphabet.length];
    bytes[i % bytes.length] = (bytes[i % bytes.length] + 7) % 256;
  }
  return `CERT-${year}-${suffix}`;
}
