# User Management System - Backend Configuration

## Overview

This User Management System supports **two database backends**:
1. **Supabase KV Store** (default, no configuration needed)
2. **MongoDB** (requires configuration)

The system automatically detects which database to use based on environment variables.

---

## 🔄 Database Auto-Detection

The backend uses this logic:
- **If `MONGODB_URL` environment variable is set** → Uses MongoDB
- **If `MONGODB_URL` is not set** → Uses Supabase KV Store (default)

---

## 📦 Using Supabase (Default)

**No configuration needed!** The system works out of the box with Supabase's built-in key-value store.

### Features:
- ✅ Zero configuration
- ✅ Built-in to Supabase
- ✅ Perfect for prototyping
- ✅ Automatic persistence

---

## 🍃 Switching to MongoDB

To use MongoDB instead of Supabase, follow these steps:

### Step 1: Get Your MongoDB Connection String

You'll need a MongoDB connection string in this format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

**Options to get MongoDB:**
- **MongoDB Atlas** (Recommended - Free tier available): https://www.mongodb.com/cloud/atlas
- **Local MongoDB**: `mongodb://localhost:27017/user_management`
- **Other MongoDB hosting services**

### Step 2: Set Environment Variable in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Click on **Secrets** or **Environment Variables**
4. Add a new secret:
   - **Name**: `MONGODB_URL`
   - **Value**: Your MongoDB connection string
5. Save the changes

### Step 3: Verify the Change

The system will automatically switch to MongoDB on the next request. To verify:
1. Open your application
2. Look at the **Database Configuration** button (bottom-right corner)
3. Click it to see the current database
4. The health check endpoint will also show the active database

---

## 🔍 Checking Active Database

### Via UI:
Click the **Database** button in the bottom-right corner of the dashboard to see which database is active.

### Via API:
Call the health check endpoint:
```bash
curl https://your-project.supabase.co/functions/v1/make-server-1304f273/health
```

Response:
```json
{
  "status": "ok",
  "database": "mongodb",  // or "supabase"
  "timestamp": "2024-03-26T..."
}
```

---

## 📊 Database Comparison

| Feature | Supabase KV | MongoDB |
|---------|-------------|---------|
| **Setup** | Zero config | Requires URL |
| **Best For** | Prototyping | Production |
| **Querying** | Key-value | Full NoSQL |
| **Scalability** | Good | Excellent |
| **Indexing** | Basic | Advanced |
| **Cost** | Included | Separate |

---

## 🛠️ Backend Architecture

### Database Abstraction Layer

The backend uses a **Database Adapter Pattern** that allows seamless switching:

```typescript
interface DatabaseAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  del(key: string): Promise<void>;
  getByPrefix(prefix: string): Promise<any[]>;
  // ... more methods
}
```

Both databases implement this interface, ensuring identical functionality.

### Files:
- `/supabase/functions/server/database.tsx` - Interface definition
- `/supabase/functions/server/supabase-adapter.tsx` - Supabase implementation
- `/supabase/functions/server/mongodb.tsx` - MongoDB implementation
- `/supabase/functions/server/db-factory.tsx` - Auto-detection logic

---

## 🔐 MongoDB Connection String Format

### Standard Format:
```
mongodb://[username:password@]host[:port][/database]
```

### MongoDB Atlas (Cloud):
```
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### Local Development:
```
mongodb://localhost:27017/user_management
```

### With Authentication:
```
mongodb://admin:secretPassword@mongodb.example.com:27017/mydb
```

---

## 🚀 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URL` | No | MongoDB connection string. If not set, uses Supabase | `mongodb+srv://...` |
| `JWT_SECRET` | Optional | Secret for JWT tokens | `your-secret-key` |

---

## 🐛 Troubleshooting

### "Failed to fetch" Error
**Cause**: Backend is cold-starting (first request after deployment)
**Solution**: Wait 30-60 seconds and try again

### MongoDB Connection Error
**Cause**: Invalid MongoDB URL or network issues
**Solution**: 
1. Verify your MongoDB URL is correct
2. Check MongoDB cluster is accessible
3. Ensure IP whitelist includes Supabase edge functions

### Still Using Supabase After Setting MongoDB URL
**Cause**: Environment variable not applied or edge function not redeployed
**Solution**:
1. Verify the environment variable is saved in Supabase
2. Redeploy the edge function
3. Check the `/health` endpoint to confirm

---

## 📝 Data Migration

If you want to migrate data from Supabase to MongoDB (or vice versa):

1. **Export from current database**
   - Use the API to fetch all users
   
2. **Switch database**
   - Set/unset `MONGODB_URL` environment variable
   
3. **Import to new database**
   - Use the API to create users in the new database

*Note: Automatic migration tools are not included but can be built using the API endpoints.*

---

## ✅ Production Checklist

Before going to production:

- [ ] Set a strong `JWT_SECRET` environment variable
- [ ] Choose your database (Supabase or MongoDB)
- [ ] If using MongoDB:
  - [ ] Set up MongoDB Atlas with proper security
  - [ ] Configure IP whitelist
  - [ ] Set `MONGODB_URL` environment variable
- [ ] Test all CRUD operations
- [ ] Verify authentication flow
- [ ] Enable HTTPS (automatic with Supabase)
- [ ] Set up monitoring and logging

---

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify the `/health` endpoint shows correct database
3. Review Supabase edge function logs
4. Check MongoDB logs (if using MongoDB)

---

## 🎯 Quick Start

**To use Supabase (Default):**
1. Nothing to do! It works automatically.

**To use MongoDB:**
1. Get MongoDB connection string from MongoDB Atlas
2. Add `MONGODB_URL` to Supabase environment variables
3. Redeploy edge function
4. Done!
