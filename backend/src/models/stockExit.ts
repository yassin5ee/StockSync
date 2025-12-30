import { Schema, model, Document, Types } from 'mongoose';

export interface IStockExit extends Document {
  product_id: Types.ObjectId;
  warehouse_id: Types.ObjectId;
  user_id: Types.ObjectId;
  quantity: number;
  destination?: string;
  document_url?: string;
  createdAt: Date;
}

const StockExitSchema = new Schema<IStockExit>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  destination: { type: String },
  document_url: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const StockExit = model<IStockExit>('StockExit', StockExitSchema);
export default StockExit;

