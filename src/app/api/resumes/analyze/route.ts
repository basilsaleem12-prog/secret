import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { parseResume } from '@/lib/ai/resume-parser';
import { analyzeResumeWithAI } from '@/lib/ai/resume-analyzer';

/**
 * POST /api/resumes/analyze - Analyze uploaded resume with AI
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = (formData.get('resume') || formData.get('file')) as File;
    const resumeId = formData.get('resumeId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse resume to extract text
    console.log(`Parsing resume: ${file.name} (${file.type})`);
    const parseResult = await parseResume(buffer, file.type);

    if (!parseResult.text || parseResult.text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from resume' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${parseResult.wordCount} words from resume`);

    // Analyze resume with AI
    console.log('Analyzing resume with AI...');
    const analysis = await analyzeResumeWithAI(parseResult.text, file.name);

    console.log(`Analysis complete: Score ${analysis.overallScore}/100`);

    // If resumeId is provided, store analysis with the resume
    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
      });

      if (resume && resume.userId === profile.id) {
        // You could store the analysis in a separate table or in metadata
        console.log(`Resume ${resumeId} analyzed successfully`);
      }
    }

    // Return analysis with consistent field names
    return NextResponse.json({
      success: true,
      overallScore: analysis.overallScore,
      experienceLevel: analysis.experienceLevel,
      yearsOfExperience: analysis.yearsOfExperience,
      professionalSummary: analysis.summary, // Map 'summary' to 'professionalSummary'
      detectedSkills: analysis.detectedSkills,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      suggestedJobTitles: analysis.suggestedJobTitles,
      education: analysis.insights.education,
      professionalBackground: analysis.insights.professionalSummary,
      keyAchievements: analysis.insights.keyAchievements,
      wordCount: parseResult.wordCount,
      pageCount: parseResult.pageCount,
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

