# StockSync Backend (minimal scaffold)

This folder contains a minimal Node.js + TypeScript + Express backend scaffold for the StockSync Administration Logistique features.

Key points:
- Uses MongoDB (provide an online MONGODB_URI in environment)
- Run `npm install` in `/backend` then `npm run dev`
- Seed mock data: `npm run seed` (will use MONGODB_URI)

Environment variables (see `.env.example`):
- MONGODB_URI
- PORT
- JWT_SECRET

What I added:
- package.json, tsconfig.json
- basic Express bootstrap at `src/index.ts`
- Mongoose models: Warehouse, User, Transfer, Alert
- Basic routes for warehouses, transfers, users, alerts and config
- `src/scripts/seed.ts` to populate mock data

Next recommended steps:
- Run `npm install` and test with your online MongoDB URI.
- Implement authentication (JWT) and RBAC middleware.
- Add validations (zod) and error handling middleware.
- Add queue worker (Bull/BullMQ) and Socket.IO for real-time metrics.
