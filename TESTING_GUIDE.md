# Testing Guide - StockSync System

## Prerequisites
- Node.js installed
- MongoDB running (local or Atlas connection)
- Postman or curl installed (for API testing)
- Backend and frontend ready to start

---

## Step 1: Start the Backend

```bash
cd /home/aarf101/Sandbox/StockSync/backend

# Install dependencies (if not done)
npm install

# Compile TypeScript
npm run build

# Start server
npm start
```

**Expected Output:**
```
Connected to MongoDB
Server listening on port 4000
```

**Test it works:**
```bash
curl http://localhost:4000/api/health
# Should return: {"success":true,"data":{"status":"ok"}}
```

---

## Step 2: Seed Initial Data

```bash
cd /home/aarf101/Sandbox/StockSync/backend

npm run seed
```

**What gets created:**
- 4 warehouses (Warehouse-A, B, C, D)
- 2 demo users:
  - `admin@example.com` / `admin123` (admin role, no warehouse restriction)
  - `sophie@example.com` / `sophie123` (agent_reception, Warehouse-A & B)
- 2 sample transfers
- 2 sample alerts

---

## Step 3: Test Authentication (API Level)

### Test 3A: Admin Login
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "67abc123...",
    "name": "Admin",
    "email": "admin@example.com",
    "roles": ["admin"],
    "warehouses": []
  }
}
```

**Save the admin ID** for next tests:
```bash
ADMIN_ID="<paste_id_here>"
```

### Test 3B: Sophie (Reception Agent) Login
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sophie@example.com",
    "password": "sophie123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "67xyz789...",
    "name": "Sophie",
    "email": "sophie@example.com",
    "roles": ["agent_reception"],
    "warehouses": ["Warehouse-A", "Warehouse-B"]
  }
}
```

**Save Sophie's ID:**
```bash
SOPHIE_ID="<paste_id_here>"
```

---

## Step 4: Test RBAC - Warehouse Filtering

### Test 4A: Admin sees ALL warehouses
```bash
curl "http://localhost:4000/api/warehouses?userId=$ADMIN_ID"
```

**Expected:** 4 warehouses returned
```json
{
  "success": true,
  "data": [
    { "name": "Warehouse-A", ... },
    { "name": "Warehouse-B", ... },
    { "name": "Warehouse-C", ... },
    { "name": "Warehouse-D", ... }
  ]
}
```

### Test 4B: Sophie sees ONLY her warehouses
```bash
curl "http://localhost:4000/api/warehouses?userId=$SOPHIE_ID"
```

**Expected:** Only 2 warehouses
```json
{
  "success": true,
  "data": [
    { "name": "Warehouse-A", ... },
    { "name": "Warehouse-B", ... }
  ]
}
```

### Test 4C: Unauthorized access attempt
```bash
# Get Warehouse-C ID from admin response above, then try to access as Sophie
WAREHOUSE_C_ID="<id_from_admin_response>"

curl -X PUT "http://localhost:4000/api/warehouses/$WAREHOUSE_C_ID" \
  -H "X-User-ID: $SOPHIE_ID" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 5000}'
```

**Expected:** Access Denied
```json
{
  "success": false,
  "error": { "message": "Access denied" }
}
```

---

## Step 5: Test Transfer Filtering

### Test 5A: Admin sees ALL transfers
```bash
curl "http://localhost:4000/api/transfers?userId=$ADMIN_ID"
```

**Expected:** All transfers returned

### Test 5B: Sophie sees ONLY her warehouse transfers
```bash
curl "http://localhost:4000/api/transfers?userId=$SOPHIE_ID"
```

**Expected:** Only transfers involving Warehouse-A or Warehouse-B

---

## Step 6: Test Analytics Filtering

### Test 6A: Admin gets system-wide metrics
```bash
curl "http://localhost:4000/api/analytics/metrics?userId=$ADMIN_ID"
```

**Expected Response includes:**
- 4 warehouses total
- All transfers
- System-wide metrics

