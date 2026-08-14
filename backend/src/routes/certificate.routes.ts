import { Router } from "express";
import * as certController from "../controllers/certificate.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(requireAuth);
router.post("/", certController.create);
router.get("/", certController.list);
router.get("/stats/dashboard", certController.dashboardStats);
router.get("/:id", certController.getById);
router.get("/:id/pdf", certController.downloadPdf);
router.patch("/:id/revoke", certController.revoke);

export default router;
