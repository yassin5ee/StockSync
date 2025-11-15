import { Router, Request, Response } from 'express';
import Transfer from '../models/transfer';
import { getTransferFilter, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const filter = getTransferFilter(req);
  const list = await Transfer.find(filter).limit(50).lean();
  res.json({ success: true, data: list });
});

router.post('/', async (req: Request, res: Response) => {
  // Only admins and reception agents can create transfers
  if (req.user && !isAdmin(req) && req.user.role !== 'agent de reception') {
    return res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
  }
  
  const payload = req.body;
  const created = await Transfer.create(payload);
  res.status(201).json({ success: true, data: created });
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Transfer ID is required' } });
  }
  
  const transfer = await Transfer.findById(id).lean();
  
  if (!transfer) {
    return res.status(404).json({ success: false, error: { message: 'Not found' } });
  }
  
  // Check if user can access this transfer's warehouses
  // For now, all authenticated users can access all transfers
  // This can be customized based on role requirements
  if (req.user && !isAdmin(req)) {
    // All non-admin users can access transfers for now
    // This can be customized if warehouse-specific access is needed
  }
  
  const payload = req.body;
  try {
    const updated = await Transfer.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Transfer ID is required' } });
  }
  
  // Only admins can delete transfers
  if (req.user && !isAdmin(req)) {
    return res.status(403).json({ success: false, error: { message: 'Only admins can delete transfers' } });
  }
  
  try {
    const deleted = await Transfer.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: deleted });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
