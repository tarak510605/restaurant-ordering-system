import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
  _id: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Other'],
    },
    image: {
      type: String,
      default: '',
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MenuItemSchema.index({ restaurant: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
