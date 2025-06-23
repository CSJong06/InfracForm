# Infraction Form Application

A comprehensive student infraction and interaction management system built with Next.js, MongoDB, and React.

## Features

- **Student Management**: Add, edit, and bulk import students
- **Report Management**: Create and manage infraction/interaction reports
- **User Authentication**: JWT-based authentication with admin/user roles
- **Dashboard**: Overview of recent infractions and statistics
- **Form Editor**: Manage interaction types, infraction types, and intervention types
- **AI Integration**: Playlab AI API integration for processing
- **Real-time Updates**: React Query for efficient data management

## Technology Stack

- **Frontend**: Next.js 15.3.3, React 19, Tailwind CSS
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **Authentication**: JWT with jose library
- **State Management**: TanStack React Query
- **Database**: MongoDB with connection pooling

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Playlab AI API credentials (optional)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/infracform

# Authentication
JWT_SECRET=your-secret-key-here

# AI Integration (optional)
PLAYLAB_API_KEY=your-playlab-api-key
PLAYLAB_PROJECT_ID=your-playlab-project-id
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Initialize database types
   node scripts/init-all-types.js
   
   # Create admin user
   node scripts/create-admin.js
   
   # Import students (optional)
   node scripts/init-students.js
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Models

- **User**: Authentication and user management
- **Student**: Student information and records
- **Report**: Infraction and interaction reports
- **InteractionType**: Types of interactions (shout-outs, check-ins, etc.)
- **InfractionType**: Types of infractions (tardiness, cellphone use, etc.)
- **InterventionType**: Types of interventions (parent contact, meetings, etc.)

### Key Relationships

- Reports are linked to Students via `studentNumber`
- Reports reference InteractionType, InfractionType, and InterventionType
- Users can create and manage reports

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Reports
- `GET /api/reports` - Get all reports (with optional status filter)
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get specific report
- `PATCH /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report
- `GET /api/reports/export` - Export reports

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `POST /api/students/bulk-import` - Bulk import students

### Form Types
- `GET /api/interaction-types` - Get interaction types
- `GET /api/infraction-types` - Get infraction types
- `GET /api/intervention-types` - Get intervention types

## Scripts

### Database Management
- `scripts/init-all-types.js` - Initialize all form types
- `scripts/create-admin.js` - Create admin user
- `scripts/init-students.js` - Import sample students
- `scripts/clear-reports.js` - Clear all reports
- `scripts/clear-students.js` - Clear all students

### Testing
- `scripts/generate-test-reports.js` - Generate test data
- `scripts/test-connection.js` - Test database connection

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

Ensure all environment variables are properly configured in your production environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.
