import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICountry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: [true, 'Country name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Country code is required'],
      unique: true,
      uppercase: true,
      trim: true,
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
CountrySchema.index({ isActive: 1 });

const Country: Model<ICountry> =
  mongoose.models.Country || mongoose.model<ICountry>('Country', CountrySchema);

export default Country;
