import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();
router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
