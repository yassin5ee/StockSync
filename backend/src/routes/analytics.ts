import { Router, Request, Response } from 'express';
import Warehouse from '../models/warehouse';
import Transfer from '../models/transfer';
import User from '../models/user';
import Alert from '../models/alert';
import Product from '../models/product';
import Stock from '../models/stock';
import StockEntry from '../models/stockEntry';
import StockExit from '../models/stockExit';
import { getWarehouseFilter, getTransferFilter, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const warehouseFilter = getWarehouseFilter(req);
    const transferFilter = getTransferFilter(req);
    
    const warehouses = await Warehouse.find(warehouseFilter).lean();
    const transfers = await Transfer.find(transferFilter).lean();
    const alerts = await Alert.find().lean();
    const users = await User.find().lean();

    const warehouseIds = warehouses.map(w => w._id);
    const stockRecords = await Stock.find({ warehouse_id: { $in: warehouseIds } }).lean();
    const products = await Product.find().lean();
    const stockEntries = await StockEntry.find({ warehouse_id: { $in: warehouseIds } }).lean();
    const stockExits = await StockExit.find({ warehouse_id: { $in: warehouseIds } }).lean();

    const totalStockQuantity = stockRecords.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const totalUniqueProducts = products.length;
    const totalStockEntries = stockEntries.length;
    const totalStockExits = stockExits.length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = stockEntries.filter(e => new Date(e.createdAt) >= thirtyDaysAgo).length;
    const recentExits = stockExits.filter(e => new Date(e.createdAt) >= thirtyDaysAgo).length;
    const recentEntriesQuantity = stockEntries
      .filter(e => new Date(e.createdAt) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
    const recentExitsQuantity = stockExits
      .filter(e => new Date(e.createdAt) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + (e.quantity || 0), 0);

    const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0);
    const totalUsed = warehouses.reduce((sum, w) => sum + (w.used || 0), 0);
    const warehouseOccupancy = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

    const operationalWarehouses = warehouses.filter(w => w.status === 'operational').length;
    const totalProducts = totalUniqueProducts;

    const transfersInTransit = transfers.filter(t => t.status === 'in_transit').length;
    const transfersPlanned = transfers.filter(t => t.status === 'planned').length;
    const transfersCompleted = transfers.filter(t => t.status === 'completed').length;

    const alertsHigh = alerts.filter(a => a.severity === 'high').length;
    const alertsMedium = alerts.filter(a => a.severity === 'medium').length;
    const alertsLow = alerts.filter(a => a.severity === 'low').length;

    const roleDistribution: Record<string, number> = {};
    users.forEach(u => {
      if (u.role) {
        roleDistribution[u.role] = (roleDistribution[u.role] || 0) + 1;
      }
    });

    return res.json({
      success: true,
      data: {
        warehouses: {
          total: warehouses.length,
          operational: operationalWarehouses,
          occupancy: warehouseOccupancy,
          totalCapacity,
          totalUsed,
          totalProducts
        },
        stock: {
          totalProducts: totalUniqueProducts,
          totalQuantity: totalStockQuantity,
          totalEntries: totalStockEntries,
          totalExits: totalStockExits,
          recentEntries: recentEntries,
          recentExits: recentExits,
          recentEntriesQuantity: recentEntriesQuantity,
          recentExitsQuantity: recentExitsQuantity
        },
        transfers: {
          inTransit: transfersInTransit,
          planned: transfersPlanned,
          completed: transfersCompleted,
          total: transfers.length
        },
        alerts: {
          high: alertsHigh,
          medium: alertsMedium,
          low: alertsLow,
          total: alerts.length
        },
        users: {
          total: users.length,
          roleDistribution
        }
      }
    });
  } catch (err) {
    console.error('Analytics error', err);
    return res.status(500).json({ success: false, error: 'Failed to compute metrics' });
  }
});