### Test 6B: Sophie gets only her metrics
```bash
curl "http://localhost:4000/api/analytics/metrics?userId=$SOPHIE_ID"
```

**Expected Response includes:**
- 2 warehouses total (A & B)
- Only transfers for those warehouses
- Metrics for her warehouses only

---

## Step 7: Test User Creation with Warehouse Assignment

### Test 7A: Create Manager for Warehouse-A only
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager",
    "email": "john@example.com",
    "password": "john123",
    "roles": ["gestionnaire_entrepot"],
    "warehouses": ["Warehouse-A"]
  }'
```

**Expected:** User created with ID returned

**Save the ID:**
```bash
JOHN_ID="<paste_id_here>"
```

### Test 7B: Verify John only sees Warehouse-A
```bash
curl "http://localhost:4000/api/warehouses?userId=$JOHN_ID"
```

**Expected:** Only Warehouse-A returned

---

## Step 8: Start Frontend (Optional - Visual Testing)

```bash
cd /home/aarf101/Sandbox/StockSync/my-react-app

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

---

## Step 9: Frontend Login Testing

Open http://localhost:5173 in browser

### Test 9A: Admin Login
- Email: `admin@example.com`
- Password: `admin123`
- **Should see:** Dashboard with all 4 warehouses

### Test 9B: Sophie Login
- Email: `sophie@example.com`
- Password: `sophie123`
- **Should see:** Dashboard with only Warehouse-A & Warehouse-B

### Test 9C: John Login
- Email: `john@example.com`
- Password: `john123`
- **Should see:** Dashboard with only Warehouse-A

---

## Step 10: Test Create Operations

### Test 10A: Create Warehouse (Admin only)
```bash
curl -X POST http://localhost:4000/api/warehouses \
  -H "X-User-ID: $ADMIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Warehouse-E",
    "location": "Brooklyn",
    "capacity": 2000,
    "used": 500,
    "status": "operational"
  }'
```

**Expected:** New warehouse created

### Test 10B: Sophie tries to create (should fail)
```bash
curl -X POST http://localhost:4000/api/warehouses \
  -H "X-User-ID: $SOPHIE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Warehouse-F",
    "location": "Queens",
    "capacity": 1500,
    "used": 200,
    "status": "operational"
  }'
```

**Expected:** Access Denied

---

## Step 11: Test Update Operations

### Test 11A: Admin updates any warehouse
```bash
WAREHOUSE_A_ID="<get_from_previous_response>"

curl -X PUT "http://localhost:4000/api/warehouses/$WAREHOUSE_A_ID" \
  -H "X-User-ID: $ADMIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 3000}'
```

**Expected:** Warehouse updated

### Test 11B: John updates Warehouse-A (his warehouse)
```bash
curl -X PUT "http://localhost:4000/api/warehouses/$WAREHOUSE_A_ID" \
  -H "X-User-ID: $JOHN_ID" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 2500}'
```

**Expected:** Warehouse updated

### Test 11C: John tries to update Warehouse-C (not assigned)
```bash
WAREHOUSE_C_ID="<get_from_earlier>"

curl -X PUT "http://localhost:4000/api/warehouses/$WAREHOUSE_C_ID" \
  -H "X-User-ID: $JOHN_ID" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 2500}'
```

**Expected:** Access Denied

---

## Step 12: Test Delete Operations

### Test 12A: Admin deletes warehouse
```bash
# Get Warehouse-E ID from creation response
WAREHOUSE_E_ID="<get_id>"

curl -X DELETE "http://localhost:4000/api/warehouses/$WAREHOUSE_E_ID" \
  -H "X-User-ID: $ADMIN_ID"
```

**Expected:** Warehouse deleted

### Test 12B: John tries to delete (should fail)
```bash
WAREHOUSE_A_ID="<get_from_earlier>"

curl -X DELETE "http://localhost:4000/api/warehouses/$WAREHOUSE_A_ID" \
  -H "X-User-ID: $JOHN_ID"
```

**Expected:** Access Denied (only admins can delete)

