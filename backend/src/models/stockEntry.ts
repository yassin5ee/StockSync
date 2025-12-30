import { Schema, model, Document, Types } from 'mongoose';

export interface IStockEntry extends Document {
  product_id: Types.ObjectId;
  warehouse_id: Types.ObjectId;
  user_id: Types.ObjectId;
  quantity: number;
  supplier?: string;
  document_url?: string;
  createdAt: Date;
}

const StockEntrySchema = new Schema<IStockEntry>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  supplier: { type: String },
  document_url: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const StockEntry = model<IStockEntry>('StockEntry', StockEntrySchema);
export default StockEntry;

