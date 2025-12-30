import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authMiddleware } from './middleware/authMiddleware';

import warehousesRouter from './routes/warehouses';
import transfersRouter from './routes/transfers';
import usersRouter from './routes/users';
import alertsRouter from './routes/alerts';
import configRouter from './routes/config';
import analyticsRouter from './routes/analytics';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || '';

const app = express();

app.use(helmet());

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use('/api/users', usersRouter);

app.use('/api/warehouses', authMiddleware, warehousesRouter);
app.use('/api/transfers', authMiddleware, transfersRouter);
app.use('/api/alerts', authMiddleware, alertsRouter);
app.use('/api/config', authMiddleware, configRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

async function start() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set. See .env.example');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

start();