router.get('/warehouses-summary', async (req: Request, res: Response) => {
  try {
    const filter = getWarehouseFilter(req);
    const warehouses = await Warehouse.find(filter).lean();

    const warehouseIds = warehouses.map(w => w._id);
    const stockByWarehouse = await Stock.find({ warehouse_id: { $in: warehouseIds } }).lean();
    
    const summary = warehouses.map(w => {
      const warehouseStock = stockByWarehouse.filter(s => s.warehouse_id.toString() === w._id.toString());
      const totalStockQuantity = warehouseStock.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const uniqueProducts = new Set(warehouseStock.map(s => s.product_id.toString())).size;
      
      return {
        id: w._id,
        name: w.name,
        location: w.location,
        capacity: w.capacity,
        used: w.used,
        occupancyRate: w.capacity > 0 ? Math.round((w.used / w.capacity) * 100) : 0,
        productsCount: uniqueProducts,
        totalProducts: totalStockQuantity,
        status: w.status,
        manager: w.manager
      };
    });

    return res.json({ success: true, data: summary });
  } catch (err) {
    console.error('Warehouse summary error', err);
    return res.status(500).json({ success: false, error: 'Failed to get warehouse summary' });
  }
});

router.get('/warehouse/:name', async (req: Request, res: Response) => {
  try {
    const warehouse = await Warehouse.findOne({ name: req.params.name }).lean();

    if (!warehouse) {
      return res.status(404).json({ success: false, error: 'Warehouse not found' });
    }
    
    if (req.user && !isAdmin(req)) {
    }

    const warehouseStock = await Stock.find({ warehouse_id: warehouse._id }).populate('product_id').lean();
    const totalStockQuantity = warehouseStock.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const uniqueProducts = new Set(warehouseStock.map(s => s.product_id?.toString())).size;
    
    const entries = await StockEntry.find({ warehouse_id: warehouse._id }).lean();
    const exits = await StockExit.find({ warehouse_id: warehouse._id }).lean();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = entries.filter(e => new Date(e.createdAt) >= thirtyDaysAgo);
    const recentExits = exits.filter(e => new Date(e.createdAt) >= thirtyDaysAgo);

    const detail = {
      id: warehouse._id,
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      used: warehouse.used,
      occupancyRate: warehouse.capacity > 0 ? Math.round((warehouse.used / warehouse.capacity) * 100) : 0,
      productsCount: uniqueProducts,
      totalProducts: totalStockQuantity,
      status: warehouse.status,
      manager: warehouse.manager,
      stock: {
        totalQuantity: totalStockQuantity,
        uniqueProducts: uniqueProducts,
        totalEntries: entries.length,
        totalExits: exits.length,
        recentEntries: recentEntries.length,
        recentExits: recentExits.length
      }
    };

    return res.json({ success: true, data: detail });
  } catch (err) {
    console.error('Warehouse detail error', err);
    return res.status(500).json({ success: false, error: 'Failed to get warehouse detail' });
  }
});

router.get('/transfers-summary', async (req: Request, res: Response) => {
  try {
    const filter = getTransferFilter(req);
    const transfers = await Transfer.find(filter).lean();

    const byStatus = {
      planned: transfers.filter(t => t.status === 'planned').length,
      in_transit: transfers.filter(t => t.status === 'in_transit').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      cancelled: transfers.filter(t => t.status === 'cancelled').length
    };

    const totalItems = transfers.reduce((sum, t) => {
      const items = t.items || [];
      return sum + items.reduce((s, i) => s + (i.quantity || 0), 0);
    }, 0);

    return res.json({
      success: true,
      data: {
        byStatus,
        totalTransfers: transfers.length,
        totalItems,
        transfers: transfers.slice(0, 20)
      }
    });
  } catch (err) {
    console.error('Transfer summary error', err);
    return res.status(500).json({ success: false, error: 'Failed to get transfer summary' });
  }
});

router.get('/alerts-summary', async (_req: Request, res: Response) => {
  try {
    const alerts = await Alert.find().lean();

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    alerts.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
      bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        byType,
        bySeverity,
        total: alerts.length,
        recent: alerts.slice(-10).reverse()
      }
    });
  } catch (err) {
    console.error('Alerts summary error', err);
    return res.status(500).json({ success: false, error: 'Failed to get alerts summary' });
  }
});

