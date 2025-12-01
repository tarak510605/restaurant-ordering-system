# Datasets & Seed Data

This file documents the seed data used for the demo application and how to re-seed.

## How to seed

Run:

```bash
npm run seed
```

This will populate the database with countries, roles, users, restaurants, menu items, and payment methods.

## Sample seed summary

- Countries:
  - India
  - USA

- Roles:
  - Admin (full permissions)
  - Manager (country-scoped management)
  - Member (basic customer)

- Demo Users (examples):
  - nick.fury@shield.com — Admin — password123
  - carol.danvers@avengers.com — Manager (USA) — password123
  - steve.rogers@avengers.com — Manager (India) — password123
  - thanos@titan.com — Member (India) — password123
  - thor@asgard.com — Member (India) — password123
  - travis@usa.com — Member (USA) — password123

- Restaurants (examples):
  - Spice Garden (India) — Indian cuisine
  - Taj Mahal (India) — Indian cuisine
  - Curry House (India) — Indian cuisine
  - American Grill (USA) — American cuisine
  - Liberty Diner (USA) — American cuisine
  - Burger Paradise (USA) — Burgers

- Menu items: 4–8 items per restaurant (name, description, price)

- Payment Methods:
  - Card
  - NetBanking
  - UPI

## Test scenarios

1. Member in India creates an order and attempts checkout (fails if no permission).
2. Manager in India creates an order and checks out for a user in India.
3. Admin views all orders and manages payment methods.

## Notes
- The `scripts/seed.ts` file contains full seed objects; edit it to customize data.
- If seeding fails, ensure `MONGODB_URI` is set and the DB is reachable.
