import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email/service';

interface CreateProfileBody {
  fullName: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  role: 'FINDER' | 'SEEKER';
  department?: string;
  year?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateProfileBody = await request.json();
    const {
      fullName,
      email,
      avatarUrl,
      bio,
      skills,
      interests,
      role,
      department,
      year,
    } = body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'At least one skill is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: 'At least one interest is required' },
        { status: 400 }
      );
    }

    if (!['FINDER', 'SEEKER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    let profile
    
    if (existingProfile) {
      // Update existing profile with new data
      profile = await prisma.profile.update({
        where: { userId: user.id },
        data: {
          fullName: fullName.trim(),
          email: email || user.email || existingProfile.email,
          avatarUrl: avatarUrl || existingProfile.avatarUrl || null,
          bio: bio?.trim() || existingProfile.bio || null,
          skills,
          interests,
          role,
          department: department || existingProfile.department || null,
          year: year || existingProfile.year || null,
        },
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          fullName: fullName.trim(),
          email: email || user.email,
          avatarUrl: avatarUrl || null,
          bio: bio?.trim() || null,
          skills,
          interests,
          role,
          department: department || null,
          year: year || null,
        },
      })
    }

    // Send welcome email (non-blocking)
    const userEmail = email || user.email
    if (userEmail) {
      sendWelcomeEmail(userEmail, fullName.trim()).catch(err => 
        console.error('Failed to send welcome email:', err)
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        profile,
        message: 'Profile created successfully!' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

interface UpdateProfileBody {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  role?: 'FINDER' | 'SEEKER';
  department?: string;
  year?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdateProfileBody = await request.json();

    // Update profile
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully!' 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}


