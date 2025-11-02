import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ProfileRatingResponse {
  rating: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        fullName: true,
        email: true,
        bio: true,
        skills: true,
        interests: true,
        role: true,
        department: true,
        year: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Build profile context for AI
    const profileContext = `
Profile Analysis Request:

Full Name: ${profile.fullName || 'Not provided'}
Role: ${profile.role === 'SEEKER' ? 'Talent Seeker' : 'Talent Finder'}
Department: ${profile.department || 'Not provided'}
Year: ${profile.year || 'Not provided'}
Bio: ${profile.bio || 'Not provided'}
Skills: ${profile.skills && profile.skills.length > 0 ? profile.skills.join(', ') : 'No skills listed'}
Interests: ${profile.interests && profile.interests.length > 0 ? profile.interests.join(', ') : 'No interests listed'}
Profile Completeness: ${calculateProfileCompleteness(profile)}%

Please analyze this profile and provide:
1. An overall rating out of 10
2. A brief summary (2-3 sentences)
3. Three key strengths
4. Three areas for improvement
5. Detailed feedback on how to improve the profile

Format your response EXACTLY as JSON with this structure:
{
  "rating": <number between 1-10>,
  "summary": "<brief summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "feedback": "<detailed feedback paragraph>"
}
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent(profileContext);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let aiResponse: ProfileRatingResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      // Fallback response if parsing fails
      aiResponse = {
        rating: 5,
        summary: 'Unable to generate detailed analysis at this time.',
        strengths: ['Profile exists', 'Account is active', 'Basic information provided'],
        improvements: ['Add more details to bio', 'List more skills', 'Expand interests'],
        feedback: text.substring(0, 500), // Use raw response as feedback
      };
    }

    // Validate rating is between 1-10
    if (aiResponse.rating < 1 || aiResponse.rating > 10) {
      aiResponse.rating = Math.max(1, Math.min(10, aiResponse.rating));
    }

    return NextResponse.json({
      success: true,
      data: {
        rating: aiResponse.rating,
        summary: aiResponse.summary,
        strengths: aiResponse.strengths || [],
        improvements: aiResponse.improvements || [],
        feedback: aiResponse.feedback,
        profileCompleteness: calculateProfileCompleteness(profile),
      },
    });

  } catch (error) {
    console.error('Error rating profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to rate profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(profile: {
  fullName: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  department: string | null;
  year: string | null;
}): number {
  let completeness = 0;
  const fields = [
    { value: profile.fullName, weight: 15 },
    { value: profile.bio, weight: 20 },
    { value: profile.skills && profile.skills.length > 0, weight: 25 },
    { value: profile.interests && profile.interests.length > 0, weight: 20 },
    { value: profile.department, weight: 10 },
    { value: profile.year, weight: 10 },
  ];

  fields.forEach(field => {
    if (field.value) {
      completeness += field.weight;
    }
  });

  return Math.round(completeness);
}

