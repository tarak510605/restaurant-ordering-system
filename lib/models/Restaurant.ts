import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  country: mongoose.Types.ObjectId;
  address: string;
  phone: string;
  email: string;
  image: string;
  cuisine: string[];
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: [true, 'Country is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    cuisine: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RestaurantSchema.index({ country: 1 });
RestaurantSchema.index({ isActive: 1 });
RestaurantSchema.index({ name: 'text', description: 'text' });

const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;
