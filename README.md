# ticktock - Timesheet Management Application

A modern, responsive timesheet management web application built with Next.js 15, TypeScript, and TailwindCSS. This application allows users to track and manage their work hours efficiently.

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-change-in-production
   ```
   
   **Important**: If you're accessing the app from a different URL (e.g., network IP like `http://10.89.167.149:3000`), update `NEXTAUTH_URL` to match:
   ```env
   NEXTAUTH_URL=http://10.89.167.149:3000
   ```
   
   Or use a relative URL approach by setting:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```
   and ensure `trustHost: true` is set in the auth config (already configured).

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   
   **Note**: The default dev script uses Webpack instead of Turbopack to avoid compatibility issues with next-auth v5 beta. If you want to use Turbopack, use `npm run dev:turbo` instead.

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Login Credentials

The application uses dummy authentication. You can log in with any of these credentials:

- **Email**: `admin@ticktock.com`
- **Password**: `password123`

OR

- **Email**: `user@ticktock.com`
- **Password**: `password123`

## Frameworks/Libraries Used

### Core Framework
- **Next.js 16.0.7** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### Styling
- **TailwindCSS 4** - Utility-first CSS framework
- **@tailwindcss/postcss 4** - PostCSS integration

### Authentication
- **next-auth 5.0.0-beta.30** - Authentication library
- **@auth/core 0.41.0** - Core auth utilities

### Form Handling & Validation
- **react-hook-form 7.68.0** - Form state management
- **@hookform/resolvers 5.2.2** - Form validation resolvers
- **zod 4.1.13** - Schema validation

### Testing
- **Jest 30.2.0** - Testing framework
- **jest-environment-jsdom 30.2.0** - DOM environment for Jest
- **@testing-library/react 16.3.0** - React testing utilities
- **@testing-library/jest-dom 6.9.1** - DOM matchers for Jest

### Development Tools
- **ESLint 9** - Code linting
- **eslint-config-next 16.0.7** - Next.js ESLint configuration
- **@types/node 20** - Node.js type definitions
- **@types/react 19** - React type definitions
- **@types/react-dom 19** - React DOM type definitions
- **@types/jest 30.0.0** - Jest type definitions

## Assumptions and Notes

### Data Management
1. **Mock Data**: The application uses mock data stored in `lib/mockData.ts`. In a production environment, this would be replaced with a database (PostgreSQL, MongoDB, etc.).

2. **API Persistence**: API routes return mock data. POST, PUT, and DELETE operations return success responses but don't persist data permanently. In production, these would interact with a database.

3. **State Management**: Client-side state management is handled using React hooks (useState, useMemo). For production, consider using a state management library if the application scales.

### Authentication
4. **Dummy Authentication**: Currently uses dummy credentials stored in `lib/mockData.ts`. In production, this should be replaced with a proper authentication system (OAuth, database-backed auth, etc.).

5. **Session Storage**: Uses JWT-based sessions. The session is stored in a secure HTTP-only cookie managed by next-auth.

6. **Session Strategy**: JWT strategy is used instead of database sessions for simplicity. In production with a database, database sessions might be preferred.

### UI/UX
7. **Responsive Design**: The application is fully responsive and works on mobile, tablet, and desktop devices using TailwindCSS breakpoints.




## Time Spent

Approximately **15 hours** total, broken down as follows:

