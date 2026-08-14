import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { Certificate } from "../types";
import { generateQrPngBuffer, buildVerificationUrl } from "./qr.service";

// A4 landscape = 842 x 595 pt
const GOLD = "#b08d2e";
const GOLD_DARK = "#8a6d1f";
const INK = "#1a1a2e";
const GRAY = "#6b6b6b";
const CREAM = "#FBF7EC";
const PAPER = "#ffffff";

function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function shortenMiddle(url: string, max = 44): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max / 2)}…${url.slice(-max / 3)}`;
}

function starPoints(cx: number, cy: number, outer: number, inner: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (-Math.PI / 2) + (i * Math.PI) / 5;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

export async function generateCertificatePdf(cert: Certificate): Promise<Buffer> {
  const qrBuffer = await generateQrPngBuffer(cert.certificate_id);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const cx = pageWidth / 2;

    // ---- background ----
    doc.rect(0, 0, pageWidth, pageHeight).fill(CREAM);

    // ---- gold double border ----
    doc.rect(16, 16, pageWidth - 32, pageHeight - 32).lineWidth(2).strokeColor(GOLD).stroke();
    doc.rect(26, 26, pageWidth - 52, pageHeight - 52).lineWidth(0.6).strokeColor(GOLD).stroke();

    // corner diamonds
    const corners: [number, number][] = [
      [16, 16],
      [pageWidth - 16, 16],
      [16, pageHeight - 16],
      [pageWidth - 16, pageHeight - 16],
    ];
    doc.fillColor(GOLD);
    for (const [x, y] of corners) {
      doc.polygon([x - 7, y], [x, y - 7], [x + 7, y], [x, y + 7]).fill();
    }

    // ---- organization name ----
    doc
      .font("Times-Roman")
      .fontSize(14)
      .fillColor(GOLD_DARK)
      .text(cert.organization_name.toUpperCase(), 0, 74, {
        align: "center",
        width: pageWidth,
        characterSpacing: 3,
      });

    // divider under org name (line + center diamond)
    doc.moveTo(cx - 150, 96).lineTo(cx + 150, 96).lineWidth(0.8).strokeColor(GOLD).stroke();
    doc.fillColor(GOLD).polygon([cx, 90], [cx + 4, 96], [cx, 102], [cx - 4, 96]).fill();

    // ---- title ----
    doc.font("Times-Bold").fontSize(34).fillColor(INK).text("CERTIFICATE OF COMPLETION", 0, 118, {
      align: "center",
      width: pageWidth,
    });

    // ---- seal emblem (top right) ----
    const sealX = pageWidth - 175;
    const sealY = 122;
    doc.circle(sealX, sealY, 46).lineWidth(1.5).strokeColor(GOLD).stroke();
    doc.circle(sealX, sealY, 38).lineWidth(0.6).strokeColor(GOLD).stroke();
    doc
      .polygon(...starPoints(sealX, sealY, 24, 9.5))
      .fillColor(GOLD)
      .fill();
    doc.font("Times-Bold").fontSize(7.5).fillColor(GOLD_DARK).text("AUTHENTIC", sealX - 20, sealY + 30, {
      width: 40,
      align: "center",
      characterSpacing: 1.5,
    });

    // ---- "This is to certify that" ----
    doc.font("Times-Italic").fontSize(15).fillColor(GRAY).text("This is to certify that", 0, 176, {
      align: "center",
      width: pageWidth,
    });

    // ---- recipient name + underline ----
    doc.font("Times-Bold").fontSize(32).fillColor(INK).text(cert.recipient_name, 0, 206, {
      align: "center",
      width: pageWidth,
    });
    doc.moveTo(cx - 210, 254).lineTo(cx + 210, 254).lineWidth(1).strokeColor(GOLD).stroke();
    doc.fillColor(GOLD).polygon([cx - 210, 254], [cx - 216, 254], [cx - 213, 260]).fill();
    doc.fillColor(GOLD).polygon([cx + 210, 254], [cx + 216, 254], [cx + 213, 260]).fill();

    // ---- "has successfully completed" ----
    doc.font("Times-Italic").fontSize(15).fillColor(GRAY).text("has successfully completed", 0, 272, {
      align: "center",
      width: pageWidth,
    });

    // ---- course / program ----
    doc.font("Times-Bold").fontSize(21).fillColor(GOLD_DARK).text(cert.course_name, cx - 340, 296, {
      width: 680,
      align: "center",
    });

    // ---- description (optional, trimmed) ----
    if (cert.description) {
      const desc = cert.description.length > 220 ? `${cert.description.slice(0, 217)}…` : cert.description;
      doc.font("Times-Italic").fontSize(10.5).fillColor(GRAY).text(desc, cx - 280, 328, {
        width: 560,
        align: "center",
      });
    }

    // ---- bottom row ----
    const bottomY = pageHeight - 175;

    // left: dates + certificate id
    doc.font("Times-Roman").fontSize(8).fillColor(GRAY).text("INTERNSHIP DURATION", 88, bottomY, { width: 170 });
    doc.font("Times-Bold").fontSize(12).fillColor(INK).text(cert.internship_duration, 88, bottomY + 12, {
      width: 170,
    });
    doc.font("Times-Roman").fontSize(8).fillColor(GRAY).text("COMPLETION DATE", 88, bottomY + 38, { width: 170 });
    doc.font("Times-Bold").fontSize(12).fillColor(INK).text(formatDate(cert.completion_date), 88, bottomY + 50, {
      width: 170,
    });
    if (cert.expiry_date) {
      doc.font("Times-Roman").fontSize(8).fillColor(GRAY).text("EXPIRY DATE", 88, bottomY + 76, { width: 170 });
      doc.font("Times-Bold").fontSize(12).fillColor(INK).text(formatDate(cert.expiry_date), 88, bottomY + 88, {
        width: 170,
      });
    }
    doc.font("Times-Roman").fontSize(8).fillColor(GRAY).text("CERTIFICATE ID", 88, bottomY + 120, { width: 170 });
    doc.font("Courier").fontSize(10).fillColor(INK).text(cert.certificate_id, 88, bottomY + 132, { width: 190 });

    // center: signature block
    const sigY = bottomY + 40;
    doc.moveTo(cx - 95, sigY).lineTo(cx + 95, sigY).lineWidth(1).strokeColor(INK).stroke();
    doc.font("Times-Bold").fontSize(13).fillColor(INK).text(cert.signatory_name, cx - 95, sigY + 8, {
      width: 190,
      align: "center",
    });
    doc.font("Times-Italic").fontSize(10).fillColor(GRAY).text(cert.signatory_designation, cx - 95, sigY + 24, {
      width: 190,
      align: "center",
    });

    // right: QR code
    const qrSize = 104;
    const qrX = pageWidth - 190;
    const qrY = bottomY - 18;
    doc.image(qrBuffer, qrX, qrY, { width: qrSize });
    doc.font("Times-Bold").fontSize(7).fillColor(GRAY).text("SCAN TO VERIFY", qrX - 8, qrY + qrSize + 6, {
      width: qrSize + 16,
      align: "center",
      characterSpacing: 1,
    });
    const url = buildVerificationUrl(cert.certificate_id);
    doc.font("Courier").fontSize(5.5).fillColor(GRAY).text(shortenMiddle(url), qrX - 18, qrY + qrSize + 18, {
      width: qrSize + 36,
      align: "center",
    });

    // ---- footer ----
    doc.font("Times-Roman").fontSize(7.5).fillColor(GRAY).text(
      `Verify this certificate online: ${shortenMiddle(url, 60)}`,
      0,
      pageHeight - 34,
      { align: "center", width: pageWidth }
    );

    doc.end();
  });
}
