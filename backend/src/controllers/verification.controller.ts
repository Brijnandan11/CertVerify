import { Request, Response, NextFunction } from "express";
import * as verificationService from "../services/verification.service";

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const certificateId = req.params.certificateId;
    const result = await verificationService.verifyCertificate(certificateId, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const s = await verificationService.getVerificationStats(req.user!.organizationId);
    res.json(s);
  } catch (err) {
    next(err);
  }
}
