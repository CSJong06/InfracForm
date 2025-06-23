# Infraction Form Application Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Reference](#api-reference)
5. [Authentication](#authentication)
6. [Frontend Components](#frontend-components)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

## Overview

The Infraction Form Application is a comprehensive student behavior management system designed for educational institutions. It allows teachers and administrators to track student interactions, infractions, and interventions in a centralized, searchable database.

### Key Features

- **Multi-User Support**: Role-based access control (Admin/User)
- **Student Management**: Complete student lifecycle management
- **Report Tracking**: Comprehensive infraction and interaction reporting
- **Data Export**: CSV export functionality for reporting
- **Real-time Updates**: React Query for efficient data synchronization
- **AI Integration**: Optional AI-powered processing capabilities

## Architecture

### Technology Stack

```
Frontend:
├── Next.js 15.3.3 (App Router)
├── React 19
├── Tailwind CSS
└── TanStack React Query

Backend:
├── Next.js API Routes
├── MongoDB with Mongoose
├── JWT Authentication
└── Playlab AI Integration

Infrastructure:
├── MongoDB Atlas (recommended)
├── Vercel (deployment)
└── Environment-based configuration
```

### Project Structure

```
infracform/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── dashboard/         # Dashboard pages
│   ├── students/          # Student management
│   ├── reports/           # Report management
│   ├── users/             # User management
│   └── form-editor/       # Form type management
├── lib/                   # Shared utilities
│   ├── models/           # Mongoose models
│   ├── hooks/            # Custom React hooks
│   └── constants/        # Application constants
├── scripts/              # Database scripts
├── public/               # Static assets
└── middleware.js         # Authentication middleware
```

## Database Design

### Entity Relationship Diagram

```
User (1) ──── (N) Report
Student (1) ──── (N) Report
InteractionType (1) ──── (N) Report
InfractionType (1) ──── (N) Report
InterventionType (1) ──── (N) Report
```

### Schema Details

#### User Model
```javascript
{
  email: String (required, unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  isAdmin: Boolean (default: false),
  isActive: Boolean (default: true)
}
```

#### Student Model
```javascript
{
  studentId: String (required, unique, 6 digits),
  firstName: String (required),
  lastName: String (required),
  isActive: Boolean (default: true)
}
```

#### Report Model
```javascript
{
  interactionID: String (required, unique),
  studentNumber: String (required, 6 digits),
  entryTimestamp: Date (default: now),
  submitterEmail: String (required),
  interaction: String (required, references InteractionType),
  interactioncode: String (required),
  infraction: String (enum, required if interaction is 'INFRACTION'),
  intervention: String (enum, default: 'NONE'),
  notes: String,
  interventionNotes: String,
  interactionTimestamp: Date (required),
  editUrl: String,
  status: String (enum: 'RESOLVED', 'UNRESOLVED', default: 'UNRESOLVED')
}
```

## API Reference

### Authentication Endpoints

#### POST /api/auth/login
Authenticate a user and return a JWT token.

**Request Body:**
  ```json
  {
  "email": "user@example.com",
  "password": "password123"
  }
  ```

**Response:**
  ```json
  {
  "success": true,
  "user": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false
  }
}
```

#### POST /api/auth/logout
Logout the current user by clearing the JWT cookie.

#### GET /api/auth/session
Get the current user session information.

### Reports Endpoints

#### GET /api/reports
Get all reports with optional filtering.

**Query Parameters:**
- `status`: Filter by status ('RESOLVED' or 'UNRESOLVED')

**Response:**
  ```json
[
  {
    "interactionID": "12345",
    "studentNumber": "123456",
    "submitterEmail": "teacher@school.com",
    "interaction": "INFRACTION",
    "infraction": "TARDINESS",
    "status": "UNRESOLVED",
    "entryTimestamp": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/reports
Create a new report.

**Request Body:**
  ```json
  {
  "studentNumber": "123456",
  "submitterEmail": "teacher@school.com",
  "interaction": "INFRACTION",
  "interactionTimestamp": "2024-01-15T10:30:00Z",
  "infraction": "TARDINESS",
  "notes": "Student arrived 15 minutes late"
}
```

### Students Endpoints

#### GET /api/students
Get all active students.

#### POST /api/students
Create a new student.

**Request Body:**
  ```json
  {
  "studentId": "123456",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### POST /api/students/bulk-import
Bulk import students from CSV file.

**Request:** Multipart form data with CSV file

### Form Types Endpoints

#### GET /api/interaction-types
Get all active interaction types.

#### GET /api/infraction-types
Get all active infraction types.

#### GET /api/intervention-types
Get all active intervention types.

## Authentication

### JWT Implementation

The application uses JWT tokens stored in HTTP-only cookies for security.

**Token Structure:**
```javascript
{
  "email": "user@example.com",
  "isAdmin": false,
  "iat": 1642234567,
  "exp": 1642320967
}
```

### Middleware Protection

The `middleware.js` file protects all routes except:
- `/` (login page)
- `/api/auth/login`

Admin-only routes:
- `/admin/*`
- `/form-editor/*`

### Role-Based Access Control

- **Admin Users**: Full access to all features including user management and form editing
- **Regular Users**: Can create and view reports, manage students

## Frontend Components

### Core Components

#### ReportFormModal
Large modal component (732 lines) for creating and editing reports.

**Key Features:**
- Dynamic form fields based on interaction type
- Student search and validation
- Real-time form validation
- File upload support

#### DashboardClient
Main dashboard component with statistics and recent activity.

**Features:**
- Recent infractions display
- Infraction history charts
- Quick action buttons
- Real-time data updates

#### Sidebar
Navigation component with role-based menu items.

### Custom Hooks

#### useReports
Manages report data with React Query:
- Automatic caching
- Background updates
- Optimistic updates
- Error handling

#### useStudents
Manages student data with similar caching and update patterns.

## Deployment Guide

### Environment Setup

1. **Database**: Set up MongoDB Atlas cluster
2. **Environment Variables**: Configure all required variables
3. **Domain**: Set up custom domain (optional)

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

**Required:**
```env
MONGODB_URI=
JWT_SECRET=your-super-secret-jwt-key
```

**Optional:**
```env
PLAYLAB_API_KEY=your-playlab-api-key
PLAYLAB_PROJECT_ID=your-playlab-project-id
```

### Database Migration

1. Run initialization scripts:
   ```bash
   node scripts/init-all-types.js
   node scripts/create-admin.js
   ```

2. Import existing data if available

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify `MONGODB_URI` is correct
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your IP

#### Authentication Issues
- Verify `JWT_SECRET` is set
- Check cookie settings in production
- Ensure HTTPS in production

#### Build Errors
- Clear `.next` directory
- Reinstall dependencies
- Check for TypeScript errors

### Performance Optimization

#### Database Indexes
The application automatically creates indexes for:
- `studentNumber` + `interactionTimestamp`
- `status`
- `interactionID` (unique)

#### Caching Strategy
- React Query provides client-side caching
- MongoDB connection pooling
- Static asset optimization via Next.js

### Monitoring

#### Recommended Tools
- Vercel Analytics
- MongoDB Atlas monitoring
- Application error tracking (Sentry)

#### Key Metrics
- API response times
- Database query performance
- User session duration
- Error rates

## Support

For technical support or questions:
1. Check this documentation
2. Review the codebase comments
3. Contact the development team
4. Create an issue in the repository

---

*Last updated: January 2024* 
