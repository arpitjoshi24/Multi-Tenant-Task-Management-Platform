# TaskFlow - Multi-Tenant Task Management Platform

TaskFlow is a modern, multi-tenant task management platform built with React, Node.js, and MongoDB. It enables organizations to manage tasks, team members, and track progress efficiently.

## Features

- 🔐 Multi-tenant architecture with organization-based isolation
- 👥 Team management with role-based access control (Admin, Manager, Member)
- 📋 Task management with categories, priorities, and status tracking
- 📊 Analytics dashboard with task statistics and team performance metrics
- 📅 Calendar view for task scheduling and deadline tracking
- 🔔 Real-time notifications for task updates and deadlines
- 🎨 Modern, responsive UI built with Tailwind CSS

## Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - React Router v6
  - React Hook Form
  - Chart.js
  - Lucide React Icons

- **Backend:**
  - Node.js
  - Express
  - MongoDB with Mongoose
  - JWT Authentication
  - Node-cron for scheduled tasks

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB
- Docker and Docker Compose (for containerized deployment)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. Start the development server:
   ```bash
   # Start both frontend and backend in development mode
   npm run dev:all
   
   # Or start them separately
   npm run dev        # Frontend only
   node server/index.js     # Backend only
   ```

### Docker Deployment

1. Build and run the containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
taskflow/
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── contexts/        # React contexts
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── types/           # TypeScript types
├── server/              # Backend source code
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   └── services/        # Business logic
└── docker/              # Docker configuration
```

