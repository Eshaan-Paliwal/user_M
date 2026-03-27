# 🚀 Quick Start Guide

## Get Started in 3 Easy Steps!

### Step 1: Wait for Backend (30-60 seconds)
The backend needs to cold-start on first load. You'll see:
- 🟡 "Backend Starting..." banner at top
- 🟢 "Backend Online" when ready

### Step 2: Login with Default Admin
```
Email:    admin@example.com
Password: admin123
```

### Step 3: Start Managing Users!
You're now on the dashboard where you can:
- ✅ View all users
- ✅ Add new users
- ✅ Edit user details
- ✅ Delete users
- ✅ Search and filter

---

## 🧪 Test Everything (Optional)

Click **"System Test"** button (bottom-left) to run diagnostics:
1. Health Check
2. Password Hashing Test
3. Database Operations
4. User Registration
5. Admin Login

All tests should pass ✅

---

## 📱 Features Available

### Dashboard
- User statistics (total, admin, regular users)
- Search users by name or email
- Filter by role (admin/user)
- Pagination (5 users per page)

### User Management
- **Add User:** Click "Add User" button
- **Edit User:** Click pencil icon
- **Delete User:** Click trash icon
- **View Profile:** Click "Profile" button

### Database
- Click "Database" button (bottom-right)
- See if you're using MongoDB or Supabase
- Check connection status

---

## 📋 Common Tasks

### Create a New User
1. Click "Add User" button
2. Fill in:
   - Name
   - Email
   - Password
   - Role (user or admin)
3. Click "Create User"

### Edit a User
1. Click pencil icon next to user
2. Update any field
3. Click "Update User"

### Delete a User
1. Click trash icon next to user
2. Confirm deletion
3. User removed from system

### Create Your Own Account
1. Logout
2. Click "Sign up"
3. Fill registration form
4. Auto-login after creation

---

## 🔧 Troubleshooting

### Can't Login?
- Use default admin: `admin@example.com` / `admin123`
- Wait for green "Backend Online" banner
- Check browser console for errors

### Backend Not Starting?
- Wait full 60 seconds
- Refresh the page
- Check System Test for diagnostics

### Users Not Showing?
- Click "Refresh" button
- Check you're logged in as admin
- Run System Test to verify database

---

## 💡 Pro Tips

1. **Run System Tests** regularly to check health
2. **Use Search** to find users quickly
3. **Check Database Status** if something seems wrong
4. **Create admin users** for other team members
5. **Logout/Login** if you see auth errors

---

## 🎯 MongoDB Setup (Optional)

Your MongoDB is already configured:
- **URL:** `mongodb+srv://EXTRA:EXTRA@cluster0.b36xunv.mongodb.net/myDB`
- **Database:** myDB
- **Status:** Auto-detected

The system automatically uses MongoDB if the URL is set, otherwise uses Supabase KV.

---

## 📖 More Information

- **Full Testing Report:** See `/TESTING_COMPLETE.md`
- **MongoDB Guide:** See `/MONGODB_SETUP.md`
- **Troubleshooting:** See `/TROUBLESHOOTING.md`

---

## ✅ You're All Set!

Your User Management System is fully functional with:
- ✅ Secure authentication
- ✅ User CRUD operations
- ✅ Role-based access control
- ✅ MongoDB integration
- ✅ Comprehensive testing tools

**Happy managing! 🎉**
