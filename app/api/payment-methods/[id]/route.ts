import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import PaymentMethod from '@/lib/models/PaymentMethod';
import { requirePermission, requireAuth } from '@/lib/auth/rbac';
import { handleApiError, successResponse, ApiError } from '@/lib/utils/api-response';

// PATCH update payment method
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only Admin can update payment methods (as per RBAC table)
    const user = await requirePermission('updatePaymentMethod');

    const body = await request.json();

    await connectDB();

    const paymentMethod = await PaymentMethod.findById(params.id);
    if (!paymentMethod) {
      throw new ApiError('Payment method not found', 404);
    }

    // Update fields
    if (body.type) paymentMethod.type = body.type;
    if (body.cardNumber) paymentMethod.cardNumber = body.cardNumber;
    if (body.cardHolderName) paymentMethod.cardHolderName = body.cardHolderName;
    if (body.expiryMonth) paymentMethod.expiryMonth = body.expiryMonth;
    if (body.expiryYear) paymentMethod.expiryYear = body.expiryYear;
    if (body.upiId) paymentMethod.upiId = body.upiId;
    
    if (body.isDefault !== undefined) {
      if (body.isDefault) {
        // Unset other defaults for this user
        await PaymentMethod.updateMany(
          { user: paymentMethod.user },
          { isDefault: false }
        );
      }
      paymentMethod.isDefault = body.isDefault;
    }

    if (body.isActive !== undefined) {
      paymentMethod.isActive = body.isActive;
    }

    await paymentMethod.save();

    return successResponse(paymentMethod);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    await connectDB();

    const paymentMethod = await PaymentMethod.findById(params.id);
    if (!paymentMethod) {
      throw new ApiError('Payment method not found', 404);
    }

    // Check if user owns this payment method or is Admin
    if (user.role.name !== 'Admin' && paymentMethod.user.toString() !== user.id) {
      throw new ApiError('Forbidden - You can only delete your own payment methods', 403);
    }

    // Soft delete
    paymentMethod.isActive = false;
    await paymentMethod.save();

    return successResponse({ message: 'Payment method deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