---

## Step 13: Test Transfer Operations

### Test 13A: Create Transfer (Admin)
```bash
curl -X POST http://localhost:4000/api/transfers \
  -H "X-User-ID: $ADMIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "fromWarehouse": "Warehouse-A",
    "toWarehouse": "Warehouse-B",
    "items": [
      {"sku": "ITEM-001", "quantity": 10}
    ],
    "status": "planned"
  }'
```

**Expected:** Transfer created

### Test 13B: Create Transfer (Sophie as agent_reception)
```bash
curl -X POST http://localhost:4000/api/transfers \
  -H "X-User-ID: $SOPHIE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "fromWarehouse": "Warehouse-C",
    "toWarehouse": "Warehouse-D",
    "items": [
      {"sku": "ITEM-002", "quantity": 5}
    ],
    "status": "planned"
  }'
```

**Expected:** Transfer created (agent_reception can create)

### Test 13C: John tries to create (not agent_reception role)
```bash
curl -X POST http://localhost:4000/api/transfers \
  -H "X-User-ID: $JOHN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "fromWarehouse": "Warehouse-A",
    "toWarehouse": "Warehouse-B",
    "items": [{"sku": "ITEM-003", "quantity": 3}],
    "status": "planned"
  }'
```

**Expected:** Insufficient permissions

---

## Step 14: Test Analytics Export (Frontend)

In browser (if running frontend):

1. Login as Admin
2. Go to Data Analyst page
3. Click "Export" button
4. **Should download** CSV file with warehouse and transfer data

---

## ✅ Success Checklist

- [ ] Backend starts and connects to MongoDB
- [ ] Admin login works
- [ ] Sophie login works
- [ ] John login works
- [ ] Admin sees all 4 warehouses
- [ ] Sophie sees only 2 warehouses
- [ ] John sees only 1 warehouse
- [ ] Admin can create warehouses
- [ ] Sophie cannot create warehouses
- [ ] Admin can update any warehouse
- [ ] John can update his warehouse
- [ ] John cannot update other warehouses
- [ ] Admin can delete warehouses
- [ ] Non-admins cannot delete
- [ ] Transfer filtering works
- [ ] Transfer creation works for agents
- [ ] Transfer creation fails for non-agents
- [ ] Frontend login works
- [ ] Frontend displays correct data per user
- [ ] Export/Filter buttons work
- [ ] Permission errors show (403 responses)

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check MongoDB URI is set
echo $MONGODB_URI

# If not set, add to .env in backend folder
MONGODB_URI=mongodb://localhost:27017/stocksync
```

### Backend compiles but errors on run
```bash
# Verify all imports are correct
cd backend
npm run build 2>&1 | grep error
```

### Seed script fails
```bash
# Make sure MongoDB is running
mongosh # Should connect successfully

# Then run seed again
npm run seed
```

### Frontend API calls fail
```bash
# Check that backend is running on port 4000
curl http://localhost:4000/api/health

# Check VITE_API_URL in frontend .env
cat my-react-app/.env
```

### userId not in response
```bash
# Make sure login endpoint returns full user object
curl -X POST http://localhost:4000/api/users/login \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq '.data'
# Should see: id, name, email, roles, warehouses
```

---

## Quick Test Commands (Copy-Paste)

```bash
# Set IDs from login responses
ADMIN_ID="admin_id_from_login"
SOPHIE_ID="sophie_id_from_login"

# Test admin sees all
curl "http://localhost:4000/api/warehouses?userId=$ADMIN_ID" | jq '.data | length'
# Should return: 4

# Test sophie sees only 2
curl "http://localhost:4000/api/warehouses?userId=$SOPHIE_ID" | jq '.data | length'
# Should return: 2

# Test access denied
curl -X PUT "http://localhost:4000/api/warehouses/warehouse_c_id" \
  -H "X-User-ID: $SOPHIE_ID" \
  -H "Content-Type: application/json" \
  -d '{"capacity":5000}' | jq '.error'
# Should see: "Access denied"
```
