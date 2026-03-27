import { sign, verify } from "npm:jsonwebtoken@9.0.2";
// Use bcrypt from deno.land for better performance and reliability in Deno
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-change-in-production-2024";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  try {
    return sign(payload, JWT_SECRET, { expiresIn: "1d" });
  } catch (error) {
    console.error("JWT generation error:", error);
    throw new Error("Failed to generate token");
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Password hashing error:", error);
    throw new Error("Failed to hash password");
  }
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}
