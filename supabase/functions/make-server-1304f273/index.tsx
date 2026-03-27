import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { generateToken, hashPassword, comparePassword } from "./auth.tsx";
import { authMiddleware, roleMiddleware } from "./middleware.tsx";
import { initializeDatabase, getDatabase } from "./db-factory.tsx";
import { testMongoDBConnection } from "./test-connection.tsx";

const app = new Hono();

// Initialize database on startup
console.log("🚀 Starting server...");
const db = initializeDatabase();

// Create default admin user if no users exist
async function initializeDefaultUser() {
  try {
    const existingUsers = await db.getByPrefix("user:");
    if (existingUsers.length === 0) {
      console.log("📝 No users found, creating default admin user...");
      
      const { hashPassword } = await import("./auth.tsx");
      const hashedPassword = await hashPassword("admin123");
      
      const adminUser = {
        id: "user:1",
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.set("user:1", adminUser);
      console.log("✅ Default admin user created (admin@example.com / admin123)");
    } else {
      console.log(`ℹ️ Found ${existingUsers.length} existing user(s)`);
    }
  } catch (error) {
    console.error("⚠️ Could not create default user:", error);
  }
}

// Test MongoDB connection on startup if MongoDB URL is provided
const mongoUrl = Deno.env.get("MONGODB_URL");
if (mongoUrl) {
  console.log("🔗 MongoDB URL detected, testing connection...");
  testMongoDBConnection().then(async (success) => {
    if (success) {
      console.log("✅ MongoDB is ready to use!");
      await initializeDefaultUser();
    } else {
      console.log("⚠️ MongoDB connection issue detected");
    }
  });
} else {
  console.log("📦 Using Supabase KV Store");
  initializeDefaultUser();
}

// Enable logger
// app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1304f273/health", (c) => {
  const mongoUrl = Deno.env.get("MONGODB_URL");
  const dbType = mongoUrl ? "mongodb" : "supabase";
  
  return c.json({ 
    status: "ok",
    database: dbType,
    mongodb_configured: !!mongoUrl,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check database connectivity
app.get("/make-server-1304f273/debug", async (c) => {
  try {
    const mongoUrl = Deno.env.get("MONGODB_URL");
    
    // Test database connection
    const testKey = `test:${Date.now()}`;
    const testValue = { message: "test", timestamp: new Date().toISOString() };
    
    await db.set(testKey, testValue);
    const retrieved = await db.get(testKey);
    await db.del(testKey);
    
    // Test user count
    const users = await db.getByPrefix("user:");
    
    return c.json({
      status: "success",
      database: mongoUrl ? "mongodb" : "supabase",
      mongodb_url_present: !!mongoUrl,
      test_write: "success",
      test_read: retrieved ? "success" : "failed",
      test_delete: "success",
      user_count: users.length,
      bcryptjs_available: true, // Will throw error if not available
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return c.json({
      status: "error",
      error: String(error),
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, 500);
  }
});

// Test endpoint for bcryptjs
app.get("/make-server-1304f273/test-bcrypt", async (c) => {
  try {
    const testPassword = "test123";
    const hashed = await hashPassword(testPassword);
    const isValid = await comparePassword(testPassword, hashed);
    
    return c.json({
      status: "success",
      hashed_length: hashed.length,
      password_match: isValid,
      bcryptjs: "working",
    });
  } catch (error) {
    console.error("Bcrypt test error:", error);
    return c.json({
      status: "error",
      error: String(error),
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post("/make-server-1304f273/api/auth/register", async (c) => {
  try {
    console.log("=== Registration Request Started ===");
    
    const body = await c.req.json();
    console.log("Request body received:", { ...body, password: "[REDACTED]" });
    
    const { name, email, password, role = "user" } = body;

    // Validation
    if (!name || !email || !password) {
      console.log("Validation failed: Missing required fields");
      return c.json({ message: "Name, email, and password are required" }, 400);
    }

    if (password.length < 6) {
      console.log("Validation failed: Password too short");
      return c.json({ message: "Password must be at least 6 characters" }, 400);
    }

    // Check if user already exists
    console.log("Checking for existing users...");
    const existingUsers = await db.getByPrefix("user:");
    console.log(`Found ${existingUsers.length} existing users`);
    
    const userExists = existingUsers.some((u: any) => u.email === email);

    if (userExists) {
      console.log("Validation failed: Email already registered");
      return c.json({ message: "Email already registered" }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = `user:${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.set(userId, newUser);

    // Generate JWT token
    const token = generateToken({
      id: userId,
      email,
      role: newUser.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return c.json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    }, 201);
  } catch (error) {
    console.error("❌ Registration error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return c.json({ 
      message: "Server error during registration", 
      error: String(error),
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Login user
app.post("/make-server-1304f273/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return c.json({ message: "Email and password are required" }, 400);
    }

    // Find user by email
    const allUsers = await db.getByPrefix("user:");
    const user = allUsers.find((u: any) => u.email === email);

    if (!user) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ message: "Server error during login", error: String(error) }, 500);
  }
});

// ============================================
// USER ROUTES
// ============================================

// Get all users (Admin only)
app.get("/make-server-1304f273/api/users", authMiddleware, roleMiddleware(["admin"]), async (c) => {
  try {
    const allUsers = await db.getByPrefix("user:");
    
    // Remove passwords from response
    const usersWithoutPasswords = allUsers.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Sort by creation date (newest first)
    usersWithoutPasswords.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({
      data: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ message: "Error fetching users", error: String(error) }, 500);
  }
});

// Get user by ID
app.get("/make-server-1304f273/api/users/:id", authMiddleware, async (c) => {
  try {
    const userId = c.req.param("id");
    const currentUser = c.get("user");

    // Users can only view their own profile unless they're admin
    if (currentUser.id !== userId && currentUser.role !== "admin") {
      return c.json({ message: "Access denied" }, 403);
    }

    const user = await db.get(userId);

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const { password, ...userWithoutPassword } = user;
    return c.json({ data: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ message: "Error fetching user", error: String(error) }, 500);
  }
});

// Create user (Admin only)
app.post("/make-server-1304f273/api/users", authMiddleware, roleMiddleware(["admin"]), async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, role = "user" } = body;

    if (!name || !email || !password) {
      return c.json({ message: "Name, email, and password are required" }, 400);
    }

    // Check if user already exists
    const existingUsers = await db.getByPrefix("user:");
    const userExists = existingUsers.some((u: any) => u.email === email);

    if (userExists) {
      return c.json({ message: "Email already registered" }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const userId = `user:${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.set(userId, newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return c.json({
      message: "User created successfully",
      data: userWithoutPassword,
    }, 201);
  } catch (error) {
    console.error("Create user error:", error);
    return c.json({ message: "Error creating user", error: String(error) }, 500);
  }
});

// Update user
app.put("/make-server-1304f273/api/users/:id", authMiddleware, async (c) => {
  try {
    const userId = c.req.param("id");
    const currentUser = c.get("user");
    const body = await c.req.json();

    // Users can only update their own profile unless they're admin
    if (currentUser.id !== userId && currentUser.role !== "admin") {
      return c.json({ message: "Access denied" }, 403);
    }

    const user = await db.get(userId);

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    // Update allowed fields
    const updatedUser = {
      ...user,
      name: body.name || user.name,
      email: body.email || user.email,
      role: currentUser.role === "admin" ? (body.role || user.role) : user.role, // Only admin can change role
      updatedAt: new Date().toISOString(),
    };

    // If password is being updated
    if (body.password) {
      updatedUser.password = await hashPassword(body.password);
    }

    await db.set(userId, updatedUser);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return c.json({
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ message: "Error updating user", error: String(error) }, 500);
  }
});

// Delete user (Admin only)
app.delete("/make-server-1304f273/api/users/:id", authMiddleware, roleMiddleware(["admin"]), async (c) => {
  try {
    const userId = c.req.param("id");

    const user = await db.get(userId);

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    await db.del(userId);

    return c.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ message: "Error deleting user", error: String(error) }, 500);
  }
});

// Error handling middleware
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({
    message: err.message || "Internal server error",
  }, 500);
});

Deno.serve(app.fetch);