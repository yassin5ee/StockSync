# StockSync - Setup Instructions

## Prerequisites

1. **MongoDB** must be installed and running on `localhost:27017`
2. **Node.js** and **npm** installed

## Step 1: Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
MONGODB_URI=mongodb://localhost:27017/stocksync
PORT=4000
```

**Important:** The `.env` file is in `.gitignore`, so you need to create it manually.

## Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../my-react-app
npm install
```

## Step 3: Seed the Database

Run the seed script to create test users:

```bash
cd backend
npm run seed
```

This will:
- Clear existing data (if any)
- Create test users for all roles
- Create sample warehouses, transfers, and alerts

**Expected output:**
```
=== Seed Complete ===
Test users created (all with password: password123):
- Admin: admin@stocksync.com
- Data Analyst: data.analyst@stocksync.com
- Warehouse Supervisor: warehouse.supervisor@stocksync.com
- Logistic Admin: logistic.admin@stocksync.com
- Préparateur: preparateur@stocksync.com
- Agent Réception: agent.reception@stocksync.com
====================
```

## Step 4: Start the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:4000`

### Start Frontend Application

In a new terminal:

```bash
cd my-react-app
npm run dev
```

The frontend should start on `http://localhost:5173` (or similar port)

## Step 5: Login

1. Navigate to the login page
2. Use any of the test credentials from `CREDENTIALS.md`
3. Default password for all users: `password123`

## Troubleshooting

### Database Connection Error

- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check that the connection string in `.env` is correct
- Verify MongoDB is listening on port 27017

### No Users in Database

- Run the seed script again: `cd backend && npm run seed`
- Check MongoDB Compass to verify the `users` collection exists
- Make sure you're connected to the `stocksync` database

### Authentication Issues

- Clear browser localStorage
- Make sure the backend server is running
- Check browser console for errors

## Role-Based Access

- **Admin** and **Logistic Admin**: Can access ALL pages
- **Other roles**: Can only access their own specific page
- Users are automatically redirected to their role-specific page after login

