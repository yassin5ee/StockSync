import { Router, Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const list = await User.find().limit(50).lean();
  res.json({ success: true, data: list });
});

router.post('/', async (req: Request, res: Response) => {
  const { name, email, password, roles = ['gestionnaire'], warehouses = [] } = req.body;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password || 'changeme', salt);
  const created = await User.create({ name, email, passwordHash, roles, warehouses });
  res.status(201).json({ success: true, data: { id: created._id, name: created.name, email: created.email } });
});

export default router;
