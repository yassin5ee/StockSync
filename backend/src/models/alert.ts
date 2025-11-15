import { Schema, model, Document } from 'mongoose';

export interface IAlert extends Document {
  type: string;
  severity: string;
  message: string;
  warehouse?: string;
  createdAt: Date;
  acknowledged?: boolean;
}

const AlertSchema = new Schema<IAlert>({
  type: { type: String, required: true },
  severity: { type: String, required: true },
  message: { type: String, required: true },
  warehouse: { type: String },
  acknowledged: { type: Boolean, default: false }
}, { timestamps: true });

const Alert = model<IAlert>('Alert', AlertSchema);
export default Alert;
