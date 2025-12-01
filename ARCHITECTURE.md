# Architecture & Design

## Overview
This document describes the high-level architecture of the Restaurant Ordering System. The application follows a standard modern full-stack pattern using Next.js for the frontend and API routes, and MongoDB (via Mongoose) for persistence.

## Components

- Frontend: Next.js (App Router) + Tailwind CSS
- Backend: Next.js API routes (server code inside `app/api/*`)
- Database: MongoDB with Mongoose models
- Authentication: NextAuth.js (credentials provider, JWT sessions)
- Seed data: `scripts/seed.ts` to initialize demo users, countries, restaurants, menu items, and payment methods

## High-level Flow
1. User visits the site (SSR or CSR via Next.js pages).
2. Login via credentials provider; server validates user and issues JWT session.
3. Auth middleware enforces RBAC and country-based filtering.
4. API routes handle CRUD operations for restaurants, orders, and payment methods.
5. Orders are created and stored in MongoDB; checkout updates order status and records payment method.

## Data Model (ERD summary)
- Country 1:N Restaurants
- Country 1:N Users
- Restaurant 1:N MenuItem
- User 1:N Orders
- Order contains many MenuItems (items array)
- PaymentMethod 1:N Orders

## Security & Permissions
- Passwords hashed with `bcryptjs`.
- Server-side RBAC enforced on API routes; Admin/Manager/Member roles with permission objects.
- Country-based data isolation: Managers and Members only see their assigned country; Admin sees all.

## Deployment Notes
- Environment variables required: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- Build: `npm run build` then `npm start` for production.
- Recommended hosting: Vercel for frontend + API routes; MongoDB Atlas for DB.

## Scaling & Performance
- Add indexes on frequently queried fields (user.email, restaurant.country, order.status).
- Use connection pooling and horizontal scaling for the API layer.
- Use CDN and image optimization for restaurant images (next/image + external source domain whitelist).

## Observability
- Add logging (structured) and basic metrics (request rate, error rates).
- Centralized error reporting for critical endpoints (Sentry or similar).

## Future improvements
- Move heavy business logic to dedicated serverless functions or microservices.
- Add caching for restaurant listings and menu data.
- Add payment provider integration (Stripe) for real checkout.
