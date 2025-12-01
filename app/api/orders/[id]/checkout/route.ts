import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Order from '@/lib/models/Order';
import PaymentMethod from '@/lib/models/PaymentMethod';
import Restaurant from '@/lib/models/Restaurant';
import { requirePermission, validateCountryAccess } from '@/lib/auth/rbac';
import { handleApiError, successResponse, ApiError } from '@/lib/utils/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('checkout');

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      throw new ApiError('Payment method is required', 400);
    }

    await connectDB();

    // Find order
    const order = await Order.findById(params.id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user owns this order
    if (order.user.toString() !== user.id) {
      throw new ApiError('Forbidden - You can only checkout your own orders', 403);
    }

    // Validate country access
    const restaurant = await Restaurant.findById(order.restaurant).lean();
    if (restaurant) {
      validateCountryAccess(user, restaurant.country.toString());
    }

    // Check order status
    if (order.status === 'Cancelled') {
      throw new ApiError('Cannot checkout a cancelled order', 400);
    }

    if (order.paymentStatus === 'Paid') {
      throw new ApiError('Order is already paid', 400);
    }

    // Validate payment method
    const paymentMethod = await PaymentMethod.findById(paymentMethodId).lean();
    if (!paymentMethod) {
      throw new ApiError('Payment method not found', 404);
    }

    // Check if payment method belongs to the order owner
    if (paymentMethod.user.toString() !== order.user.toString()) {
      throw new ApiError('Payment method must belong to the order owner', 403);
    }

    // Update order
    order.paymentMethod = paymentMethod._id;
    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    
    // Set estimated delivery time (45 minutes from now)
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 45);
    order.estimatedDeliveryTime = estimatedTime;

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
