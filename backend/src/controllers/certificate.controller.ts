import { Request, Response, NextFunction } from "express";
import { createCertificateSchema, listCertificatesQuerySchema } from "../validators/certificate.validator";
import * as certService from "../services/certificate.service";
import * as pdfService from "../services/pdf.service";
import { query } from "../config/db";
import { AppError } from "../utils/AppError";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createCertificateSchema.parse(req.body);
    const orgRes = await query<{ name: string }>("SELECT name FROM organizations WHERE id = $1", [
      req.user!.organizationId,
    ]);
    const cert = await certService.createCertificate(req.user!.organizationId, orgRes.rows[0].name, input);
    res.status(201).json({ certificate: cert });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const q = listCertificatesQuerySchema.parse(req.query);
    const result = await certService.listCertificates(req.user!.organizationId, q);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const cert = await certService.getCertificateForOrg(req.user!.organizationId, req.params.id);
    res.json({ certificate: { ...cert, status: certService.deriveStatus(cert) } });
  } catch (err) {
    next(err);
  }
}

export async function downloadPdf(req: Request, res: Response, next: NextFunction) {
  try {
    const cert = await certService.getCertificateForOrg(req.user!.organizationId, req.params.id);
    const pdfBuffer = await pdfService.generateCertificatePdf(cert);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cert.certificate_id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(new AppError(500, "Failed to generate PDF"));
  }
}

export async function revoke(req: Request, res: Response, next: NextFunction) {
  try {
    const cert = await certService.revokeCertificate(req.user!.organizationId, req.params.id);
    res.json({ certificate: cert });
  } catch (err) {
    next(err);
  }
}

export async function dashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await certService.getDashboardStats(req.user!.organizationId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
