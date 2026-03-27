import { Context, Next } from "npm:hono";
import { verifyToken } from "./auth.tsx";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "No token provided" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }

  c.set("user", decoded);
  await next();
}

export function roleMiddleware(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ message: "Access denied" }, 403);
    }

    await next();
  };
}
