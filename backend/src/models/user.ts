import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: string[];
  warehouses: string[];
  lastLogin?: Date;
  status: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['gestionnaire'] },
  warehouses: { type: [String], default: [] },
  lastLogin: { type: Date },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const User = model<IUser>('User', UserSchema);
export default User;
