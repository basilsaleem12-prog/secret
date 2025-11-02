import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { refineJobWithAI, generateJobFromRole } from '@/lib/ai/job-refiner';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, currentDescription, currentRequirements, duration, compensation, type, generateFromRole } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    let result;
    
    if (generateFromRole) {
      // Generate complete job posting from just role name
      result = await generateJobFromRole(role, type);
    } else {
      // Refine existing job posting
      result = await refineJobWithAI({
        role,
        currentDescription,
        currentRequirements,
        duration,
        compensation,
        type,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error refining job:', error);
    return NextResponse.json(
      { error: 'Failed to refine job posting' },
      { status: 500 }
    );
  }
}

