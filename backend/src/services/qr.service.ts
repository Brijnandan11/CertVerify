import QRCode from "qrcode";
import { env } from "../config/env";

// QR encodes ONLY the public verification URL. No certificate data inside it —
// spec explicitly forbids embedding personal/certificate info in the QR payload.
export function buildVerificationUrl(certificateId: string): string {
  return `${env.publicAppUrl}/verify/${certificateId}`;
}

export async function generateQrPngBuffer(certificateId: string): Promise<Buffer> {
  const url = buildVerificationUrl(certificateId);
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H", // high correction — needed since certs get printed
    width: 512,
    margin: 1,
  });
}
