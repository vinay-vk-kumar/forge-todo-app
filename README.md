# Forge Todo

A robust, secure, and productivity-focused Todo application built with a modern tech stack.

## 🚀 Features

-   **Authentication**:
    -   **Email/Password**: Secure signup and login with bcrypt hashing.
    -   **OTP Verification**: 6-digit OTP email verification for new accounts.
    -   **Google OAuth**: Seamless sign-in with Google.
    -   **Password Reset**: Secure forgot/reset password flow via OTP.
-   **Security**:
    -   **Rate Limiting**: Limits transactional emails (5 per day) to prevent abuse.
    -   **HTTP Headers**: Secured with `helmet`.
    -   **CORS**: Configured for specified frontend origins.
    -   **JWT**: Stateless authentication using JSON Web Tokens.
-   **Email Infrastructure**:
    -   Integrated with **Resend** for reliable email delivery.
    -   Custom HTML email templates with "Forge Todo" branding.
-   **Frontend**:
    -   **Next.js 14**: Server-side rendering and static generation.
    -   **Tailwind CSS**: Utility-first styling.
    -   **Shadcn UI**: Accessible and customizable components.
    -   **Framer Motion**: Smooth animations and transitions.
-   **Backend**:
    -   **Express.js**: Fast, unopinionated web framework.
    -   **Prisma ORM**: Type-safe database access with PostgreSQL.
    -   **TypeScript**: End-to-end type safety.

## 🛠️ Tech Stack

### Frontend (`/client`)
-   **Framework**: Next.js (App Router)
-   **Styling**: Tailwind CSS
-   **Components**: Radix UI (via Shadcn)
-   **State Management**: Zustand
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Data Fetching**: Axios / SWR

### Backend (`/server`)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Authentication**: Passport.js, JSON Web Tokens (JWT)
-   **Email**: Resend SDK
-   **Validation**: Zod (implied usage)

## 📦 Prerequisites

-   **Node.js** (v18+)
-   **PostgreSQL** (Local or Cloud, e.g., Neon/Supabase)
-   **npm** or **pnpm**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd forge-todo
```

### 2. Backend Setup
Navigate to the server directory:
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/todo_db"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONT_END_URL="http://localhost:3000"

# Authentication
JWT_USER_SECRET="your-super-secret-jwt-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# Email (Resend)
RESEND_API_KEY="re_123456789"
EMAIL_FROM="Forge Todo <onboarding@resend.dev>" # Or your verified domain
```

Run Database Migrations:
```bash
npx prisma migrate dev --name init
```

Start the Backend:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the client directory:
```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

Start the Frontend:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔒 Security Best Practices

-   **Environment Variables**: Never commit `.env` files.
-   **OTP Logs**: In development (`NODE_ENV=development`), OTPs are logged to the console for easy testing. In production, they are only sent via email.
-   **Rate Limiting**: Users are limited to 5 verification emails per day to prevent spam.

## 📄 License
MIT
