🚀 User Management System – REST API Documentation
📌 Overview

The User Management System is a RESTful API designed to manage user data efficiently and securely. It supports full CRUD operations, authentication, and role-based authorization using modern backend practices.

⚙️ Tech Stack
Backend: Node.js, Express.js
Database: MongoDB
ODM: Mongoose
Authentication: Basic Auth + JWT
Validation: express-validator
Testing: Postman
✨ Features
🔐 User Authentication (JWT-based)
👤 User Registration & Login
🔁 Full CRUD Operations
🛡️ Role-Based Access Control (Admin/User)
🔑 Password Hashing (bcrypt)
📄 Pagination & Filtering
⚠️ Error Handling Middleware
✅ Input Validation
📁 Project Structure
project/
│── models/
│── controllers/
│── routes/
│── middleware/
│── config/
│── utils/
│── app.js
│── server.js
🧩 Database Schema (User Model)
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
🔐 Authentication
JWT Token Generation
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
Auth Middleware
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
🛡️ Role-Based Access Control (RBAC)
module.exports = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
📡 API Endpoints
🔑 Authentication Routes
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
👤 User Routes
Method	Endpoint	Access
GET	/api/users	Admin
GET	/api/users/:id	Admin/User
PUT	/api/users/:id	Owner/Admin
DELETE	/api/users/:id	Admin
📥 Sample Requests
Register User
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Login Response
{
  "token": "your_jwt_token_here"
}
📄 Pagination Example
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(parseInt(limit));
✅ Validation Example
const { body } = require('express-validator');

exports.validateUser = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];
⚠️ Error Handling
module.exports = (err, req, res, next) => {
  res.status(500).json({
    message: err.message || 'Server Error'
  });
};
🧪 Testing with Postman
Open Postman
Select request type (GET/POST/PUT/DELETE)
Enter URL: http://localhost:5000/api/users

Add Header:

Authorization: Bearer <token>
Send request
🔒 Security Best Practices
Use bcrypt for password hashing
Store secrets in .env
Enable HTTPS in production
Validate and sanitize inputs
Implement rate limiting
🚀 Future Enhancements
Email Verification
Password Reset System
OAuth (Google/GitHub Login)
Logging (Winston, Morgan)
Swagger API Documentation