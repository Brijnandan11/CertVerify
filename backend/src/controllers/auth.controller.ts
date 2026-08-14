import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import * as authService from "../services/auth.service";
import { env } from "../config/env";

const cookieOpts = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  path: "/api/v1/auth",
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.cookie("refreshToken", result.refreshToken, cookieOpts);
    res.status(201).json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.cookie("refreshToken", result.refreshToken, cookieOpts);
    res.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: { message: "No refresh token" } });
    const result = await authService.refresh(token);
    res.cookie("refreshToken", result.refreshToken, cookieOpts);
    res.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("refreshToken", cookieOpts);
  res.status(204).send();
}
