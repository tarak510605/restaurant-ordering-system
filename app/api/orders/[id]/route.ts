import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Order from '@/lib/models/Order';
import Restaurant from '@/lib/models/Restaurant';
import { requireAuth, validateCountryAccess } from '@/lib/auth/rbac';
import { handleApiError, successResponse, ApiError } from '@/lib/utils/api-response';

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    await connectDB();

    const order = await Order.findById(params.id)
      .populate('user', 'name email')
      .populate('restaurant')
      .populate('paymentMethod')
      .lean();

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user can access this order
    if (user.role.name !== 'Admin' && order.user._id.toString() !== user.id) {
      throw new ApiError('Forbidden - You can only view your own orders', 403);
    }

    // Validate country access
    const restaurant = await Restaurant.findById(order.restaurant._id).lean();
    if (restaurant) {
      validateCountryAccess(user, restaurant.country.toString());
    }

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}
