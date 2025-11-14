import { Router, Request, Response } from 'express';
import Transfer from '../models/transfer';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const list = await Transfer.find().limit(50).lean();
  res.json({ success: true, data: list });
});

router.post('/', async (req: Request, res: Response) => {
  const payload = req.body;
  const created = await Transfer.create(payload);
  res.status(201).json({ success: true, data: created });
});

export default router;
