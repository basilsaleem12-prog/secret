import { GoogleGenerativeAI } from '@google/generative-ai';

interface JobRefineRequest {
  role: string;
  currentDescription?: string;
  currentRequirements?: string;
  duration?: string;
  compensation?: string;
  type?: string;
}

export interface JobRefineResponse {
  title: string;
  description: string;
  requirements: string;
  suggestedTags: string[];
  duration: string;
  teamSize: string;
  compensation: string;
}

/**
 * Refine job description and requirements using AI
 */
export async function refineJobWithAI(request: JobRefineRequest): Promise<JobRefineResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert HR professional and job posting specialist. Refine this job posting to be professional, clear, and attractive to candidates.

ROLE: ${request.role}
${request.currentDescription ? `CURRENT DESCRIPTION: ${request.currentDescription}` : ''}
${request.currentRequirements ? `CURRENT REQUIREMENTS: ${request.currentRequirements}` : ''}
${request.type ? `JOB TYPE: ${request.type}` : ''}
${request.duration ? `DURATION: ${request.duration}` : ''}
${request.compensation ? `COMPENSATION: ${request.compensation}` : ''}

Generate a professional job posting with:
1. Polished job title (if needed, improve the provided role)
2. Compelling job description (3-4 paragraphs):
   - What the role involves
   - What makes it exciting
   - What the candidate will learn/achieve
   - Team/project context
3. Clear, specific requirements (5-8 bullet points):
   - Technical skills
   - Soft skills
   - Experience level
   - Other qualifications
4. Relevant tags (5-8 keywords for searchability)
5. Suggested duration (e.g., "3-6 months", "1 semester")
6. Suggested team size (e.g., "2-3 people", "Solo", "4-5 people")
7. Suggested compensation if not provided

Return response in this EXACT JSON format:
{
  "title": "Refined job title",
  "description": "Full professional description...",
  "requirements": "• Requirement 1\\n• Requirement 2\\n• Requirement 3...",
  "suggestedTags": ["Tag1", "Tag2", "Tag3"],
  "duration": "3-6 months",
  "teamSize": "2-3 people",
  "compensation": "Unpaid / Course Credit / $X-$Y"
}

IMPORTANT:
- Be specific and actionable
- Use professional language
- Make requirements clear and achievable
- Ensure tags are relevant and searchable
- Return ONLY valid JSON`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const data = JSON.parse(jsonMatch[0]) as JobRefineResponse;

    return {
      title: data.title || request.role,
      description: data.description || 'No description provided',
      requirements: data.requirements || '',
      suggestedTags: data.suggestedTags || [],
      duration: data.duration || request.duration || 'Flexible',
      teamSize: data.teamSize || 'To be determined',
      compensation: data.compensation || request.compensation || 'To be discussed',
    };
  } catch (error) {
    console.error('Error refining job with AI:', error);
    
    // Fallback response
    return {
      title: request.role,
      description: request.currentDescription || `We are looking for a talented ${request.role} to join our team.`,
      requirements: request.currentRequirements || `• Relevant experience in ${request.role}\n• Strong communication skills\n• Ability to work independently`,
      suggestedTags: [request.role.split(' ')[0], 'Student', 'Campus'],
      duration: request.duration || 'Flexible',
      teamSize: '2-4 people',
      compensation: request.compensation || 'To be discussed',
    };
  }
}

/**
 * Generate complete job description from just a role name
 */
export async function generateJobFromRole(role: string, type?: string): Promise<JobRefineResponse> {
  return refineJobWithAI({
    role,
    type,
  });
}

