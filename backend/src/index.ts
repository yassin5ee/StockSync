import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { json } from 'body-parser';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || '';

const app = express();
app.use(helmet());
app.use(cors());
app.use(json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Minimal routes placeholder
import warehousesRouter from './routes/warehouses';
import transfersRouter from './routes/transfers';
import usersRouter from './routes/users';
import alertsRouter from './routes/alerts';
import configRouter from './routes/config';

app.use('/api/warehouses', warehousesRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/users', usersRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/config', configRouter);

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
