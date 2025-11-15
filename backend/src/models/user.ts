import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['admin', 'data_analyst', 'warehouse_supervisor', 'logistic_admin', 'preparateur commend', 'agent de reception'],
    default: 'agent de reception'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = model<IUser>('User', UserSchema);
export default User;
