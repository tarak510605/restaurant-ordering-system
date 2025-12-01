import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Order from '@/lib/models/Order';
import Restaurant from '@/lib/models/Restaurant';
import { requirePermission, validateCountryAccess } from '@/lib/auth/rbac';
import { handleApiError, successResponse, ApiError } from '@/lib/utils/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('cancelOrder');

    await connectDB();

    // Find order
    const order = await Order.findById(params.id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user owns this order (Admin can cancel any order)
    if (user.role.name !== 'Admin' && order.user.toString() !== user.id) {
      throw new ApiError('Forbidden - You can only cancel your own orders', 403);
    }

    // Validate country access
    const restaurant = await Restaurant.findById(order.restaurant).lean();
    if (restaurant) {
      validateCountryAccess(user, restaurant.country.toString());
    }

    // Check if order can be cancelled
    if (order.status === 'Cancelled') {
      throw new ApiError('Order is already cancelled', 400);
    }

    if (order.status === 'Delivered') {
      throw new ApiError('Cannot cancel a delivered order', 400);
    }

    // Cancel order
    order.status = 'Cancelled';
    
    // Refund if already paid
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('restaurant')
      .populate('user', 'name email')
      .populate('paymentMethod')
      .lean();

    return successResponse(updatedOrder);
  } catch (error) {
    return handleApiError(error);
  }
}
