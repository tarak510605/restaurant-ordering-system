# Restaurant Ordering System

A full-stack restaurant ordering system with role-based access control (RBAC), built with Next.js 14, MongoDB, and TypeScript.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup Instructions

1. **Install dependencies**
```bash
npm install
```

2. **Create environment file**

Create `.env.local` in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/restaurant-ordering
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

3. **Seed the database**
```bash
npm run seed
```

4. **Run the application**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | nick.fury@shield.com | password123 |
| Manager | steve.rogers@avengers.com | password123 |
| Member | thanos@titan.com | password123 |
