# StockSync - Role-Based Access Control Setup

## 4 Official Roles

### 1. **Admin Logistique** (`admin_logistique`)
- **Access Level:** Full system access
- **Can:** 
  - View all warehouses, transfers, alerts
  - Create/edit/delete warehouses, transfers, users
  - Manage system configuration
  - View all analytics (system-wide)
  - Access Administration Logistique page
- **Cannot:** Limited by nothing (superuser)

**Test Account:**
- Email: `admin@stocksync.local`
- Password: `admin123`
- Warehouses: All (empty list = admin privilege)

---

### 2. **Data Analyst** (`data_analyst`)
- **Access Level:** Read-only analytics
- **Can:**
  - View all warehouses (read-only)
  - View all transfers (read-only)
  - View system-wide analytics
  - Access Data Analyst page
- **Cannot:**
  - Create/edit/delete anything
  - Access warehouses for operations
  - Manage users

**Test Account:**
- Email: `analyst@stocksync.local`
- Password: `analyst123`
- Warehouses: None (read access to all for analytics)

---

### 3. **Agent de Réception** (`agent_reception`)
- **Access Level:** Reception operations
- **Can:**
  - View assigned warehouses
  - Receive transfers (start/complete receptions)
  - Report delays/problems
  - View relevant analytics for assigned warehouses
  - Access Entrees (Reception) page
- **Cannot:**
  - Create warehouses
  - Delete transfers
  - Access admin pages
  - Manage users

**Test Account:**
- Email: `reception@stocksync.local`
- Password: `reception123`
- Warehouses: `["Entrepôt Paris Nord", "Entrepôt Lyon Est"]`

---

### 4. **Préparateur** (`preparateur`)
- **Access Level:** Order preparation & fulfillment
- **Can:**
  - View assigned warehouses
  - Prepare transfers/orders
  - Update transfer status
  - View relevant analytics
  - Access Sorties (Outbound) page
- **Cannot:**
  - Receive transfers (Agent Réception's job)
  - Manage warehouses or users
  - Access admin pages

**Test Account:**
- Email: `preparateur@stocksync.local`
- Password: `preparateur123`
- Warehouses: `["Entrepôt Paris Nord"]`

---

## Testing the 4 Roles

### Quick Test Matrix

| Action | Admin | Analyst | Reception | Préparateur |
|--------|-------|---------|-----------|-------------|
| View all warehouses | ✅ Edit | ✅ Read | ❌ Only assigned | ❌ Only assigned |
| Create warehouse | ✅ | ❌ | ❌ | ❌ |
| Receive transfer | ✅ | ❌ | ✅ | ❌ |
| Prepare order | ✅ | ❌ | ❌ | ✅ |
| Access Admin page | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ All | ✅ All | ✅ Assigned only | ✅ Assigned only |

### Test Commands

1. **Seed database with 4 roles:**
```bash
cd /home/aarf101/Sandbox/StockSync/backend
npm run seed
```

2. **Login as each role and verify access:**
```bash
# Admin
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stocksync.local","password":"admin123"}'

# Data Analyst
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@stocksync.local","password":"analyst123"}'

# Agent Réception
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"reception@stocksync.local","password":"reception123"}'

# Préparateur
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"preparateur@stocksync.local","password":"preparateur123"}'
```

3. **Test warehouse visibility (RBAC filter):**
```bash
# Admin sees all warehouses
curl "http://localhost:4000/api/warehouses?userId=<ADMIN_ID>"

# Analyst sees all (for analytics)
curl "http://localhost:4000/api/warehouses?userId=<ANALYST_ID>"

# Reception sees only assigned
curl "http://localhost:4000/api/warehouses?userId=<RECEPTION_ID>"

# Préparateur sees only assigned
curl "http://localhost:4000/api/warehouses?userId=<PREPARATEUR_ID>"
```

---

## Implementation Notes

- **Backend enforced:** All RBAC checks are server-side via auth middleware
- **Frontend aware:** UI hides/shows pages based on roles (navigation, pages)
- **Data scoped:** Each role only retrieves authorized data from API
- **Stateless:** Roles can be changed without re-login (update user, refresh auth)

---

## Adding New Users

Use the API to create users with any of the 4 roles:

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@stocksync.local",
    "password": "password123",
    "roles": ["preparateur"],
    "warehouses": ["Entrepôt Paris Nord"]
  }'
```

Valid roles: `admin_logistique`, `data_analyst`, `agent_reception`, `preparateur`

---

**Setup Date:** Nov 15, 2025
**Version:** 1.0
