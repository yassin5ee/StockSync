import { Router, Request, Response } from 'express';
import Warehouse from '../models/warehouse';
import { getWarehouseFilter, isAdmin, canAccessWarehouse } from '../middleware/authMiddleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const filter = getWarehouseFilter(req);
  const list = await Warehouse.find(filter).limit(50).lean();
  res.json({ success: true, data: list });
});

router.get('/:id', async (req: Request, res: Response) => {
  const w = await Warehouse.findById(req.params.id).lean();
  if (!w) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  
  if (req.user && !isAdmin(req) && !canAccessWarehouse(req, w.name)) {
    return res.status(403).json({ success: false, error: { message: 'Access denied' } });
  }
  
  res.json({ success: true, data: w });
});

router.post('/', async (req: Request, res: Response) => {
  if (req.user && !isAdmin(req)) {
    return res.status(403).json({ success: false, error: { message: 'Only admins can create warehouses' } });
  }
  
  const payload = req.body;
  const created = await Warehouse.create(payload);
  res.status(201).json({ success: true, data: created });
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const warehouse = await Warehouse.findById(id).lean();
  if (!warehouse) {
    return res.status(404).json({ success: false, error: { message: 'Not found' } });
  }
  
  if (req.user && !isAdmin(req) && !canAccessWarehouse(req, warehouse.name)) {
    return res.status(403).json({ success: false, error: { message: 'Access denied' } });
  }
  
  const payload = req.body;
  try {
    const updated = await Warehouse.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const warehouse = await Warehouse.findById(id).lean();
  if (!warehouse) {
    return res.status(404).json({ success: false, error: { message: 'Not found' } });
  }
  
  if (req.user && !isAdmin(req)) {
    return res.status(403).json({ success: false, error: { message: 'Only admins can delete warehouses' } });
  }
  
  try {
    const deleted = await Warehouse.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: deleted });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
