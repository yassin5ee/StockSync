import { Schema, model, Document, Types } from 'mongoose';

export interface IStock extends Document {
  product_id: Types.ObjectId;
  warehouse_id: Types.ObjectId;
  quantity: number;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

StockSchema.index({ product_id: 1, warehouse_id: 1 }, { unique: true });

const Stock = model<IStock>('Stock', StockSchema);
export default Stock;

