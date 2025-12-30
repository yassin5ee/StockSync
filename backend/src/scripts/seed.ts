import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Warehouse from '../models/warehouse';
import User from '../models/user';
import Transfer from '../models/transfer';
import Alert from '../models/alert';
import Product from '../models/product';
import Stock from '../models/stock';
import StockEntry from '../models/stockEntry';
import StockExit from '../models/stockExit';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || '';

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding');

  await Warehouse.deleteMany({});
  await User.deleteMany({});
  await Transfer.deleteMany({});
  await Alert.deleteMany({});
  await Stock.deleteMany({});
  await StockEntry.deleteMany({});
  await StockExit.deleteMany({});
  await Product.deleteMany({});

  const wh1 = await Warehouse.create({ name: 'Entrepôt Paris Nord', location: 'Roissy, France', capacity: 10000, used: 7842, status: 'operational', manager: 'Sophie Martin', productsCount: 2450 });
  const wh2 = await Warehouse.create({ name: 'Entrepôt Lyon Est', location: 'Lyon, France', capacity: 8000, used: 6120, status: 'operational', manager: 'Thomas Bernard', productsCount: 1890 });
  const wh3 = await Warehouse.create({ name: 'Entrepôt Marseille Sud', location: 'Marseille, France', capacity: 6000, used: 4230, status: 'maintenance', manager: 'Julie Petit', productsCount: 1560 });
  const wh4 = await Warehouse.create({ name: 'Entrepôt Bordeaux Ouest', location: 'Bordeaux, France', capacity: 5000, used: 2980, status: 'operational', manager: 'Marc Dubois', productsCount: 980 });

  const FIXED_PASSWORDS = {
    admin: 'Admin@StockSync2024!',
    data_analyst: 'DataAnalyst@2024!',
    warehouse_supervisor: 'Warehouse@Super2024!',
    logistic_admin: 'Logistic@Admin2024!',
    'preparateur commend': 'Preparateur@2024!',
    'agent de reception': 'Reception@Agent2024!'
  };

  const credentials: Array<{email: string, password: string, role: string, name: string}> = [];

  const adminPassword = FIXED_PASSWORDS.admin;
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPassword, adminSalt);
  const admin = await User.create({ 
    firstName: 'Yassine', 
    lastName: 'Amri', 
    email: 'admin@stocksync.com', 
    passwordHash: adminHash, 
    role: 'admin'
  });
  credentials.push({ email: admin.email, password: adminPassword, role: 'admin', name: 'Yassine Amri' });

  const dataAnalystPassword = FIXED_PASSWORDS.data_analyst;
  const dataAnalystSalt = await bcrypt.genSalt(10);
  const dataAnalystHash = await bcrypt.hash(dataAnalystPassword, dataAnalystSalt);
  const dataAnalyst = await User.create({ 
    firstName: 'Sarah', 
    lastName: 'Johnson', 
    email: 'data.analyst@stocksync.com', 
    passwordHash: dataAnalystHash, 
    role: 'data_analyst'
  });
  credentials.push({ email: dataAnalyst.email, password: dataAnalystPassword, role: 'data_analyst', name: 'Sarah Johnson' });

  const warehouseSupervisorPassword = FIXED_PASSWORDS.warehouse_supervisor;
  const warehouseSupervisorSalt = await bcrypt.genSalt(10);
  const warehouseSupervisorHash = await bcrypt.hash(warehouseSupervisorPassword, warehouseSupervisorSalt);
  const warehouseSupervisor = await User.create({ 
    firstName: 'Michael', 
    lastName: 'Chen', 
    email: 'warehouse.supervisor@stocksync.com', 
    passwordHash: warehouseSupervisorHash, 
    role: 'warehouse_supervisor'
  });
  credentials.push({ email: warehouseSupervisor.email, password: warehouseSupervisorPassword, role: 'warehouse_supervisor', name: 'Michael Chen' });

  const logisticAdminPassword = FIXED_PASSWORDS.logistic_admin;
  const logisticAdminSalt = await bcrypt.genSalt(10);
  const logisticAdminHash = await bcrypt.hash(logisticAdminPassword, logisticAdminSalt);
  const logisticAdmin = await User.create({ 
    firstName: 'Emma', 
    lastName: 'Dubois', 
    email: 'logistic.admin@stocksync.com', 
    passwordHash: logisticAdminHash, 
    role: 'logistic_admin'
  });
  credentials.push({ email: logisticAdmin.email, password: logisticAdminPassword, role: 'logistic_admin', name: 'Emma Dubois' });

  const preparateurPassword = FIXED_PASSWORDS['preparateur commend'];
  const preparateurSalt = await bcrypt.genSalt(10);
  const preparateurHash = await bcrypt.hash(preparateurPassword, preparateurSalt);
  const preparateur = await User.create({ 
    firstName: 'Jean', 
    lastName: 'Martin', 
    email: 'preparateur@stocksync.com', 
    passwordHash: preparateurHash, 
    role: 'preparateur commend'
  });
  credentials.push({ email: preparateur.email, password: preparateurPassword, role: 'preparateur commend', name: 'Jean Martin' });

  const agentReceptionPassword = FIXED_PASSWORDS['agent de reception'];
  const agentReceptionSalt = await bcrypt.genSalt(10);
  const agentReceptionHash = await bcrypt.hash(agentReceptionPassword, agentReceptionSalt);
  const agentReception = await User.create({ 
    firstName: 'Marie', 
    lastName: 'Bernard', 
    email: 'agent.reception@stocksync.com', 
    passwordHash: agentReceptionHash, 
    role: 'agent de reception'
  });
  credentials.push({ email: agentReception.email, password: agentReceptionPassword, role: 'agent de reception', name: 'Marie Bernard' });

  await Transfer.create({ fromWarehouse: wh1.name, toWarehouse: wh2.name, items: [{ sku: 'SKU123', quantity: 150 }], status: 'in_transit', scheduledDate: new Date(), estimatedArrival: new Date(Date.now() + 24*60*60*1000) });
  await Transfer.create({ fromWarehouse: wh2.name, toWarehouse: wh3.name, items: [{ sku: 'SKU456', quantity: 85 }], status: 'planned' });

  await Alert.create({ type: 'stock', severity: 'medium', message: 'Stock faible pour produit SKU-7842 à Paris Nord', warehouse: wh1.name });
  await Alert.create({ type: 'performance', severity: 'low', message: 'Performance picking en baisse à Lyon Est', warehouse: wh2.name   });

  console.log('Creating products...');
  const products = [
    { name: 'Ordinateur Portable HP', sku: 'LAP-HP-001', category: 'Électronique', unit: 'unité', min_quantity: 10 },
    { name: 'Souris Sans Fil Logitech', sku: 'MOU-LOG-002', category: 'Électronique', unit: 'unité', min_quantity: 50 },
    { name: 'Clavier Mécanique', sku: 'KEY-MEC-003', category: 'Électronique', unit: 'unité', min_quantity: 30 },
    { name: 'Écran 27 pouces', sku: 'MON-27-004', category: 'Électronique', unit: 'unité', min_quantity: 15 },
    { name: 'Câble HDMI 2m', sku: 'CAB-HDMI-005', category: 'Accessoires', unit: 'unité', min_quantity: 100 },
    { name: 'Webcam HD 1080p', sku: 'CAM-HD-006', category: 'Électronique', unit: 'unité', min_quantity: 25 },
    { name: 'Casque Audio Pro', sku: 'AUD-CAS-007', category: 'Audio', unit: 'unité', min_quantity: 40 },
    { name: 'Microphone USB', sku: 'MIC-USB-008', category: 'Audio', unit: 'unité', min_quantity: 20 },
    { name: 'Tablette Graphique', sku: 'TAB-GRA-009', category: 'Électronique', unit: 'unité', min_quantity: 12 },
    { name: 'Disque Dur Externe 1TB', sku: 'HDD-EXT-010', category: 'Stockage', unit: 'unité', min_quantity: 35 },
    { name: 'SSD 500GB', sku: 'SSD-500-011', category: 'Stockage', unit: 'unité', min_quantity: 60 },
    { name: 'Mémoire RAM 16GB', sku: 'RAM-16-012', category: 'Composants', unit: 'unité', min_quantity: 80 },
    { name: 'Carte Graphique RTX 3060', sku: 'GPU-RTX-013', category: 'Composants', unit: 'unité', min_quantity: 5 },
    { name: 'Alimentation 750W', sku: 'PSU-750-014', category: 'Composants', unit: 'unité', min_quantity: 20 },
    { name: 'Carte Mère ATX', sku: 'MB-ATX-015', category: 'Composants', unit: 'unité', min_quantity: 15 },
    { name: 'Boîtier PC Gaming', sku: 'CASE-GAM-016', category: 'Composants', unit: 'unité', min_quantity: 25 },
    { name: 'Ventilateur 120mm', sku: 'FAN-120-017', category: 'Refroidissement', unit: 'unité', min_quantity: 150 },
    { name: 'Pâte Thermique', sku: 'PAST-THM-018', category: 'Accessoires', unit: 'unité', min_quantity: 200 },
    { name: 'Hub USB 4 Ports', sku: 'HUB-USB-019', category: 'Accessoires', unit: 'unité', min_quantity: 75 },
    { name: 'Adaptateur USB-C', sku: 'ADP-USB-C-020', category: 'Accessoires', unit: 'unité', min_quantity: 120 }
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await Product.create(productData);
    createdProducts.push(product);
  }
  console.log(`Created ${createdProducts.length} products`);

  console.log('Creating stock records...');
  const warehouses = [wh1, wh2, wh3, wh4];
  const stockRecords = [];

  for (const warehouse of warehouses) {
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      const quantity = i < 15 ? Math.floor(Math.random() * 400) + 50 : Math.floor(Math.random() * 100);
      
      const stock = await Stock.create({
        product_id: product._id,
        warehouse_id: warehouse._id,
        quantity: quantity
      });
      stockRecords.push(stock);
    }
  }
  console.log(`Created ${stockRecords.length} stock records`);

  console.log('Creating stock entries...');
  const stockEntries = [];
  const suppliers = ['Fournisseur TechPro', 'Distributeur Electronix', 'Grossiste Digital', 'Importateur Global', 'Fournisseur Premium'];
  
  for (let day = 0; day < 30; day++) {
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - day);
    
    const entriesPerDay = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < entriesPerDay; i++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const randomUser = [admin, agentReception, preparateur][Math.floor(Math.random() * 3)];
      const quantity = Math.floor(Math.random() * 200) + 10;
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];

      const entry = await StockEntry.create({
        product_id: randomProduct._id,
        warehouse_id: randomWarehouse._id,
        user_id: randomUser._id,
        quantity: quantity,
        supplier: supplier,
        document_url: `https://docs.stocksync.com/invoices/INV-${Date.now()}-${i}.pdf`,
        createdAt: entryDate
      });
      stockEntries.push(entry);
    }
  }
  console.log(`Created ${stockEntries.length} stock entries`);

  console.log('Creating stock exits...');
  const stockExits = [];
  const destinations = ['Client ABC', 'Client XYZ', 'Boutique Paris', 'E-commerce', 'Revendeur Lyon', 'Dépôt Marseille'];
  
  for (let day = 0; day < 30; day++) {
    const exitDate = new Date();
    exitDate.setDate(exitDate.getDate() - day);
    
    const exitsPerDay = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < exitsPerDay; i++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const randomUser = [preparateur, agentReception, warehouseSupervisor][Math.floor(Math.random() * 3)];
      const quantity = Math.floor(Math.random() * 150) + 5;
      const destination = destinations[Math.floor(Math.random() * destinations.length)];

      const exit = await StockExit.create({
        product_id: randomProduct._id,
        warehouse_id: randomWarehouse._id,
        user_id: randomUser._id,
        quantity: quantity,
        destination: destination,
        document_url: `https://docs.stocksync.com/deliveries/DEL-${Date.now()}-${i}.pdf`,
        createdAt: exitDate
      });
      stockExits.push(exit);
    }
  }
  console.log(`Created ${stockExits.length} stock exits`);

  const credentialsContent = `# StockSync - Test User Credentials

## Database Setup

1. **Create \`.env\` file** in the \`backend\` directory:
   \`\`\`
   MONGODB_URI=mongodb://localhost:27017/stocksync
   PORT=4000
   \`\`\`

2. **Run the seed script** to populate the database:
   \`\`\`bash
   cd backend
   npm run seed
   \`\`\`

## Test User Credentials

**✅ FIXED PASSWORDS: All users have fixed passwords for easy development/testing.**

${credentials.map((cred, index) => {
  const roleNames: Record<string, string> = {
    'admin': 'Admin',
    'data_analyst': 'Data Analyst',
    'warehouse_supervisor': 'Warehouse Supervisor',
    'logistic_admin': 'Logistic Admin',
    'preparateur commend': 'Préparateur Commandes',
    'agent de reception': 'Agent Réception'
  };
  
  const accessInfo: Record<string, string> = {
    'admin': 'Can access ALL pages',
    'data_analyst': 'Can only access \`/data-analyst\` page',
    'warehouse_supervisor': 'Can only access \`/gestionnaire-entrepot\` page',
    'logistic_admin': 'Can access ALL pages (same as admin)',
    'preparateur commend': 'Can only access \`/preparateur-commandes\` page',
    'agent de reception': 'Can only access \`/agent-reception\` page'
  };
  
  return `### ${roleNames[cred.role]} (${index + 1})
