import { Router, Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const list = await User.find().limit(50).lean();
  res.json({ success: true, data: list });
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(`Attempting login for email: ${email}`);
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const escaped = String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: { $regex: `^${escaped}$`, $options: 'i' } });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    console.log(`User found: ${user.firstName} ${user.lastName}, checking password...`);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`Password comparison result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const data = { 
      id: user._id, 
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email, 
      role: user.role,
      accessToken,
      refreshToken
    };
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role = 'agent de reception' } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, error: 'firstName, lastName, email, and password are required' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const created = await User.create({ firstName, lastName, email, passwordHash, role });
    res.status(201).json({ 
      success: true, 
      data: { 
        id: created._id, 
        firstName: created.firstName,
        lastName: created.lastName,
        name: `${created.firstName} ${created.lastName}`,
        email: created.email,
        role: created.role
      } 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, role, password } = req.body;
  try {
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    
    const data = { 
      id: updated._id, 
      firstName: updated.firstName,
      lastName: updated.lastName,
      name: `${updated.firstName} ${updated.lastName}`,
      email: updated.email, 
      role: updated.role 
    };
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ 
      success: true, 
      data: { 
        id: deleted._id, 
        firstName: deleted.firstName,
        lastName: deleted.lastName,
        name: `${deleted.firstName} ${deleted.lastName}`,
        email: deleted.email 
      } 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const { verifyToken } = await import('../utils/jwt');
    const decoded = verifyToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error('Token refresh error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
