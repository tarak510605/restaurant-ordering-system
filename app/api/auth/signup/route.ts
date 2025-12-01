import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import Country from '@/lib/models/Country';
import { ApiError, handleApiError } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, password, country } = body;

    // Validation
    if (!name || !email || !password || !country) {
      throw new ApiError('All fields are required', 400);
    }

    if (password.length < 6) {
      throw new ApiError('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError('Email already registered', 409);
    }

    // Verify country exists
    const countryDoc = await Country.findById(country);
    if (!countryDoc) {
      throw new ApiError('Invalid country selected', 400);
    }

    // Get Member role (default for public signup)
    const memberRole = await Role.findOne({ name: 'Member' });
    if (!memberRole) {
      throw new ApiError('Member role not found. Please run seed script.', 500);
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: memberRole._id,
      country: countryDoc._id,
      isActive: true,
    });

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: {
        id: memberRole._id.toString(),
        name: memberRole.name,
        permissions: memberRole.permissions,
      },
      country: {
        id: countryDoc._id.toString(),
        name: countryDoc.name,
        code: countryDoc.code,
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
