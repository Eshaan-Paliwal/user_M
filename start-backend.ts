Deno.env.set("MONGODB_URL", "mongodb+srv://EXTRA:EXTRA@cluster0.b36xunv.mongodb.net/myDB");
Deno.env.set("SUPABASE_URL", "https://xgiakaagltvidtvwzopr.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaWFrYWFnbHR2aWR0dnd6b3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDg0MzgsImV4cCI6MjA4OTgyNDQzOH0.AUwQ5NUKugGfIJcntGp6FUIg6armiXYFjZGkpYOReZA");
Deno.env.set("JWT_SECRET", "your-secret-key-change-in-production-2024");

console.log("🚀 Starting backend wrapper...");
import "./supabase/functions/make-server-1304f273/index.tsx";
