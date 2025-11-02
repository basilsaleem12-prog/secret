import { GoogleGenerativeAI } from '@google/generative-ai';

interface InterviewTipsRequest {
  jobTitle: string;
  jobDescription: string;
  requirements: string;
  applicantSkills: string[];
  applicantExperience?: string;
}

export interface InterviewTipsResponse {
  commonQuestions: Array<{
    question: string;
    suggestedAnswer: string;
    tips: string;
  }>;
  keyPointsToHighlight: string[];
  thingsToAvoid: string[];
  preparationChecklist: string[];
  overallAdvice: string;
}

/**
 * Generate AI-powered interview tips
 */
export async function generateInterviewTips(
  request: InterviewTipsRequest
): Promise<InterviewTipsResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert career coach specializing in interview preparation. Generate comprehensive interview tips for this candidate.

JOB DETAILS:
- Position: ${request.jobTitle}
- Description: ${request.jobDescription}
- Requirements: ${request.requirements}

CANDIDATE PROFILE:
- Skills: ${request.applicantSkills.join(', ')}
${request.applicantExperience ? `- Experience: ${request.applicantExperience}` : ''}

Generate interview preparation guidance including:
1. 5-7 common interview questions specific to this role
2. Key points the candidate should highlight
3. Things to avoid during the interview
4. Pre-interview preparation checklist
5. Overall advice

Return response in this EXACT JSON format:
{
  "commonQuestions": [
    {
      "question": "Tell me about yourself",
      "suggestedAnswer": "A brief answer template",
      "tips": "How to approach this question"
    }
  ],
  "keyPointsToHighlight": ["Point 1", "Point 2", "Point 3"],
  "thingsToAvoid": ["Mistake 1", "Mistake 2", "Mistake 3"],
  "preparationChecklist": ["Task 1", "Task 2", "Task 3"],
  "overallAdvice": "General interview advice for this role"
}

IMPORTANT:
- Be specific to the role and company
- Provide actionable advice
- Keep answers concise but helpful
- Return ONLY valid JSON`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const data = JSON.parse(jsonMatch[0]) as InterviewTipsResponse;

    return {
      commonQuestions: data.commonQuestions || [],
      keyPointsToHighlight: data.keyPointsToHighlight || [],
      thingsToAvoid: data.thingsToAvoid || [],
      preparationChecklist: data.preparationChecklist || [],
      overallAdvice: data.overallAdvice || 'Prepare thoroughly and be yourself!',
    };
  } catch (error) {
    console.error('Error generating interview tips:', error);
    
    // Fallback interview tips
    return generateFallbackTips(request);
  }
}

/**
 * Generate fallback interview tips
 */
function generateFallbackTips(request: InterviewTipsRequest): InterviewTipsResponse {
  return {
    commonQuestions: [
      {
        question: 'Tell me about yourself and your background',
        suggestedAnswer: 'Provide a brief overview of your education, skills, and what makes you passionate about this field.',
        tips: 'Keep it to 2-3 minutes, focus on relevant experience',
      },
      {
        question: `Why are you interested in this ${request.jobTitle} position?`,
        suggestedAnswer: 'Express genuine interest in the role and explain how it aligns with your career goals.',
        tips: 'Show that you researched the role and company',
      },
      {
        question: 'What are your relevant skills for this position?',
        suggestedAnswer: `Highlight your skills in ${request.applicantSkills.slice(0, 3).join(', ')} and how you've applied them.`,
        tips: 'Use specific examples from your experience',
      },
      {
        question: 'What are your strengths and weaknesses?',
        suggestedAnswer: 'Choose strengths relevant to the role. For weaknesses, mention areas you are actively improving.',
        tips: 'Be honest but strategic in your response',
      },
      {
        question: 'Where do you see yourself in 5 years?',
        suggestedAnswer: 'Express goals that align with potential growth in this role.',
        tips: 'Show ambition while being realistic',
      },
    ],
    keyPointsToHighlight: [
      `Your expertise in ${request.applicantSkills[0] || 'relevant technologies'}`,
      'Your enthusiasm and motivation for the role',
      'Your ability to learn and adapt quickly',
      'Any relevant projects or achievements',
      'Your teamwork and communication skills',
    ],
    thingsToAvoid: [
      'Speaking negatively about previous employers or experiences',
      'Being unprepared with questions about the role',
      'Appearing uninterested or distracted',
      'Exaggerating or lying about your experience',
      'Failing to ask questions at the end',
    ],
    preparationChecklist: [
      'Research the company and understand their mission',
      'Review the job description and requirements thoroughly',
      'Prepare specific examples of your work and achievements',
      'Practice answering common interview questions',
      'Prepare thoughtful questions to ask the interviewer',
      'Test your technology setup if it is a virtual interview',
      'Plan your outfit and arrive/log in 10 minutes early',
    ],
    overallAdvice: `For this ${request.jobTitle} position, focus on demonstrating both your technical skills and your enthusiasm for the role. Be prepared to discuss specific examples of how you've used your skills in ${request.applicantSkills.slice(0, 2).join(' and ')}. Remember to show genuine interest, ask insightful questions, and let your personality shine through. Good luck!`,
  };
}

