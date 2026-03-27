import { DatabaseAdapter } from "./database.tsx";
import * as kv from "./kv_store.tsx";

// Supabase KV adapter
export class SupabaseAdapter implements DatabaseAdapter {
  async get(key: string): Promise<any> {
    return await kv.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await kv.set(key, value);
  }

  async del(key: string): Promise<void> {
    await kv.del(key);
  }

  async getByPrefix(prefix: string): Promise<any[]> {
    return await kv.getByPrefix(prefix);
  }

  async mget(keys: string[]): Promise<any[]> {
    return await kv.mget(keys);
  }

  async mset(entries: [string, any][]): Promise<void> {
    await kv.mset(entries);
  }

  async mdel(keys: string[]): Promise<void> {
    await kv.mdel(keys);
  }
}
