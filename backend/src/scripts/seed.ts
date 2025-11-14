import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Warehouse from '../models/warehouse';
import User from '../models/user';
import Transfer from '../models/transfer';
import Alert from '../models/alert';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || '';

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding');

  // Clear collections (careful in production)
  await Warehouse.deleteMany({});
  await User.deleteMany({});
  await Transfer.deleteMany({});
  await Alert.deleteMany({});

  const wh1 = await Warehouse.create({ name: 'Entrepôt Paris Nord', location: 'Roissy, France', capacity: 10000, used: 7842, status: 'operational', manager: 'Sophie Martin', productsCount: 2450 });
  const wh2 = await Warehouse.create({ name: 'Entrepôt Lyon Est', location: 'Lyon, France', capacity: 8000, used: 6120, status: 'operational', manager: 'Thomas Bernard', productsCount: 1890 });
  const wh3 = await Warehouse.create({ name: 'Entrepôt Marseille Sud', location: 'Marseille, France', capacity: 6000, used: 4230, status: 'maintenance', manager: 'Julie Petit', productsCount: 1560 });
  const wh4 = await Warehouse.create({ name: 'Entrepôt Bordeaux Ouest', location: 'Bordeaux, France', capacity: 5000, used: 2980, status: 'operational', manager: 'Marc Dubois', productsCount: 980 });

  const admin = await User.create({ name: 'Admin Logistique', email: 'admin@stocksync.local', passwordHash: 'placeholder', roles: ['admin_logistique'], warehouses: [] });
  const manager = await User.create({ name: 'Sophie Martin', email: 'sophie.martin@stocksync.local', passwordHash: 'placeholder', roles: ['gestionnaire'], warehouses: [wh1.name] });

  await Transfer.create({ fromWarehouse: wh1.name, toWarehouse: wh2.name, items: [{ sku: 'SKU123', quantity: 150 }], status: 'in_transit', scheduledDate: new Date(), estimatedArrival: new Date(Date.now() + 24*60*60*1000) });
  await Transfer.create({ fromWarehouse: wh2.name, toWarehouse: wh3.name, items: [{ sku: 'SKU456', quantity: 85 }], status: 'planned' });

  await Alert.create({ type: 'stock', severity: 'medium', message: 'Stock faible pour produit SKU-7842 à Paris Nord', warehouse: wh1.name });
  await Alert.create({ type: 'performance', severity: 'low', message: 'Performance picking en baisse à Lyon Est', warehouse: wh2.name });

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
