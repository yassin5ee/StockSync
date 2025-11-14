import { Router, Request, Response } from 'express';
import Warehouse from '../models/warehouse';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const list = await Warehouse.find().limit(50).lean();
  res.json({ success: true, data: list });
});

router.get('/:id', async (req: Request, res: Response) => {
  const w = await Warehouse.findById(req.params.id).lean();
  if (!w) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  res.json({ success: true, data: w });
});

router.post('/', async (req: Request, res: Response) => {
  const payload = req.body;
  const created = await Warehouse.create(payload);
  res.status(201).json({ success: true, data: created });
});

export default router;
