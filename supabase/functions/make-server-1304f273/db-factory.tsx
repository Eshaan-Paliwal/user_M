import { DatabaseAdapter } from "./database.tsx";
import { MongoDBAdapter } from "./mongodb.tsx";
import { SupabaseAdapter } from "./supabase-adapter.tsx";

let dbInstance: DatabaseAdapter | null = null;
let initializationError: Error | null = null;

export function initializeDatabase(): DatabaseAdapter {
  if (dbInstance) {
    return dbInstance;
  }

  if (initializationError) {
    console.error("⚠️ Previous database initialization failed, retrying...");
    initializationError = null;
  }

  try {
    const mongoUrl = Deno.env.get("MONGODB_URL");

    if (mongoUrl && mongoUrl.trim() !== "") {
      console.log("🔄 Initializing MongoDB backend");
      console.log("🔗 MongoDB URL present:", mongoUrl.substring(0, 20) + "...");
      
      // Extract database name from URL if present
      const dbNameMatch = mongoUrl.match(/\.net\/([^?]+)/);
      const dbName = dbNameMatch ? dbNameMatch[1] : "myDB";
      
      console.log("📦 Target database:", dbName);
      dbInstance = new MongoDBAdapter(mongoUrl, dbName);
      console.log("✅ MongoDB adapter initialized");
    } else {
      console.log("🔄 Initializing Supabase KV backend");
      dbInstance = new SupabaseAdapter();
      console.log("✅ Supabase adapter initialized");
    }

    return dbInstance;
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    initializationError = error as Error;
    
    // Fallback to Supabase if MongoDB fails
    console.log("⚠️ Falling back to Supabase KV store");
    dbInstance = new SupabaseAdapter();
    return dbInstance;
  }
}

export function getDatabase(): DatabaseAdapter {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}
