// Database interface that both Supabase KV and MongoDB will implement
export interface DatabaseAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  del(key: string): Promise<void>;
  getByPrefix(prefix: string): Promise<any[]>;
  mget(keys: string[]): Promise<any[]>;
  mset(entries: [string, any][]): Promise<void>;
  mdel(keys: string[]): Promise<void>;
}
