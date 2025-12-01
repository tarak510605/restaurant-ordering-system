import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Country from '@/lib/models/Country';
import { handleApiError } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const countries = await Country.find().sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: countries,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
