# StockSync Login System Setup

## Overview
The login system now uses a real backend authentication system. Users must be created first via a POST request, then they can log in with their credentials.

## Step 1: Create a User

Send a POST request to create a new user:

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "roles": ["admin", "gestionnaire"],
    "warehouses": ["warehouse-1"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Step 2: Login with Credentials

Send a POST request to log in:

```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["admin", "gestionnaire"],
    "warehouses": ["warehouse-1"]
  }
}
```

## Frontend Integration

The Login page now:
1. Accepts **email** and **password** fields
2. Calls the `/api/users/login` endpoint
3. Stores user information in localStorage:
   - `username` - User's name
   - `userId` - User's ID
   - `userEmail` - User's email
   - `rememberMe` - Optional: if checked

## Testing in Frontend

1. Navigate to `http://localhost:3000/login`
2. Enter the email and password you created
3. Click "Se Connecter"
4. You'll be redirected to `/accueil` on success

## Environment Variables

Make sure your frontend can access the backend:

**.env** (my-react-app)
```
VITE_API_URL=http://localhost:4000
```

## Security Notes

- Passwords are hashed using bcrypt with 10 salt rounds
- Passwords are never returned in API responses
- Last login timestamp is recorded
- Invalid credentials return a generic error message (for security)

## User Fields

When creating a user, available fields are:

| Field | Type | Required | Default |
|-------|------|----------|---------|
| name | String | Yes | - |
| email | String | Yes | - |
| password | String | No | 'changeme' |
| roles | Array | No | ['gestionnaire'] |
| warehouses | Array | No | [] |

## Example: Create Multiple Test Users

```bash
# Admin user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@stocksync.com",
    "password": "admin123",
    "roles": ["admin"]
  }'

# Warehouse Manager
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gestionnaire",
    "email": "gestionnaire@stocksync.com",
    "password": "password123",
    "roles": ["gestionnaire"],
    "warehouses": ["warehouse-A", "warehouse-B"]
  }'

# Data Analyst
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analyst",
    "email": "analyst@stocksync.com",
    "password": "analyst123",
    "roles": ["analyst"]
  }'
```

Then log in with any of these credentials on the frontend!
