import { Router } from "express";
import authRoutes from "./auth.routes";
import certificateRoutes from "./certificate.routes";
import verificationRoutes from "./verification.routes";
import organizationRoutes from "./organization.routes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/certificates", certificateRoutes);
router.use("/organization", organizationRoutes);
router.use("/", verificationRoutes); // exposes /verify/:certificateId and /verification/stats

export default router;
