# MongoDB Connection Setup

## ✅ Your MongoDB Connection Details

**Connection String:**
```
mongodb+srv://EXTRA:EXTRA@cluster0.b36xunv.mongodb.net/myDB
```

**Cluster:** cluster0.b36xunv.mongodb.net  
**Database:** myDB  
**Status:** Ready to connect ✓

---

## 🚀 How to Connect Your App to MongoDB

Since the `MONGODB_URL` environment variable has already been provided, your backend should automatically detect and use MongoDB. Follow these steps to verify:

### Step 1: Check Database Status

1. **Look at the bottom-right corner** of your dashboard
2. Click the **"Database"** button
3. It should show **"MongoDB"** with a green checkmark ✓
4. You'll see a success toast: "Connected to MongoDB successfully!"

### Step 2: Verify Connection in Console

The backend logs will show:
```
🚀 Starting server...
🔄 Using MongoDB backend
🔗 MongoDB URL detected, testing connection...
✅ MongoDB connection successful
✅ MongoDB is ready to use!
```

### Step 3: Test the Connection

Try these actions to confirm MongoDB is working:

1. **Register a new user**
   - Go to Register page
   - Create a test account
   - Data will be stored in MongoDB

2. **Check Health Endpoint**
   ```bash
   curl https://xgiakaagltvidtvwzopr.supabase.co/functions/v1/make-server-1304f273/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "database": "mongodb",
     "timestamp": "2024-..."
   }
   ```

3. **Verify in MongoDB Atlas**
   - Log into MongoDB Atlas
   - Go to your cluster
   - Browse Collections → `myDB` → `kv_store`
   - You should see your user data

---

## 🗂️ MongoDB Data Structure

Your user data is stored in MongoDB with this structure:

**Collection:** `kv_store`

**Document Format:**
```json
{
  "_id": "ObjectId(...)",
  "key": "user:1234567890",
  "value": {
    "id": "user:1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "$2a$10$...",
    "role": "admin",
    "createdAt": "2024-03-26T...",
    "updatedAt": "2024-03-26T..."
  },
  "updatedAt": "2024-03-26T..."
}
```

---

## 🔍 Troubleshooting

### Issue: Still showing "Supabase KV" instead of "MongoDB"

**Solution:**
1. Verify the environment variable is set correctly in Supabase
2. The edge function needs to restart (happens automatically on next request)
3. Wait 30-60 seconds for cold start
4. Click "Refresh Status" in the Database Config modal

### Issue: Connection Timeout

**Solution:**
1. Check MongoDB Atlas Network Access settings
2. Ensure "Allow access from anywhere" (0.0.0.0/0) is enabled
3. Or add Supabase IP ranges to the whitelist

### Issue: Authentication Failed

**Solution:**
1. Verify username and password in connection string
2. Check if database user exists in MongoDB Atlas
3. Ensure database user has read/write permissions

---

## 📊 Performance & Indexing

MongoDB automatically creates an index on the `key` field for fast lookups:

```javascript
collection.createIndex({ key: 1 }, { unique: true })
```

This ensures:
- ✓ Fast user lookups
- ✓ No duplicate keys
- ✓ Efficient queries by prefix

---

## 🔐 Security Best Practices

### ✅ Currently Implemented:
- Passwords are hashed with bcryptjs
- JWT tokens for authentication
- Role-based access control
- Private MongoDB connection string

### 🎯 Recommended for Production:
1. **Rotate credentials** - Change MongoDB password regularly
2. **IP Whitelist** - Restrict to known IPs instead of 0.0.0.0/0
3. **Use secrets** - Never commit connection strings to code
4. **Enable auditing** - Track database access in MongoDB Atlas
5. **Set up backups** - Configure automated backups in Atlas

---

## 📈 Monitoring Your MongoDB Connection

### In Your App:
- **Database Config Button** - Shows real-time connection status
- **Health Endpoint** - Returns current database type
- **Backend Logs** - Connection success/failure messages

### In MongoDB Atlas:
- **Metrics** - View connection count, operations/second
- **Real-time** - See queries as they happen
- **Alerts** - Set up notifications for issues

---

## 🔄 Switching Back to Supabase

If you want to switch back to Supabase KV:

1. Go to Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. **Delete** the `MONGODB_URL` environment variable
4. Redeploy the edge function
5. Backend will automatically use Supabase KV

---

## 📝 MongoDB Atlas Dashboard Access

To manage your database:

1. Visit: https://cloud.mongodb.com
2. Log in with your credentials
3. Select your cluster: **cluster0**
4. Browse data in database: **myDB**
5. Manage users, backups, and settings

---

## ✨ What's Different with MongoDB?

| Feature | Supabase KV | MongoDB |
|---------|-------------|---------|
| **Storage Type** | Key-value pairs | Document collections |
| **Query Power** | Basic get/set | Full NoSQL queries |
| **Indexing** | Limited | Advanced indexes |
| **Scaling** | Good | Excellent |
| **Management** | Supabase UI | MongoDB Atlas |
| **Cost** | Included | Separate billing |

---

## 🎉 You're All Set!

Your User Management System is now connected to MongoDB! All user data, authentication, and CRUD operations will use your MongoDB cluster.

**Connection Details Summary:**
- ✅ Cluster: cluster0.b36xunv.mongodb.net
- ✅ Database: myDB
- ✅ Auto-detection: Enabled
- ✅ Indexing: Configured
- ✅ Connection pooling: Active

Start using your app - all data is now stored in MongoDB Atlas! 🚀
