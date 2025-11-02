import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface MatchScoreRequest {
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string | null;
  jobTags: string[];
  applicantSkills: string[];
  applicantInterests: string[];
  applicantBio: string | null;
  applicantProposal: string | null;
  applicantDepartment: string | null;
  applicantYear: string | null;
}

interface MatchScoreResponse {
  score: number; // 0-100
  reasoning: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

/**
 * Calculate match score between job and applicant using AI
 */
export async function calculateMatchScore(
  request: MatchScoreRequest
): Promise<MatchScoreResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = buildMatchPrompt(request);
    // Use gemini-2.0-flash-exp (experimental model with wider access)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    let aiResponse: MatchScoreResponse;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      // Fallback to basic calculation
      return calculateBasicMatchScore(request);
    }

    // Validate and normalize score
    if (typeof aiResponse.score !== 'number' || aiResponse.score < 0 || aiResponse.score > 100) {
      aiResponse.score = Math.max(0, Math.min(100, Math.round(aiResponse.score)));
    }

    return {
      score: Math.round(aiResponse.score),
      reasoning: aiResponse.reasoning || 'AI analysis completed',
      strengths: aiResponse.strengths || [],
      gaps: aiResponse.gaps || [],
      recommendation: aiResponse.recommendation || '',
    };

  } catch (error) {
    console.error('Error calculating AI match score:', error);
    // Fallback to basic calculation
    return calculateBasicMatchScore(request);
  }
}

/**
 * Build prompt for AI match scoring
 */
function buildMatchPrompt(request: MatchScoreRequest): string {
  return `
You are an expert recruiter analyzing how well a candidate matches a job posting.

JOB DETAILS:
Title: ${request.jobTitle}
Description: ${request.jobDescription}
Requirements: ${request.jobRequirements || 'Not specified'}
Required Skills/Tags: ${request.jobTags.join(', ')}

APPLICANT DETAILS:
Department: ${request.applicantDepartment || 'Not specified'}
Year: ${request.applicantYear || 'Not specified'}
Bio: ${request.applicantBio || 'Not provided'}
Skills: ${request.applicantSkills.length > 0 ? request.applicantSkills.join(', ') : 'None listed'}
Interests: ${request.applicantInterests.length > 0 ? request.applicantInterests.join(', ') : 'None listed'}
Application Proposal: ${request.applicantProposal || 'No proposal provided'}

TASK:
Analyze the match between this candidate and job posting. Consider:
1. Technical skills alignment
2. Experience level (based on year/department)
3. Interest and motivation (from bio and proposal)
4. Cultural fit and enthusiasm
5. Transferable skills

Provide a match score from 0-100 where:
- 90-100: Excellent match, highly recommended
- 75-89: Very good match, strong candidate
- 60-74: Good match, worth considering
- 40-59: Moderate match, some gaps
- 0-39: Poor match, significant gaps

Return your analysis in this EXACT JSON format:
{
  "score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation of the score>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recommendation": "<brief hiring recommendation>"
}
`;
}

/**
 * Fallback: Basic match score calculation without AI
 */
function calculateBasicMatchScore(request: MatchScoreRequest): MatchScoreResponse {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  // Skills matching (40 points max)
  const matchingSkills = request.applicantSkills.filter(skill =>
    request.jobTags.some(tag => 
      tag.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(tag.toLowerCase())
    )
  );
  
  if (request.jobTags.length > 0) {
    const skillScore = (matchingSkills.length / request.jobTags.length) * 40;
    score += skillScore;
    
    if (matchingSkills.length > 0) {
      strengths.push(`Matches ${matchingSkills.length} required skills`);
    } else {
      gaps.push('No direct skill matches with job requirements');
    }
  }

  // Interests matching (20 points max)
  const matchingInterests = request.applicantInterests.filter(interest =>
    request.jobTags.some(tag => 
      tag.toLowerCase().includes(interest.toLowerCase()) || 
      interest.toLowerCase().includes(tag.toLowerCase())
    )
  );
  
  if (matchingInterests.length > 0) {
    score += Math.min(20, matchingInterests.length * 7);
    strengths.push('Interests align with job domain');
  }

  // Profile completeness (20 points max)
  let completeness = 0;
  if (request.applicantBio) completeness += 5;
  if (request.applicantSkills.length > 0) completeness += 7;
  if (request.applicantProposal) completeness += 8;
  score += completeness;

  if (completeness > 15) {
    strengths.push('Strong application with detailed information');
  } else {
    gaps.push('Limited profile information provided');
  }

  // Department relevance (10 points max)
  if (request.applicantDepartment) {
    const deptRelevant = request.jobDescription.toLowerCase().includes(request.applicantDepartment.toLowerCase());
    if (deptRelevant) {
      score += 10;
      strengths.push('Relevant academic background');
    }
  }

  // Proposal quality (10 points max)
  if (request.applicantProposal && request.applicantProposal.length > 100) {
    score += 10;
    strengths.push('Thoughtful application proposal');
  } else if (!request.applicantProposal) {
    gaps.push('No application proposal provided');
  }

  // Ensure we have at least some gaps if score is low
  if (score < 60 && gaps.length === 0) {
    gaps.push('Profile could be more complete');
    gaps.push('Limited skill matches');
  }

  // Ensure we have strengths if score is decent
  if (score >= 60 && strengths.length === 0) {
    strengths.push('Reasonable fit for the position');
  }

  score = Math.round(Math.min(100, Math.max(0, score)));

  let recommendation = '';
  if (score >= 75) {
    recommendation = 'Strong candidate - Recommend for interview';
  } else if (score >= 60) {
    recommendation = 'Good candidate - Worth considering';
  } else if (score >= 40) {
    recommendation = 'Moderate fit - Review carefully';
  } else {
    recommendation = 'May not be the best fit for this role';
  }

  return {
    score,
    reasoning: `Calculated based on skill alignment (${matchingSkills.length}/${request.jobTags.length} matches), profile completeness, and relevant experience.`,
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 3),
    recommendation,
  };
}

/**
 * Calculate simple percentage match (for quick display)
 */
export function calculateSimpleMatch(
  jobTags: string[],
  applicantSkills: string[],
  applicantInterests: string[]
): number {
  if (jobTags.length === 0) return 0;

  const allUserTags = [...applicantSkills, ...applicantInterests];
  const matchingTags = jobTags.filter(tag =>
    allUserTags.some(userTag =>
      tag.toLowerCase().includes(userTag.toLowerCase()) ||
      userTag.toLowerCase().includes(tag.toLowerCase())
    )
  );

  return Math.floor((matchingTags.length / jobTags.length) * 100);
}

