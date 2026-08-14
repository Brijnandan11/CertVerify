import { z } from "zod";

export const createCertificateSchema = z.object({
  recipientName: z.string().min(1).max(200),
  recipientEmail: z.string().email(),
  certificateTitle: z.string().min(1).max(200),
  courseName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  internshipDuration: z.string().min(1).max(100),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "completionDate must be YYYY-MM-DD"),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  signatoryName: z.string().min(1).max(200),
  signatoryDesignation: z.string().min(1).max(200),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const listCertificatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["VALID", "REVOKED", "EXPIRED"]).optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
