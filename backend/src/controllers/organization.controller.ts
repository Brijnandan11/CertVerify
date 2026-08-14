import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { query } from "../config/db";
import { AppError } from "../utils/AppError";

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  logoUrl: z.string().url().optional(),
});

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const res_ = await query("SELECT id, name, email, logo_url, created_at FROM organizations WHERE id = $1", [
      req.user!.organizationId,
    ]);
    if (res_.rowCount === 0) throw new AppError(404, "Organization not found");
    res.json({ organization: res_.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSchema.parse(req.body);
    const res_ = await query(
      `UPDATE organizations SET name = COALESCE($1, name), logo_url = COALESCE($2, logo_url), updated_at = now()
       WHERE id = $3 RETURNING id, name, email, logo_url, created_at`,
      [input.name ?? null, input.logoUrl ?? null, req.user!.organizationId]
    );
    res.json({ organization: res_.rows[0] });
  } catch (err) {
    next(err);
  }
}
