import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Restaurant from '@/lib/models/Restaurant';
import MenuItem from '@/lib/models/MenuItem';
import { requirePermission, buildCountryFilter } from '@/lib/auth/rbac';
import { handleApiError, successResponse } from '@/lib/utils/api-response';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const user = await requirePermission('viewRestaurants');

    await connectDB();

    // Build country filter based on user role
    const countryFilter = buildCountryFilter(user);

    // Get all restaurants with country filtering
    const restaurants = await Restaurant.find({
      isActive: true,
      ...countryFilter,
    })
      .populate('country')
      .sort({ rating: -1 })
      .lean();

    return successResponse(restaurants);
  } catch (error) {
    return handleApiError(error);
  }
}
