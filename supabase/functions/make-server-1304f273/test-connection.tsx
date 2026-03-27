import { initializeDatabase, getDatabase } from "./db-factory.tsx";

// Test MongoDB connection
async function testMongoDBConnection() {
  try {
    console.log("🔍 Testing MongoDB connection...");
    
    const db = initializeDatabase();
    
    // Try a simple operation
    await db.set("connection_test", {
      timestamp: new Date().toISOString(),
      message: "MongoDB connection successful"
    });
    
    const result = await db.get("connection_test");
    console.log("✅ MongoDB connection test passed:", result);
    
    // Clean up test data
    await db.del("connection_test");
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error);
    return false;
  }
}

export { testMongoDBConnection };
