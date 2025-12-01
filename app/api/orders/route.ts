import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import Restaurant from '@/lib/models/Restaurant';
import { requirePermission, buildCountryFilter, validateCountryAccess } from '@/lib/auth/rbac';
import { handleApiError, successResponse, ApiError } from '@/lib/utils/api-response';

// GET all orders for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('viewRestaurants');

    await connectDB();

    // Admin can see all orders
    // Manager/Member can only see their own orders
    const filter: any = {};
    
    if (user.role.name !== 'Admin') {
      filter.user = user.id;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('restaurant')
      .populate('paymentMethod')
      .sort({ createdAt: -1 })
      .lean();

    // Filter orders by country for Manager/Member
    let filteredOrders = orders;
    if (user.role.name !== 'Admin') {
      filteredOrders = orders.filter((order: any) => {
        return order.restaurant.country.toString() === user.country.id;
      });
    }

    return successResponse(filteredOrders);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('createOrder');

    const body = await request.json();
    const { restaurantId, items, deliveryAddress, specialInstructions } = body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError('Restaurant ID and items are required', 400);
    }

    if (!deliveryAddress) {
      throw new ApiError('Delivery address is required', 400);
    }

    await connectDB();

    // Validate restaurant exists and user has access
    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      throw new ApiError('Restaurant not found', 404);
    }

    // Validate country access
    validateCountryAccess(user, restaurant.country.toString());

    // Validate and calculate order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId).lean();
      
      if (!menuItem) {
        throw new ApiError(`Menu item ${item.menuItemId} not found`, 404);
      }

      if (!menuItem.isAvailable) {
        throw new ApiError(`Menu item ${menuItem.name} is not available`, 400);
      }

      if (menuItem.restaurant.toString() !== restaurantId) {
        throw new ApiError(`Menu item ${menuItem.name} does not belong to this restaurant`, 400);
      }

      const quantity = parseInt(item.quantity) || 1;
      const itemSubtotal = menuItem.price * quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Calculate tax and delivery fee
    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = 50; // Fixed delivery fee
    const total = subtotal + tax + deliveryFee;

    // Create order
    const order = await Order.create({
      user: user.id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      deliveryAddress,
      specialInstructions: specialInstructions || '',
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant')
      .populate('user', 'name email')
      .lean();

    return successResponse(populatedOrder, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
