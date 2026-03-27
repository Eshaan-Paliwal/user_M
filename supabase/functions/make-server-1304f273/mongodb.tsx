import { DatabaseAdapter } from "./database.tsx";

// MongoDB adapter using the MongoDB Driver for Deno
export class MongoDBAdapter implements DatabaseAdapter {
  private client: any;
  private db: any;
  private collection: any;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(private mongoUrl: string, private dbName: string = "myDB") {
    // Don't connect in constructor, wait for first operation
    console.log("📦 MongoDB adapter created, will connect on first operation");
  }

  private async connect() {
    // If already connected, return immediately
    if (this.isConnected) {
      return;
    }

    // If connection is in progress, wait for it
    if (this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    // Start new connection
    this.connectionPromise = this._doConnect();
    await this.connectionPromise;
  }

  private async _doConnect() {
    try {
      console.log("🔌 Attempting to connect to MongoDB...");
      
      // Import MongoDB client
      const { MongoClient } = await import("npm:mongodb@6.3.0");
      
      this.client = new MongoClient(this.mongoUrl, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      
      await this.client.connect();
      
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection("kv_store");
      
      // Create index on key field for faster lookups
      try {
        await this.collection.createIndex({ key: 1 }, { unique: true });
      } catch (_indexError) {
        // Index might already exist
      }
      
      this.isConnected = true;
      this.connectionPromise = null;
      console.log("✅ MongoDB connected successfully");
    } catch (error: any) {
      console.error("❌ MongoDB connection error:", error);
      this.connectionPromise = null;
      this.isConnected = false;
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  }

  async get(key: string): Promise<any> {
    try {
      await this.connect();
      const doc = await this.collection.findOne({ key });
      return (doc && doc.value !== undefined) ? doc.value : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await this.connect();
      await this.collection.updateOne(
        { key },
        { $set: { key, value, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.connect();
      await this.collection.deleteOne({ key });
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async getByPrefix(prefix: string): Promise<any[]> {
    try {
      await this.connect();
      const docs = await this.collection
        .find({ key: { $regex: `^${this.escapeRegex(prefix)}` } })
        .toArray();
      
      return docs
        .map((doc: any) => doc.value)
        .filter((val: any) => val !== undefined && val !== null);
    } catch (error) {
      console.error(`Error getting by prefix ${prefix}:`, error);
      throw error;
    }
  }

  async mget(keys: string[]): Promise<any[]> {
    try {
      await this.connect();
      const docs = await this.collection
        .find({ key: { $in: keys } })
        .toArray();
      
      return docs
        .map((doc: any) => doc.value)
        .filter((val: any) => val !== undefined && val !== null);
    } catch (error) {
      console.error(`Error getting multiple keys:`, error);
      throw error;
    }
  }

  async mset(entries: [string, any][]): Promise<void> {
    try {
      await this.connect();
      const operations = entries.map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: { $set: { key, value, updatedAt: new Date() } },
          upsert: true,
        },
      }));
      
      if (operations.length > 0) {
        await this.collection.bulkWrite(operations);
      }
    } catch (error) {
      console.error(`Error setting multiple keys:`, error);
      throw error;
    }
  }

  async mdel(keys: string[]): Promise<void> {
    try {
      await this.connect();
      await this.collection.deleteMany({ key: { $in: keys } });
    } catch (error) {
      console.error(`Error deleting multiple keys:`, error);
      throw error;
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("MongoDB connection closed");
    }
  }
}
