import { Router } from "express";
import * as verificationController from "../controllers/verification.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { verifyRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();
router.get("/verify/:certificateId", verifyRateLimiter, verificationController.verify);
router.get("/verification/stats", requireAuth, verificationController.stats);

export default router;
