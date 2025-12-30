import { Schema, model, Document, Types } from 'mongoose';

export interface ITransferItem {
  sku: string;
  quantity: number;
}

export interface ITransfer extends Document {
  fromWarehouse: string;
  toWarehouse: string;
  items: ITransferItem[];
  status: string;
  type?: string;
  destinationLocation?: string;
  scheduledDate?: Date;
  estimatedArrival?: Date;
}

const TransferItemSchema = new Schema<ITransferItem>({
  sku: { type: String, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const TransferSchema = new Schema<ITransfer>({
  fromWarehouse: { type: String, required: true },
  toWarehouse: { type: String, required: true },
  items: { type: [TransferItemSchema], default: [] },
  status: { type: String, default: 'planned' },
  type: { type: String },
  destinationLocation: { type: String },
  scheduledDate: { type: Date },
  estimatedArrival: { type: Date }
}, { timestamps: true });

const Transfer = model<ITransfer>('Transfer', TransferSchema);
export default Transfer;
