# Login Debug Guide

## Problem: "Email ou mot de passe incorrect" error

If you're getting this error even though the user exists in MongoDB, follow these steps:

### Step 1: Check the Backend Logs

When you try to log in, watch your backend terminal for these console logs:
```
Login attempt for email: your@email.com
User found: Your Name, checking password...
```

If you see "User not found" - the email doesn't match exactly (check for spaces, case sensitivity)
If password check fails - the password hash might be corrupted

### Step 2: Verify User in MongoDB

In MongoDB Cloud:
1. Go to Collections
2. Find your database
3. Look at the `users` collection
4. Check that:
   - `email` field matches exactly what you're trying to login with
   - `passwordHash` field exists and has a value starting with `$2a$` or `$2b$` (bcrypt format)

### Step 3: Common Issues

**Issue 1: API URL not configured**
- Check browser console (F12 > Console tab)
- You should see: `API_URL: http://localhost:4000`
- If it shows empty, your `.env` file is not set correctly

**Solution:**
```
# In my-react-app/.env (create if doesn't exist)
VITE_API_URL=http://localhost:4000
```

Then restart the React dev server:
```bash
cd my-react-app
npm run dev
```

**Issue 2: Route order problem**
- The `/login` route must be defined BEFORE the catch-all POST `/`
- This has been fixed in the updated code

**Issue 3: Email case sensitivity**
- MongoDB queries are case-sensitive by default
- If user created with "John@Example.com" but you try "john@example.com" it will fail
- Create users with lowercase emails to avoid this

### Step 4: Test the Login Endpoint Directly

Open a terminal and test with curl:

```bash
# First, verify the user exists
curl http://localhost:4000/api/users

# Then test login
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Expected response on success:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Your Name",
    "email": "your-email@example.com",
    "roles": ["gestionnaire"],
    "warehouses": []
  }
}
```

Expected response on failure:
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Step 5: Check Browser Console

Open your browser's Developer Tools (F12):

1. Go to the **Console** tab
2. Try logging in
3. Look for these logs:
   ```
   API_URL: http://localhost:4000
   Attempting login with email: your@email.com
   Login successful: { id: ..., name: ..., email: ... }
   ```

Or error logs like:
   ```
   Login error: Error: API error 401
   ```

### Step 6: Verify .env Configuration

**Backend (.env file in /backend directory):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stocksync
PORT=4000
```

**Frontend (.env file in /my-react-app directory):**
```
VITE_API_URL=http://localhost:4000
```

### Step 7: Fresh User Creation

If nothing works, delete the user and create a new one with a simpler password:

```bash
# Create fresh user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "roles": ["admin"]
  }'

# Then try login
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Step 8: Enable Debug Mode

Edit `/backend/src/routes/users.ts` to add even more logging at the password comparison:

```typescript
const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
console.log(`Password comparison result: ${isPasswordValid}`);
console.log(`Provided password: ${password}`);
console.log(`Stored hash starts with: ${user.passwordHash.substring(0, 20)}...`);
```

Then restart the backend and try logging in again.

## Still Not Working?

Please provide:
1. The exact error from browser console
2. Backend terminal logs
3. The curl test result from Step 4
4. The email/password you're using (sanitized)