- **Name:** ${cred.name}
- **Email:** \`${cred.email}\`
- **Password:** \`${cred.password}\`
- **Role:** \`${cred.role}\`
- **Access:** ${accessInfo[cred.role]}`;
}).join('\n\n')}

## Role-Based Access Control

- **Admin** and **Logistic Admin**: Can access all pages
- **Other roles**: Can only access their own specific page
- If a user tries to access a page they don't have permission for, they will be redirected to their default page

## Notes

- All passwords are **FIXED** (same every time) for easy development/testing
- Passwords are hashed using bcrypt before storage
- All emails must use the \`@stocksync.com\` domain


---
*Generated on: ${new Date().toISOString()}*
`;

  const credentialsPath = path.join(process.cwd(), '..', 'CREDENTIALS.md');
  fs.writeFileSync(credentialsPath, credentialsContent, 'utf-8');

  console.log('\n=== Seed Complete ===');
  console.log('Test users created with FIXED passwords (for development/testing):');
  console.log('');
  credentials.forEach((cred, index) => {
    console.log(`${index + 1}. ${cred.name} (${cred.role})`);
    console.log(`   Email: ${cred.email}`);
    console.log(`   Password: ${cred.password}`);
    console.log('');
  });
  console.log('\n=== Database Summary ===');
  console.log(`- Warehouses: ${warehouses.length}`);
  console.log(`- Users: ${credentials.length}`);
  console.log(`- Products: ${createdProducts.length}`);
  console.log(`- Stock Records: ${stockRecords.length}`);
  console.log(`- Stock Entries: ${stockEntries.length}`);
  console.log(`- Stock Exits: ${stockExits.length}`);
  console.log(`- Transfers: 2`);
  console.log(`- Alerts: 2`);
  console.log('');
  console.log('✅ Credentials saved to CREDENTIALS.md');
  console.log('✅ Passwords are FIXED - same every time you run the seed script');
  console.log('====================\n');
  
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
