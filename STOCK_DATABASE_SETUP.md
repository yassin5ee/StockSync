# Stock Database Setup - Complete ✅

## 📦 What Has Been Created

Your StockSync database now includes complete stock management tables with test data!

---

## 🗄️ Database Models Created

### 1. **Product Model** (`backend/src/models/product.ts`)
Stores all products that enter/exit stock.

**Fields:**
- `name` - Product name (required)
- `sku` - Unique SKU code (required, unique)
- `category` - Product category (optional)
- `unit` - Unit of measurement (unité, kg, carton...)
- `min_quantity` - Minimum quantity for notifications
- `createdAt` - Creation timestamp

**Example:**
```json
{
  "name": "Ordinateur Portable HP",
  "sku": "LAP-HP-001",
  "category": "Électronique",
  "unit": "unité",
  "min_quantity": 10
}
```

---

### 2. **Stock Model** (`backend/src/models/stock.ts`)
Stores quantity in stock per product per warehouse.

**Fields:**
- `product_id` - Reference to Product (required)
- `warehouse_id` - Reference to Warehouse (required)
- `quantity` - Current stock quantity (default: 0)
- `updatedAt` - Last update timestamp

**Unique Constraint:** One product per warehouse (no duplicates)

**Example:**
```json
{
  "product_id": "65abc123...",
  "warehouse_id": "65def456...",
  "quantity": 245
}
```

---

### 3. **StockEntry Model** (`backend/src/models/stockEntry.ts`)
Stores stock entries (incoming stock).

**Fields:**
- `product_id` - Reference to Product (required)
- `warehouse_id` - Reference to Warehouse (required)
- `user_id` - Reference to User who created entry (required)
- `quantity` - Quantity entered (required)
- `supplier` - Supplier name (optional)
- `document_url` - Invoice/document URL (optional)
- `createdAt` - Entry timestamp

**Example:**
```json
{
  "product_id": "65abc123...",
  "warehouse_id": "65def456...",
  "user_id": "65ghi789...",
  "quantity": 150,
  "supplier": "Fournisseur TechPro",
  "document_url": "https://docs.stocksync.com/invoices/INV-123.pdf"
}
```

---

### 4. **StockExit Model** (`backend/src/models/stockExit.ts`)
Stores stock exits (outgoing stock).

**Fields:**
- `product_id` - Reference to Product (required)
- `warehouse_id` - Reference to Warehouse (required)
- `user_id` - Reference to User who created exit (required)
- `quantity` - Quantity exited (required)
- `destination` - Destination/client name (optional)
- `document_url` - Delivery note/document URL (optional)
- `createdAt` - Exit timestamp

**Example:**
```json
{
  "product_id": "65abc123...",
  "warehouse_id": "65def456...",
  "user_id": "65ghi789...",
  "quantity": 50,
  "destination": "Client ABC",
  "document_url": "https://docs.stocksync.com/deliveries/DEL-456.pdf"
}
```

---

## 📊 Test Data Created

After running `npm run seed`, you now have:

### Products: **20 products**
- Electronics (laptops, monitors, keyboards, mice, webcams)
- Audio equipment (headphones, microphones)
- Storage devices (SSD, HDD, external drives)
- PC components (RAM, GPU, motherboard, PSU, case)
- Accessories (cables, adapters, hubs, thermal paste, fans)

### Stock Records: **80 records**
- 20 products × 4 warehouses = 80 stock records
- Each product has stock in each warehouse
- Quantities range from 0 to 500 units

### Stock Entries: **~99 entries**
- Historical entries for the last 30 days
- 2-5 entries per day
- Various suppliers
- Different products and warehouses
- Linked to users (admin, agent reception, preparateur)

### Stock Exits: **~73 exits**
- Historical exits for the last 30 days
- 1-4 exits per day
- Various destinations/clients
- Different products and warehouses
- Linked to users (preparateur, agent reception, warehouse supervisor)

---

## 🔗 Database Relationships

```
Warehouse (1) ──< (Many) Stock
Product (1) ──< (Many) Stock
Product (1) ──< (Many) StockEntry
Product (1) ──< (Many) StockExit
Warehouse (1) ──< (Many) StockEntry
Warehouse (1) ──< (Many) StockExit
User (1) ──< (Many) StockEntry
User (1) ──< (Many) StockExit
```

---

## 📋 Sample Products Created

1. Ordinateur Portable HP (LAP-HP-001)
2. Souris Sans Fil Logitech (MOU-LOG-002)
3. Clavier Mécanique (KEY-MEC-003)
4. Écran 27 pouces (MON-27-004)
5. Câble HDMI 2m (CAB-HDMI-005)
6. Webcam HD 1080p (CAM-HD-006)
7. Casque Audio Pro (AUD-CAS-007)
8. Microphone USB (MIC-USB-008)
9. Tablette Graphique (TAB-GRA-009)
10. Disque Dur Externe 1TB (HDD-EXT-010)
11. SSD 500GB (SSD-500-011)
12. Mémoire RAM 16GB (RAM-16-012)
13. Carte Graphique RTX 3060 (GPU-RTX-013)
14. Alimentation 750W (PSU-750-014)
15. Carte Mère ATX (MB-ATX-015)
16. Boîtier PC Gaming (CASE-GAM-016)
17. Ventilateur 120mm (FAN-120-017)
18. Pâte Thermique (PAST-THM-018)
19. Hub USB 4 Ports (HUB-USB-019)
20. Adaptateur USB-C (ADP-USB-C-020)

---

## 🎯 Next Steps

Now that you have stock data, you can:

1. **Create API Routes** for:
   - GET `/api/products` - List all products
   - GET `/api/stock` - Get stock by warehouse/product
   - POST `/api/stock/entries` - Create stock entry
   - POST `/api/stock/exits` - Create stock exit
   - GET `/api/stock/entries` - List stock entries
   - GET `/api/stock/exits` - List stock exits

2. **Update Stock Quantities** when entries/exits are created

3. **Add Stock Alerts** when quantity falls below `min_quantity`

4. **Create Frontend Components** to:
   - Display product list
   - Show stock levels per warehouse
   - Record stock entries (agent de reception)
   - Record stock exits (preparateur commandes)
   - View stock history

---

## ✅ Verification

To verify the data was created:

1. **Check MongoDB Compass:**
   - Open `stocksync` database
   - You should see collections:
     - `products` (20 documents)
     - `stocks` (80 documents)
     - `stockentries` (99 documents)
     - `stockexits` (73 documents)

2. **Check Seed Output:**
   - The seed script shows a summary of created data
   - All collections should have data

---

*Stock database setup complete! You now have realistic test data to work with for all stock management features.*

