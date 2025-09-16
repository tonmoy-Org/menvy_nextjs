import mongoose from 'mongoose';

export interface ISale extends mongoose.Document {
  _id: string;
  billNo: string;
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  seller: mongoose.Types.ObjectId;
  sellerName: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  paymentMethod: 'cash' | 'card' | 'mobile_banking';
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new mongoose.Schema({
  billNo: {
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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  customer: {
    name: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_banking'],
    default: 'cash',
  },
  isPaid: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});


export default mongoose.models.Sale || mongoose.model<ISale>('Sale', saleSchema);