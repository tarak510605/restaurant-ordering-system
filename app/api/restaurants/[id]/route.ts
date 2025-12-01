import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Restaurant from '@/lib/models/Restaurant';
import MenuItem from '@/lib/models/MenuItem';
import { requirePermission, validateCountryAccess } from '@/lib/auth/rbac';
import { handleApiError, successResponse, ApiError } from '@/lib/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('viewRestaurants');

    await connectDB();

    const restaurant = await Restaurant.findById(params.id)
      .populate('country')
      .lean();

    if (!restaurant) {
      throw new ApiError('Restaurant not found', 404);
    }

    // Validate country access
    validateCountryAccess(user, restaurant.country._id.toString());

    // Get menu items for this restaurant
    const menuItems = await MenuItem.find({
      restaurant: params.id,
      isAvailable: true,
    })
      .sort({ category: 1, name: 1 })
      .lean();

    return successResponse({
      restaurant,
      menuItems,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
