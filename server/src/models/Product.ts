import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  category: 'bot' | 'indicator' | 'course' | 'service';
  description: string;
  shortDescription: string;
  price: {
    monthly: number;
    yearly: number;
    lifetime?: number;
  };
  stripePriceIds: {
    monthly?: string;
    yearly?: string;
    lifetime?: string;
  };
  features: string[];
  performance?: {
    winRate: string;
    avgProfit: string;
    drawdown: string;
    trades: string;
  };
  trial: {
    available: boolean;
    days: number;
    features?: string[];
  };
  status: 'active' | 'coming-soon' | 'beta' | 'soldout';
  badge?: string;
  image?: string;
  videoUrl?: string;
  documentation?: string;
  requirements?: string[];
  platforms?: string[];
  downloadUrl?: string;
  version?: string;
  lastUpdated?: Date;
  totalUsers: number;
  totalTrials: number;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['bot', 'indicator', 'course', 'service'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  price: {
    monthly: {
      type: Number,
      default: 0
    },
    yearly: {
      type: Number,
      default: 0
    },
    lifetime: {
      type: Number
    }
  },
  stripePriceIds: {
    monthly: String,
    yearly: String,
    lifetime: String
  },
  features: [{
    type: String
  }],
  performance: {
    winRate: String,
    avgProfit: String,
    drawdown: String,
    trades: String
  },
  trial: {
    available: {
      type: Boolean,
      default: false
    },
    days: {
      type: Number,
      default: 0
    },
    features: [String]
  },
  status: {
    type: String,
    enum: ['active', 'coming-soon', 'beta', 'soldout'],
    default: 'active'
  },
  badge: String,
  image: String,
  videoUrl: String,
  documentation: String,
  requirements: [String],
  platforms: [String],
  downloadUrl: String,
  version: String,
  lastUpdated: Date,
  totalUsers: {
    type: Number,
    default: 0
  },
  totalTrials: {
    type: Number,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
ProductSchema.index({ id: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ 'price.monthly': 1 });

// Virtual for formatted price
ProductSchema.virtual('formattedPrice').get(function() {
  if (this.price.monthly === 0) return 'Gratis';
  return `€${this.price.monthly}/mese`;
});

// Method to check if product is available for purchase
ProductSchema.methods.isAvailable = function(): boolean {
  return this.status === 'active' || this.status === 'beta';
};

// Method to increment trial count
ProductSchema.methods.incrementTrialCount = function() {
  return this.updateOne({ $inc: { totalTrials: 1 } });
};

// Method to increment user count
ProductSchema.methods.incrementUserCount = function() {
  return this.updateOne({ $inc: { totalUsers: 1 } });
};

// Static method to get featured products
ProductSchema.statics.getFeatured = function() {
  return this.find({
    status: 'active',
    badge: { $in: ['BEST SELLER', 'POPOLARE', 'HIGH SPEED'] }
  }).limit(3);
};

// Static method to get products by category
ProductSchema.statics.getByCategory = function(category: string) {
  return this.find({ category, status: { $in: ['active', 'beta'] } });
};

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
