import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentMethodType = 'Credit Card' | 'Debit Card' | 'UPI' | 'Cash on Delivery' | 'Net Banking';

export interface IPaymentMethod extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: PaymentMethodType;
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  upiId?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      required: [true, 'Payment method type is required'],
      enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery', 'Net Banking'],
    },
    cardNumber: {
      type: String,
      default: '',
    },
    cardHolderName: {
      type: String,
      default: '',
    },
    expiryMonth: {
      type: Number,
      min: 1,
      max: 12,
    },
    expiryYear: {
      type: Number,
      min: 2024,
    },
    upiId: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
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
PaymentMethodSchema.index({ user: 1 });
PaymentMethodSchema.index({ isDefault: 1 });
PaymentMethodSchema.index({ isActive: 1 });

const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);

export default PaymentMethod;
