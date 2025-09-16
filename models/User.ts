import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'seller';
  phone?: string;
  address?: string;
  isActive: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked: boolean;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'seller'],
    default: 'seller',
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  lastLogin: Date,
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: Record<string, any> = { $inc: { loginAttempts: 1 } };
  
  // Get max attempts from settings (default 5)
  const Settings = require('./Settings').default;
  const settings = await Settings.findOne();
  const maxAttempts = settings?.maxLoginAttempts || 5;
  const lockoutDuration = settings?.lockoutDuration || 15; // minutes
  
  // If we have hit max attempts and it's not locked yet, lock the account
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (lockoutDuration * 60 * 1000) };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);