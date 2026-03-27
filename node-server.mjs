import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';

// Polyfill Deno.env for the imported code
globalThis.Deno = {
  env: {
    get: (key) => {
      const vars = {
        MONGODB_URL: "mongodb+srv://EXTRA:EXTRA@cluster0.b36xunv.mongodb.net/myDB",
        SUPABASE_URL: "https://xgiakaagltvidtvwzopr.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaWFrYWFnbHR2aWR0dnd6b3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDg0MzgsImV4cCI6MjA4OTgyNDQzOH0.AUwQ5NUKugGfIJcntGp6FUIg6armiXYFjZGkpYOReZA",
        JWT_SECRET: "your-secret-key-change-in-production-2024"
      };
      return vars[key];
    }
  },
  serve: (handler) => {
    // This is a dummy for when it's imported in Deno
  }
};

// Polyfill "npm:..." imports - we need to handle this manually since Node doesn't support them
// But wait, the imported files use "npm:..." which will fail in Node.
// So I'll just RE-IMPLEMENT the core logic here for Node.

const app = new Hono();

// CORS and Logger
app.use('*', logger());
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

const JWT_SECRET = "your-secret-key-change-in-production-2024";
app.onError((err, c) => {
  console.error("Hono Error:", err);
  return c.json({ message: "Internal Server Error", error: err.message, stack: err.stack }, 500);
});

// Auth Middleware
const verifyToken = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: "Unauthorized: No token provided" }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ message: "Unauthorized: Invalid token" }, 401);
  }
};

const isAdmin = async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ message: "Forbidden: Admin access required" }, 403);
  }
  await next();
};

// Mock Database Adapter
class NodeMongoDBAdapter {
  constructor() {
    this.client = new MongoClient("mongodb+srv://EXTRA:EXTRA@cluster0.b36xunv.mongodb.net/myDB");
    this.db = null;
    this.collection = null;
  }
  async connect() {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db("myDB");
      this.collection = this.db.collection("kv_store");
    }
  }
  async get(key) { await this.connect(); const doc = await this.collection.findOne({ key }); return doc?.value; }
  async set(key, value) { await this.connect(); await this.collection.updateOne({ key }, { $set: { key, value, updatedAt: new Date() } }, { upsert: true }); }
  async del(key) { await this.connect(); await this.collection.deleteOne({ key }); }
  async getByPrefix(prefix) { 
    await this.connect(); 
    const docs = await this.collection.find({ key: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } }).toArray();
    return docs.map(d => d.value).filter(v => v != null);
  }
}

const db = new NodeMongoDBAdapter();

// Health check
app.get('/make-server-1304f273/health', (c) => c.json({ status: "ok", database: "mongodb (node)", timestamp: new Date().toISOString() }));

// Register and Login - Simplified for Node testing
app.post('/make-server-1304f273/api/auth/register', async (c) => {
  const body = await c.req.json();
  const { name, email, password, role = "user" } = body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `user:${Date.now()}`;
  const newUser = { id: userId, name, email, password: hashedPassword, role, createdAt: new Date().toISOString() };
  await db.set(userId, newUser);
  const token = jwt.sign({ id: userId, email, role }, "your-secret-key-change-in-production-2024");
  return c.json({ message: "User registered", token, user: { id: userId, name, email, role } }, 201);
});

app.post('/make-server-1304f273/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  const users = await db.getByPrefix("user:");
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) return c.json({ message: "Invalid credentials" }, 401);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, "your-secret-key-change-in-production-2024");
  return c.json({ message: "Login successful", token, user: { id: user.id, email: user.email, role: user.role } });
});

app.get('/make-server-1304f273/api/users', verifyToken, isAdmin, async (c) => {
  const users = await db.getByPrefix("user:");
  return c.json({ data: users.map(({password, ...u}) => u), total: users.length });
});

app.get('/make-server-1304f273/api/users/:id', verifyToken, async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');
  
  // Allow users to see their own profile, or admins to see anyone
  if (currentUser.role !== 'admin' && currentUser.id !== id && !id.startsWith('user:')) {
     // This check needs to be careful because frontend uses both UUIDs and 'user:ID'
  }

  const users = await db.getByPrefix("user:");
  const user = users.find(u => u.id === id);
  
  if (!user) return c.json({ message: "User not found" }, 404);
  if (currentUser.role !== 'admin' && currentUser.id !== user.id) {
    return c.json({ message: "Forbidden: Access denied" }, 403);
  }
  
  const { password, ...safeUser } = user;
  return c.json({ data: safeUser });
});

app.post('/make-server-1304f273/api/users', verifyToken, isAdmin, async (c) => {
  const { name, email, password, role = "user" } = await c.req.json();
  const users = await db.getByPrefix("user:");
  if (users.some(u => u.email === email)) return c.json({ message: "User already exists" }, 400);
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `user:${Date.now()}`;
  const newUser = { id: userId, name, email, password: hashedPassword, role, createdAt: new Date().toISOString() };
  await db.set(userId, newUser);
  return c.json({ message: "User created", user: { id: userId, name, email, role } }, 201);
});

app.put('/make-server-1304f273/api/users/:id', verifyToken, async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');
  const body = await c.req.json();
  
  const users = await db.getByPrefix("user:");
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return c.json({ message: "User not found" }, 404);
  
  // Allow users to update their own profile, or admins to update anyone
  if (currentUser.role !== 'admin' && currentUser.id !== id) {
    return c.json({ message: "Forbidden: Access denied" }, 403);
  }
  
  // Only admins can change roles
  if (body.role && currentUser.role !== 'admin') {
    delete body.role;
  }

  const updatedUser = { ...users[userIndex], ...body, updatedAt: new Date().toISOString() };
  if (body.password) {
    updatedUser.password = await bcrypt.hash(body.password, 10);
  }
  
  await db.set(id, updatedUser);
  return c.json({ message: "User updated", user: { id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role } });
});

app.delete('/make-server-1304f273/api/users/:id', verifyToken, isAdmin, async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');
  
  if (currentUser.id === id) return c.json({ message: "You cannot delete yourself" }, 400);
  
  await db.del(id);
  return c.json({ message: "User deleted" });
});

console.log("🚀 Node Backend running at http://localhost:3000");
serve({ fetch: app.fetch, port: 3000 });
