import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import PaymentMethod from '@/lib/models/PaymentMethod';
import { requireAuth } from '@/lib/auth/rbac';
import { handleApiError, successResponse } from '@/lib/utils/api-response';

// GET all payment methods for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    await connectDB();

    const paymentMethods = await PaymentMethod.find({
      user: user.id,
      isActive: true,
    })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return successResponse(paymentMethods);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create new payment method
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { type, cardNumber, cardHolderName, expiryMonth, expiryYear, upiId, isDefault } = body;

    await connectDB();

    // If this is set as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany(
        { user: user.id },
        { isDefault: false }
      );
    }

    const paymentMethod = await PaymentMethod.create({
      user: user.id,
      type,
      cardNumber,
      cardHolderName,
      expiryMonth,
      expiryYear,
      upiId,
      isDefault: isDefault || false,
    });

    return successResponse(paymentMethod, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
