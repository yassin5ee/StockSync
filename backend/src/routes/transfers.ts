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
  if (req.user && !isAdmin(req) && 
      req.user.role !== 'agent de reception' && 
      req.user.role !== 'warehouse_supervisor' &&
      req.user.role !== 'logistic_admin') {
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
  
  if (req.user && !isAdmin(req)) {
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
