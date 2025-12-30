import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user';
import bcrypt from 'bcrypt';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || '';

async function fix() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const newPassword = argv[0] || 'changeme';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const users = await User.find({ $or: [ { passwordHash: 'placeholder' }, { passwordHash: { $not: /^\$2[aby]\$/ } } ] });
    if (!users.length) {
      console.log('No users with placeholder or non-bcrypt passwordHash found');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    for (const u of users) {
      const hash = await bcrypt.hash(newPassword, salt);
      u.passwordHash = hash;
      await u.save();
      console.log(`Updated user ${u.email} password to provided value (stored hashed).`);
    }

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
