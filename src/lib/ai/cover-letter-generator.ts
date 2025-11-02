import { GoogleGenerativeAI } from '@google/generative-ai';

interface CoverLetterRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  requirements: string;
  applicantName: string;
  applicantBio: string;
  applicantSkills: string[];
  applicantExperience?: string;
}

export interface CoverLetterResponse {
  coverLetter: string;
  tone: 'professional' | 'enthusiastic' | 'creative';
  wordCount: number;
  keyPoints: string[];
}

/**
 * Generate AI-powered cover letter
 */
export async function generateCoverLetter(
  request: CoverLetterRequest
): Promise<CoverLetterResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a professional career advisor and cover letter expert. Write a compelling, personalized cover letter.

JOB DETAILS:
- Position: ${request.jobTitle}
- Company: ${request.companyName}
- Description: ${request.jobDescription}
- Requirements: ${request.requirements}

APPLICANT PROFILE:
- Name: ${request.applicantName}
- Bio: ${request.applicantBio}
- Skills: ${request.applicantSkills.join(', ')}
${request.applicantExperience ? `- Experience: ${request.applicantExperience}` : ''}

Write a professional cover letter that:
1. Opens with a strong, engaging introduction
2. Highlights relevant skills and experiences
3. Shows genuine interest in the role and company
4. Demonstrates how the applicant can add value
5. Ends with a clear call to action
6. Is 250-350 words
7. Uses a professional yet enthusiastic tone

Return response in this EXACT JSON format:
{
  "coverLetter": "Full cover letter text here with proper paragraphs",
  "tone": "professional",
  "wordCount": 300,
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}

IMPORTANT:
- Use proper letter formatting with paragraphs
- Be specific about skills and experiences
- Make it personal and genuine
- Avoid generic templates
- Return ONLY valid JSON`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const data = JSON.parse(jsonMatch[0]) as CoverLetterResponse;

    return {
      coverLetter: data.coverLetter || generateFallbackCoverLetter(request),
      tone: data.tone || 'professional',
      wordCount: data.wordCount || data.coverLetter.split(' ').length,
      keyPoints: data.keyPoints || [],
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    
    // Fallback cover letter
    return {
      coverLetter: generateFallbackCoverLetter(request),
      tone: 'professional',
      wordCount: 250,
      keyPoints: [
        'Relevant skills match',
        'Strong motivation',
        'Ready to contribute',
      ],
    };
  }
}

/**
 * Generate fallback cover letter
 */
function generateFallbackCoverLetter(request: CoverLetterRequest): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${request.jobTitle} position at ${request.companyName}. ${request.applicantBio}

I am particularly drawn to this opportunity because it aligns perfectly with my skills and career goals. With expertise in ${request.applicantSkills.slice(0, 3).join(', ')}, I am confident in my ability to contribute effectively to your team.

The requirements you've outlined for this position match well with my background. I am especially excited about the opportunity to apply my knowledge and grow professionally in a dynamic environment like ${request.companyName}.

I am eager to bring my passion, dedication, and technical skills to your organization. I would welcome the opportunity to discuss how my background and enthusiasm can benefit your team.

Thank you for considering my application. I look forward to the possibility of contributing to ${request.companyName}'s success.

Sincerely,
${request.applicantName}`;
}

