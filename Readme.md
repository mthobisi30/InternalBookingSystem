# Resource Booking System

## Overview

This is a full-stack resource booking application built with a React frontend and Express.js backend. The system allows users to manage resources (like conference rooms, equipment, etc.) and create bookings for those resources. It features a modern UI built with shadcn/ui components and uses PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack JavaScript Application
- **Frontend**: React 18 with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Monorepo Structure
The application uses a monorepo structure with shared code:
- `client/` - React frontend application
- `server/` - Express.js backend
- `shared/` - Shared TypeScript schemas and types

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui components for consistent UI
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for API state management
- **Form Handling**: React Hook Form with Zod schema validation
- **Navigation**: Wouter for lightweight client-side routing
- **Toast Notifications**: Built-in toast system for user feedback

### Backend Architecture
- **API Framework**: Express.js with TypeScript
- **Database Access**: Drizzle ORM with connection pooling
- **Validation**: Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error handling middleware
- **Logging**: Request/response logging with performance metrics

### Database Schema
- **Resources Table**: Stores resource information (name, description, location, capacity, availability)
- **Bookings Table**: Stores booking information with foreign key to resources
- **Users Table**: Basic user information (currently minimal implementation)
- **Relations**: Proper foreign key relationships between bookings and resources

## Data Flow

### Resource Management
1. Users can view all resources on the Resources page
2. Resources can be created via modal forms with validation
3. Each resource has properties like name, location, capacity, and availability status
4. Resources support filtering by type and status

### Booking Management
1. Users can create bookings for available resources
2. Booking conflicts are checked on the backend
3. Bookings include start/end times, purpose, and booking contact
4. Dashboard shows current and upcoming bookings
5. Bookings can be filtered and searched

### Real-time Updates
- TanStack Query handles automatic cache invalidation
- Optimistic updates for better user experience
- Toast notifications for operation feedback

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Connection Pooling**: Uses Neon's serverless connection pooling
- **Migrations**: Drizzle Kit for database schema management

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework
- **Class Variance Authority**: Component variant handling

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production

## Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (e.g., Neon)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your database connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   ```
4. Push the database schema:
   ```bash
   npm run db:push
   ```

### Running Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5000`.

## Deployment

### Vercel Deployment
This application is configured for Vercel deployment.

1. Install Vercel CLI or connect your GitHub repository to Vercel.
2. In your Vercel project settings, go to **Settings > Environment Variables**.
3. Add the `DATABASE_URL` environment variable with your production database connection string.
4. Deploy the application:
   ```bash
   vercel --prod
   ```


### Development
- Uses Vite dev server for frontend with HMR (Hot Module Replacement)
- Express server runs in development mode with file watching
- Shared TypeScript compilation across frontend and backend

### Production Build
- Frontend builds to static files using Vite
- Backend bundles with ESBuild for Node.js deployment
- Static files served by Express in production
- Environment variable configuration for database connections

### Database Management
- Drizzle migrations for schema changes
- Environment-based configuration
- Connection string management through environment variables

### Key Architectural Decisions

1. **Monorepo with Shared Schema**: Chosen to ensure type safety between frontend and backend while maintaining code reuse for validation schemas.

2. **Drizzle ORM**: Selected for its TypeScript-first approach and better type inference compared to alternatives like Prisma.

3. **TanStack Query**: Implemented for robust server state management, caching, and optimistic updates rather than basic fetch calls.

4. **shadcn/ui**: Adopted for consistent, accessible components that can be customized while maintaining design system consistency.

5. **Zod Validation**: Used for runtime type checking and form validation, with schemas shared between client and server.

6. **Vite Build Tool**: Chosen for fast development experience and modern JavaScript features support.