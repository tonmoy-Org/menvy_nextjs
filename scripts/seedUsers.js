const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menvy';

// User schema (matching the model)
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
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@menvy.store' });
    const existingSeller = await User.findOne({ email: 'seller@menvy.store' });

    if (existingAdmin && existingSeller) {
      console.log('Demo users already exist');
      return;
    }

    // Create admin user
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@menvy.store',
        password: 'admin123',
        role: 'admin',
        phone: '01708-446607',
        address: 'Magura, Bangladesh',
        isActive: true,
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    }

    // Create seller user
    if (!existingSeller) {
      const sellerUser = new User({
        name: 'Seller User',
        email: 'seller@menvy.store',
        password: 'seller123',
        role: 'seller',
        phone: '01708-446608',
        address: 'Magura, Bangladesh',
        isActive: true,
      });

      await sellerUser.save();
      console.log('Seller user created successfully');
    }

    console.log('Demo users seeded successfully!');
    console.log('Admin: admin@menvy.store / admin123');
    console.log('Seller: seller@menvy.store / seller123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedUsers();