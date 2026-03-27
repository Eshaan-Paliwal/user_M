User Management System – REST API Documentation
1. Overview

This project is a RESTful API for managing users. It provides endpoints to Create, Read, Update, and Delete (CRUD) user data. The API is built using Node.js, Express.js, MongoDB, and Mongoose.

2. Tech Stack
Backend: Node.js, Express.js
Database: MongoDB
ODM: Mongoose
Authentication: Basic Authentication
Testing Tool: Postman
3. Project Structure
project/
│── models/
│   └── user.model.js
│── routes/
│   └── user.routes.js
│── controllers/
│   └── user.controller.js
│── middleware/
│   └── auth.middleware.js
│── config/
│   └── db.js
│── app.js
│── server.js
4. Database Schema (Mongoose)
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
5. Authentication Middleware (Basic Auth)
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }


  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');


  if (username === 'admin' && password === 'admin123') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }
};
6. API Endpoints
6.1 Create User
Method: POST
Endpoint: /api/users
Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Response
{
  "message": "User created successfully",
  "data": { ... }
}
6.2 Get All Users
Method: GET
Endpoint: /api/users
Response
{
  "data": [ ... ]
}
6.3 Get User by ID
Method: GET
Endpoint: /api/users/:id
6.4 Update User
Method: PUT
Endpoint: /api/users/:id
Request Body
{
  "name": "Updated Name"
}
6.5 Delete User
Method: DELETE
Endpoint: /api/users/:id
7. Controller Example
const User = require('../models/user.model');


exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: 'User created', data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
8. Database Connection
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
9. Testing with Postman
Steps:
Open Postman
Select request type (GET, POST, PUT, DELETE)
Enter API URL (e.g., http://localhost:5000/api/users)
Add Authorization:
Type: Basic Auth
Username: admin
Password: admin123
Send request and verify response
10. Security Considerations
Always hash passwords using bcrypt before storing
Use HTTPS in production
Replace basic auth with JWT for scalability
11. Future Improvements
Role-Based Access Control (RBAC)
JWT Authentication
Pagination and filtering
Input validation using Joi or express-validator
12. Conclusion

This User Management System API provides a solid foundation for handling user data with secure endpoints and scalable architecture. It can be extended with advanced authentication and authorization mechanisms.