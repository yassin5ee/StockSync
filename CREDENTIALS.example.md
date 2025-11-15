# StockSync - Test User Credentials Template

## Database Setup

1. **Create `.env` file** in the `backend` directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/stocksync
   PORT=4000
   JWT_SECRET=your_strong_random_secret_key_here
   ```

2. **Run the seed script** to populate the database:
   ```bash
   cd backend
   npm run seed
   ```

## Test User Credentials

**⚠️ IMPORTANT: After running the seed script, check the console output or CREDENTIALS.md file for actual passwords!**

### Admin
- **Email:** `admin@stocksync.com`
- **Password:** (Generated randomly - check seed output)
- **Role:** `admin`
- **Access:** Can access ALL pages

### Data Analyst
- **Email:** `data.analyst@stocksync.com`
- **Password:** (Generated randomly - check seed output)
- **Role:** `data_analyst`
- **Access:** Can only access `/data-analyst` page

### Warehouse Supervisor
- **Email:** `warehouse.supervisor@stocksync.com`
- **Password:** (Generated randomly - check seed output)
- **Role:** `warehouse_supervisor`
- **Access:** Can only access `/gestionnaire-entrepot` page

### Logistic Admin
- **Email:** `logistic.admin@stocksync.com`
- **Password:** (Generated randomly - check seed output)
- **Role:** `logistic_admin`
- **Access:** Can access ALL pages (same as admin)

### Préparateur Commandes
- **Email:** `preparateur@stocksync.com`
- **Password:** (Generated randomly - check seed output)
- **Role:** `preparateur commend`
- **Access:** Can only access `/preparateur-commandes` page

### Agent Réception
- **Email:** `agent.reception@stocksync.com`
- **Password:** (Generated randomly - check seed output)
- **Role:** `agent de reception`
- **Access:** Can only access `/agent-reception` page

## Role-Based Access Control

- **Admin** and **Logistic Admin**: Can access all pages
- **Other roles**: Can only access their own specific page
- If a user tries to access a page they don't have permission for, they will be redirected to their default page

## Notes

- All passwords are randomly generated and hashed using bcrypt
- All emails must use the `@stocksync.com` domain
- The seed script will clear existing data and create fresh test users
- **Each time you run the seed script, new random passwords will be generated**
- **Save the CREDENTIALS.md file after running the seed script to keep track of passwords**

