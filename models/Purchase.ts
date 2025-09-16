import mongoose from 'mongoose';

export interface IPurchase extends mongoose.Document {
  _id: string;
  purchaseNo: string;
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
  supplier: {
    name: string;
    phone?: string;
    address?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new mongoose.Schema({
  purchaseNo: {
    type: String,
    required: true,
    unique: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  supplier: {
    name: {
      type: String,
      required: true,
    },
    phone: String,
    address: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', purchaseSchema);