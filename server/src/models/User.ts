import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  trials: Array<{
    productId: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'converted';
    convertedToSubscription?: boolean;
  }>;
  subscriptions: Array<{
    productId: string;
    plan: 'monthly' | 'yearly' | 'lifetime';
    status: 'active' | 'cancelled' | 'expired';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    startDate: Date;
    endDate?: Date;
    cancelledAt?: Date;
    amount: number;
    currency: string;
  }>;
  profile: {
    phone?: string;
    country?: string;
    tradingExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferredMarkets?: string[];
    telegramUsername?: string;
    avatar?: string;
  };
  notifications: {
    email: boolean;
    marketing: boolean;
    productUpdates: boolean;
    trialReminders: boolean;
  };
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<any>;
  resetLoginAttempts(): Promise<any>;
  hasActiveTrial(productId: string): boolean;
  hasActiveSubscription(productId: string): boolean;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Email non valida'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  trials: [{
    productId: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'converted'],
      default: 'active'
    },
    convertedToSubscription: {
      type: Boolean,
      default: false
    }
  }],
  subscriptions: [{
    productId: {
      type: String,
      required: true
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    stripeSubscriptionId: String,
    stripeCustomerId: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    cancelledAt: Date,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  }],
  profile: {
    phone: String,
    country: String,
    tradingExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    preferredMarkets: [String],
    telegramUsername: String,
    avatar: String
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: true
    },
    productUpdates: {
      type: Boolean,
      default: true
    },
    trialReminders: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'trials.productId': 1 });
UserSchema.index({ 'subscriptions.stripeCustomerId': 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Method to check if user has active trial for a product
UserSchema.methods.hasActiveTrial = function(productId: string): boolean {
  const trial = this.trials.find((t: any) => 
    t.productId === productId && 
    t.status === 'active' && 
    new Date(t.endDate) > new Date()
  );
  return !!trial;
};

// Method to check if user has active subscription for a product
UserSchema.methods.hasActiveSubscription = function(productId: string): boolean {
  const subscription = this.subscriptions.find((s: any) => 
    s.productId === productId && 
    s.status === 'active'
  );
  return !!subscription;
};

// Handle failed login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock the account after 5 attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
