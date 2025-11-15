# Role-Based Access Control (RBAC) Implementation

## Overview
StockSync now implements role-based access control and user-specific data filtering. Users only see warehouses and transfers they're assigned to, based on their `warehouses` array in the database.

## How It Works

### User Assignment
Each user has a `warehouses` array field:
```json
{
  "_id": "user_id",
  "name": "Sophie",
  "email": "sophie@example.com",
  "roles": ["agent_reception"],
  "warehouses": ["Warehouse-A", "Warehouse-B"],
  "status": "active"
}
```

### Data Filtering

#### Warehouse Access
- **If user has assigned warehouses**: They see only those warehouses
- **If user has empty warehouses array []**: They see all warehouses (admin privilege)

#### Transfer Visibility
- **Reception agent**: Sees only transfers where `fromWarehouse` OR `toWarehouse` matches their assigned warehouses
- **Picking agent**: Sees only transfers from their assigned warehouses  
- **Admin**: Sees all transfers

#### Analytics
- Data analyst only sees metrics for their assigned warehouses
- Admin sees system-wide metrics

### Authentication Flow

1. **User logs in** via `POST /api/users/login`
   - Backend returns user object with ID and warehouses
   
2. **Frontend stores user** in localStorage
   ```js
   localStorage.setItem('user', JSON.stringify(user))
   ```

3. **All API calls include userId** via:
   - Query parameter: `?userId=...` (GET requests)
   - Header: `X-User-ID: ...` (POST/PUT/DELETE requests)

4. **Backend middleware extracts userId** and populates `req.user`
   ```ts
   if (req.user && !isAdmin(req)) {
     // Apply permission checks
   }
   ```

5. **Backend filters results** based on user's warehouses

## API Changes

### Request Format

#### GET Request (Query Parameter)
```bash
curl "http://localhost:4000/api/warehouses?userId=67abc123..."
```

#### POST/PUT/DELETE (Header)
```bash
curl -X POST http://localhost:4000/api/warehouses \
  -H "X-User-ID: 67abc123..." \
  -H "Content-Type: application/json" \
  -d '{"name":"New Warehouse",...}'
```

### Response Filtering

**Before (User saw all 4 warehouses):**
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

**After (User sees only assigned warehouses):**
```json
{
  "success": true,
  "data": [
    { "name": "Warehouse-A", ... },
    { "name": "Warehouse-B", ... }
  ]
}
```

## Permission Rules

### Warehouse Operations
| Operation | Admin | User (with warehouses) | User (no warehouses) |
|-----------|-------|------------------------|----------------------|
| GET /api/warehouses | See all | See assigned only | See all |
| GET /api/warehouses/:id | ✓ | See if assigned | ✗ Access Denied |
| POST /api/warehouses | ✓ | ✗ Access Denied | ✗ Access Denied |
| PUT /api/warehouses/:id | ✓ | See if assigned | ✗ Access Denied |
| DELETE /api/warehouses/:id | ✓ | ✗ Access Denied | ✗ Access Denied |

### Transfer Operations
| Operation | Admin | Agent (with warehouses) | Analyst |
|-----------|-------|-------------------------|---------|
| GET /api/transfers | See all | See assigned warehouses only | ✗ Access Denied |
| POST /api/transfers | ✓ | Agent role only | ✗ Access Denied |
| PUT /api/transfers/:id | ✓ | If can access warehouse | ✗ Access Denied |
| DELETE /api/transfers/:id | ✓ | ✗ Access Denied | ✗ Access Denied |

### Analytics
| Endpoint | Admin | Non-Admin |
|----------|-------|-----------|
| /api/analytics/metrics | System-wide | Assigned warehouses only |
| /api/analytics/warehouses-summary | All warehouses | Assigned warehouses only |
| /api/analytics/warehouse/:name | Get any | If assigned |
| /api/analytics/transfers-summary | All transfers | Assigned warehouses only |

## Creating Users with Specific Access

### Admin User (See Everything)
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "roles": ["admin"],
    "warehouses": []
  }'
```

### Warehouse Manager (Single Warehouse)
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "roles": ["gestionnaire_entrepot"],
    "warehouses": ["Warehouse-A"]
  }'
```

### Reception Agent (Multiple Warehouses)
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sophie Reception",
    "email": "sophie@example.com",
    "password": "SecurePassword123",
    "roles": ["agent_reception"],
    "warehouses": ["Warehouse-A", "Warehouse-B"]
  }'
```

## Updating User Warehouses

Use PUT to update user's warehouse assignments:

```bash
curl -X PUT http://localhost:4000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "warehouses": ["Warehouse-A", "Warehouse-B", "Warehouse-C"]
  }'
```

## Frontend Integration

The `api.js` helper automatically includes userId in all requests:

```javascript
// Frontend code (no manual userId needed)
const warehouses = await api.getWarehouses();
// Automatically becomes: GET /api/warehouses?userId=...

await api.updateWarehouse(id, {capacity: 500});
// Automatically includes: X-User-ID header
```

## Testing the System

### Test 1: Admin can see all warehouses
```bash
# Create admin (warehouses: [])
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "admin123",
    "roles": ["admin"],
    "warehouses": []
  }'

# Login and get warehouses
curl "http://localhost:4000/api/warehouses?userId=<admin_id>"
# Returns: All 4 warehouses
```

### Test 2: User can see only assigned warehouses
```bash
# Create manager (warehouses: ["Warehouse-A"])
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager",
    "email": "manager@example.com",
    "password": "manager123",
    "roles": ["gestionnaire_entrepot"],
    "warehouses": ["Warehouse-A"]
  }'

# Get warehouses
curl "http://localhost:4000/api/warehouses?userId=<manager_id>"
# Returns: Only Warehouse-A
```

### Test 3: Access denied for unauthorized warehouse
```bash
curl -X PUT http://localhost:4000/api/warehouses/<warehouse_b_id> \
  -H "X-User-ID: <manager_id>" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 1000}'
# Returns: { "success": false, "error": "Access denied" }
```

## Migration from Old System

If you have existing users without warehouse assignments:

1. All existing users with empty `warehouses: []` will have admin privileges
2. Update specific users to restrict their access:
   ```bash
   curl -X PUT http://localhost:4000/api/users/{userId} \
     -d '{"warehouses": ["Warehouse-A", "Warehouse-B"]}'
   ```
3. Update role-based UI to show/hide features based on `req.user.roles`

## Middleware Details

### `authMiddleware.ts` Functions

```typescript
// Extract user from request and populate req.user
authMiddleware(req, res, next)

// Get warehouse filter based on user assignment
getWarehouseFilter(req) → { name: { $in: ['W-A', 'W-B'] } }

// Get transfer filter based on user assignment
getTransferFilter(req) → { $or: [{ fromWarehouse }, { toWarehouse }] }

// Check if user is admin
isAdmin(req) → boolean

// Check if user can access specific warehouse
canAccessWarehouse(req, warehouseName) → boolean
```

## Security Notes

- Never trust client-side userId without server validation
- Always filter results server-side based on `req.user`
- Admins (empty warehouses array) can bypass filters
- Role-based permissions are enforced independently of warehouse assignment
