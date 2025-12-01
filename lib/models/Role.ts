import mongoose, { Schema, Document, Model } from 'mongoose';

export type RoleName = 'Admin' | 'Manager' | 'Member';

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  name: RoleName;
  permissions: {
    viewRestaurants: boolean;
    createOrder: boolean;
    checkout: boolean;
    cancelOrder: boolean;
    updatePaymentMethod: boolean;
  };
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      enum: ['Admin', 'Manager', 'Member'],
      trim: true,
    },
    permissions: {
      viewRestaurants: {
        type: Boolean,
        default: false,
      },
      createOrder: {
        type: Boolean,
        default: false,
      },
      checkout: {
        type: Boolean,
        default: false,
      },
      cancelOrder: {
        type: Boolean,
        default: false,
      },
      updatePaymentMethod: {
        type: Boolean,
        default: false,
      },
    },
    description: {
      type: String,
      default: '',
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
RoleSchema.index({ name: 1 });
RoleSchema.index({ isActive: 1 });

const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
