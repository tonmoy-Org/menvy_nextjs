import mongoose from 'mongoose';

export interface ISettings extends mongoose.Document {
  _id: string;
  // Store Settings
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  vatNumber: string;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  dailyReports: boolean;
  
  // Security Settings
  sessionTimeout: number; // in hours
  passwordExpiry: number; // in days
  twoFactorAuth: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  
  // System Settings
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  
  // Receipt Settings
  receiptFooter: string;
  showVAT: boolean;
  vatRate: number;
  autoprint: boolean;
  
  // WhatsApp Settings
  enableWhatsApp: boolean;
  whatsappApiKey: string;
  whatsappInstanceId: string;
  whatsappMessage: string;
  
  // Business Settings
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: string; // daily, weekly, monthly
  backupRetention: number; // days
  
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new mongoose.Schema({
  // Store Settings
  storeName: {
    type: String,
    default: 'Menvy',
    required: true,
  },
  storeAddress: {
    type: String,
    default: 'Magura, Bangladesh',
  },
  storePhone: {
    type: String,
    default: '01708-446607',
  },
  storeEmail: {
    type: String,
    default: 'contact@menvy.store',
  },
  vatNumber: {
    type: String,
    default: '0xxxxxxxxxxxx',
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: false,
  },
  lowStockAlerts: {
    type: Boolean,
    default: true,
  },
  dailyReports: {
    type: Boolean,
    default: true,
  },
  
  // Security Settings
  sessionTimeout: {
    type: Number,
    default: 24, // hours
    min: 1,
    max: 168, // 1 week
  },
  passwordExpiry: {
    type: Number,
    default: 90, // days
    min: 0, // 0 means never expire
  },
  twoFactorAuth: {
    type: Boolean,
    default: false,
  },
  maxLoginAttempts: {
    type: Number,
    default: 5,
    min: 3,
    max: 10,
  },
  lockoutDuration: {
    type: Number,
    default: 15, // minutes
    min: 5,
    max: 60,
  },
  
  // System Settings
  currency: {
    type: String,
    default: 'BDT',
    enum: ['BDT', 'USD', 'EUR', 'GBP'],
  },
  timezone: {
    type: String,
    default: 'Asia/Dhaka',
  },
  dateFormat: {
    type: String,
    default: 'DD/MM/YYYY',
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'bn'],
  },
  
  // Receipt Settings
  receiptFooter: {
    type: String,
    default: 'Thank you for shopping at Menvy!',
  },
  showVAT: {
    type: Boolean,
    default: true,
  },
  vatRate: {
    type: Number,
    default: 15,
    min: 0,
    max: 50,
  },
  autoprint: {
    type: Boolean,
    default: true,
  },
  
  // WhatsApp Settings
  enableWhatsApp: {
    type: Boolean,
    default: false,
  },
  whatsappApiKey: {
    type: String,
    default: '',
  },
  whatsappInstanceId: {
    type: String,
    default: '',
  },
  whatsappMessage: {
    type: String,
    default: 'Thank you for your purchase! Here is your invoice from Menvy.',
  },
  
  // Business Settings
  businessHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false },
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false },
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false },
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false },
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false },
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false },
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '20:00' },
      closed: { type: Boolean, default: false },
    },
  },
  
  // Backup Settings
  autoBackup: {
    type: Boolean,
    default: true,
  },
  backupFrequency: {
    type: String,
    default: 'daily',
    enum: ['daily', 'weekly', 'monthly'],
  },
  backupRetention: {
    type: Number,
    default: 30, // days
    min: 7,
    max: 365,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);