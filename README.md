# StockSync - Warehouse Management System

A comprehensive warehouse management system built with React, Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Multiple user roles with specific permissions
- **Stock Management**: Track products, stock levels, entries, and exits
- **Warehouse Management**: Manage multiple warehouses with real-time statistics
- **Analytics Dashboard**: Comprehensive analytics for data analysts
- **JWT Authentication**: Secure authentication with token-based access
- **Real-time Statistics**: Live updates from database

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd StockSync_webapp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/stocksync
PORT=4000
JWT_SECRET=your_strong_random_secret_key_here
```

### 3. Frontend Setup

```bash
cd ../my-react-app
npm install
```

### 4. Seed the Database

```bash
cd ../backend
npm run seed
```

This will create test users and populate the database with sample data. **Save the generated credentials from the console output!**

## 🏃 Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:4000`

### Start Frontend

```bash
cd my-react-app
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👥 User Roles

- **Admin**: Full access to all pages
- **Logistic Admin**: Full access to all pages
- **Data Analyst**: Access to analytics dashboard only
- **Warehouse Supervisor**: Access to warehouse management only
- **Préparateur Commandes**: Access to order preparation only
- **Agent Réception**: Access to reception management only

## 📁 Project Structure

```
StockSync_webapp/
├── backend/              # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── scripts/      # Seed script
│   └── .env             # Environment variables (not in git)
├── my-react-app/         # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── utils/        # Utilities and API client
└── README.md
```

## 🔐 Security Notes

- **Never commit** `.env` files or `CREDENTIALS.md`
- JWT tokens are stored in localStorage
- Passwords are hashed using bcrypt
- All API routes are protected with authentication middleware

## 📚 Documentation

- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `STOCK_DATABASE_SETUP.md` - Stock management documentation
- `STATISTICS_UPDATE.md` - Analytics implementation details
- `JWT_IMPLEMENTATION.md` - Authentication details

## 🧪 Testing

After seeding the database, you can log in with any of the test users. Check the console output after running `npm run seed` for credentials.

## 📝 License

[Your License Here]

## 👨‍💻 Author

[Your Name]

