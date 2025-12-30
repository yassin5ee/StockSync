import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category?: string;
  unit: string;
  min_quantity: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String },
  unit: { type: String, required: true, default: 'unité' },
  min_quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Product = model<IProduct>('Product', ProductSchema);
export default Product;

