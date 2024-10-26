This project is a comprehensive Node.js API for managing user stories, featuring user registration, authentication, profile management, and more.

Features
User Registration & Verification
User Authentication with JWT
Profile Management
Password Reset Functionality
Email Notifications

Getting Started
Prerequisites
Node.js (v14 or higher)
MongoDB (running instance)
Git

Installation
npm install

Set up environment variables:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

Start project
npm start

API Endpoints
POST /api/users/register - Register a new user
POST /api/users/login - Log in a user
GET /api/users/profile - Get user profile (requires authentication)
PUT /api/users/profile - Update user profile (requires authentication)
DELETE /api/users/profile - Delete user account (requires authentication)
POST /api/users/forget-password - Request a password reset
POST /api/users/reset-password - Reset user password
GET /api/users/verify-email - Verify user email

Testing
You can use tools like Postman or Insomnia to test the API endpoints.