router.get('/stock-statistics', async (req: Request, res: Response) => {
  try {
    const warehouseFilter = getWarehouseFilter(req);
    const warehouses = await Warehouse.find(warehouseFilter).lean();
    const warehouseIds = warehouses.map(w => w._id);

    const stockRecords = await Stock.find({ warehouse_id: { $in: warehouseIds } })
      .populate('product_id')
      .populate('warehouse_id')
      .lean();
    
    const products = await Product.find().lean();
    const stockEntries = await StockEntry.find({ warehouse_id: { $in: warehouseIds } })
      .populate('product_id')
      .populate('user_id')
      .lean();
    const stockExits = await StockExit.find({ warehouse_id: { $in: warehouseIds } })
      .populate('product_id')
      .populate('user_id')
      .lean();

    const totalStockQuantity = stockRecords.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const totalUniqueProducts = products.length;
    
    const lowStockProducts = [];
    for (const stock of stockRecords) {
      const product = products.find(p => p._id.toString() === stock.product_id.toString());
      if (product && stock.quantity < product.min_quantity) {
        lowStockProducts.push({
          product: product.name,
          sku: product.sku,
          current: stock.quantity,
          minimum: product.min_quantity,
          warehouse: warehouses.find(w => w._id.toString() === stock.warehouse_id.toString())?.name
        });
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = stockEntries.filter(e => new Date(e.createdAt) >= thirtyDaysAgo);
    const recentExits = stockExits.filter(e => new Date(e.createdAt) >= thirtyDaysAgo);

    const stockByCategory: Record<string, number> = {};
    products.forEach(p => {
      if (p.category) {
        const categoryStock = stockRecords
          .filter(s => s.product_id.toString() === p._id.toString())
          .reduce((sum, s) => sum + (s.quantity || 0), 0);
        stockByCategory[p.category] = (stockByCategory[p.category] || 0) + categoryStock;
      }
    });

    return res.json({
      success: true,
      data: {
        totalProducts: totalUniqueProducts,
        totalStockQuantity: totalStockQuantity,
        totalEntries: stockEntries.length,
        totalExits: stockExits.length,
        recentEntries: recentEntries.length,
        recentExits: recentExits.length,
        recentEntriesQuantity: recentEntries.reduce((sum, e) => sum + (e.quantity || 0), 0),
        recentExitsQuantity: recentExits.reduce((sum, e) => sum + (e.quantity || 0), 0),
        lowStockProducts: lowStockProducts.slice(0, 10),
        stockByCategory
      }
    });
  } catch (err) {
    console.error('Stock statistics error', err);
    return res.status(500).json({ success: false, error: 'Failed to get stock statistics' });
  }
});

router.get('/order-volume', async (req: Request, res: Response) => {
  try {
    const warehouseFilter = getWarehouseFilter(req);
    const warehouses = await Warehouse.find(warehouseFilter).lean();
    const warehouseIds = warehouses.map(w => w._id);

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const monthlyData: Record<number, number> = {};
    
    const stockExits = await StockExit.find({ warehouse_id: { $in: warehouseIds } }).lean();
    
    stockExits.forEach(exit => {
      const date = new Date(exit.createdAt);
      const month = date.getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const result = monthNames.map((name, index) => ({
      name,
      value: monthlyData[index] || 0
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Order volume error', err);
    return res.status(500).json({ success: false, error: 'Failed to get order volume' });
  }
});

router.get('/stock/:warehouseId', async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    
    const stock = await Stock.find({ warehouse_id: warehouseId })
      .populate('product_id')
      .populate('warehouse_id')
      .lean();

    const stockList = stock.map(s => ({
      id: s._id,
      product: {
        id: s.product_id?._id || s.product_id,
        name: (s.product_id as any)?.name || 'Unknown',
        sku: (s.product_id as any)?.sku || 'N/A',
        category: (s.product_id as any)?.category || '',
        unit: (s.product_id as any)?.unit || 'unité',
        min_quantity: (s.product_id as any)?.min_quantity || 0
      },
      warehouse: {
        id: s.warehouse_id?._id || s.warehouse_id,
        name: (s.warehouse_id as any)?.name || 'Unknown'
      },
      quantity: s.quantity || 0,
      updatedAt: s.updatedAt
    }));

    return res.json({ success: true, data: stockList });
  } catch (err) {
    console.error('Get stock by warehouse error', err);
    return res.status(500).json({ success: false, error: 'Failed to get stock' });
  }
});

export default router;
