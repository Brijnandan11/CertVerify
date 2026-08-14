import { Router } from "express";
import * as orgController from "../controllers/organization.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(requireAuth);
router.get("/", orgController.get);
router.patch("/", orgController.update);

export default router;
