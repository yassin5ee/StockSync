import { Schema, model, Document, Types } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  location?: string;
  capacity: number;
  used: number;
  status: string;
  manager?: string;
  productsCount: number;
}

const WarehouseSchema = new Schema<IWarehouse>({
  name: { type: String, required: true },
  location: { type: String },
  capacity: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  status: { type: String, default: 'operational' },
  manager: { type: String },
  productsCount: { type: Number, default: 0 }
}, { timestamps: true });

const Warehouse = model<IWarehouse>('Warehouse', WarehouseSchema);
export default Warehouse;
