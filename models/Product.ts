import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  _id: string;
  name: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  sku: string;
  size?: string;
  color?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minStock: {
    type: Number,
    default: 5,
    min: 0,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);