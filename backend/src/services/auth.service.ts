import bcrypt from "bcryptjs";
import { query } from "../config/db";
import { AppError } from "../utils/AppError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { Organization, User } from "../types";

export async function register(input: RegisterInput) {
  const existingOrg = await query<Organization>("SELECT id FROM organizations WHERE email = $1", [
    input.organizationEmail,
  ]);
  if (existingOrg.rowCount > 0) throw new AppError(409, "Organization email already registered");

  const existingUser = await query<User>("SELECT id FROM users WHERE email = $1", [input.email]);
  if (existingUser.rowCount > 0) throw new AppError(409, "User email already registered");

  const orgRes = await query<Organization>(
    `INSERT INTO organizations (name, email) VALUES ($1, $2) RETURNING *`,
    [input.organizationName, input.organizationEmail]
  );
  const org = orgRes.rows[0];

  const passwordHash = await bcrypt.hash(input.password, 12);
  const userRes = await query<User>(
    `INSERT INTO users (organization_id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'owner') RETURNING *`,
    [org.id, input.name, input.email, passwordHash]
  );
  const user = userRes.rows[0];

  return issueTokens(user);
}

export async function login(input: LoginInput) {
  const res = await query<User>("SELECT * FROM users WHERE email = $1", [input.email]);
  const user = res.rows[0];
  if (!user) throw new AppError(401, "Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) throw new AppError(401, "Invalid email or password");

  return issueTokens(user);
}

export async function refresh(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  const res = await query<User>("SELECT * FROM users WHERE id = $1", [payload.userId]);
  const user = res.rows[0];
  if (!user) throw new AppError(401, "User no longer exists");
  return issueTokens(user);
}

function issueTokens(user: User) {
  const accessToken = signAccessToken({
    userId: user.id,
    organizationId: user.organization_id,
    role: user.role,
  });
  const refreshToken = signRefreshToken({ userId: user.id });
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organization_id },
  };
}
