import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ResumeAnalysis {
  summary: string;
  detectedSkills: string[];
  experienceLevel: 'Entry Level' | 'Junior' | 'Mid Level' | 'Senior' | 'Expert';
  yearsOfExperience: number;
  strengths: string[];
  improvements: string[];
  suggestedJobTitles: string[];
  overallScore: number; // 0-100
  insights: {
    education: string;
    professionalSummary: string;
    keyAchievements: string[];
  };
}

/**
 * Analyze resume text using AI
 */
export async function analyzeResumeWithAI(
  resumeText: string,
  fileName: string
): Promise<ResumeAnalysis> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    if (!resumeText || resumeText.trim().length < 100) {
      throw new Error('Resume text is too short or empty');
    }

    const prompt = buildResumeAnalysisPrompt(resumeText, fileName);
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
    let aiResponse: ResumeAnalysis;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      // Fallback to basic analysis
      return analyzeResumeBasic(resumeText);
    }

    // Validate and normalize the response
    return {
      summary: aiResponse.summary || 'No summary available',
      detectedSkills: Array.isArray(aiResponse.detectedSkills) ? aiResponse.detectedSkills.slice(0, 20) : [],
      experienceLevel: validateExperienceLevel(aiResponse.experienceLevel),
      yearsOfExperience: typeof aiResponse.yearsOfExperience === 'number' ? aiResponse.yearsOfExperience : 0,
      strengths: Array.isArray(aiResponse.strengths) ? aiResponse.strengths.slice(0, 5) : [],
      improvements: Array.isArray(aiResponse.improvements) ? aiResponse.improvements.slice(0, 5) : [],
      suggestedJobTitles: Array.isArray(aiResponse.suggestedJobTitles) ? aiResponse.suggestedJobTitles.slice(0, 5) : [],
      overallScore: Math.max(0, Math.min(100, aiResponse.overallScore || 50)),
      insights: {
        education: aiResponse.insights?.education || 'Not specified',
        professionalSummary: aiResponse.insights?.professionalSummary || 'Not available',
        keyAchievements: Array.isArray(aiResponse.insights?.keyAchievements) ? aiResponse.insights.keyAchievements.slice(0, 3) : [],
      },
    };
  } catch (error) {
    console.error('Error analyzing resume with AI:', error);
    // Fallback to basic analysis
    return analyzeResumeBasic(resumeText);
  }
}

/**
 * Build prompt for AI resume analysis
 */
function buildResumeAnalysisPrompt(resumeText: string, fileName: string): string {
  return `
You are an expert resume analyzer and career counselor. Analyze the following resume and provide detailed insights.

RESUME FILE: ${fileName}
RESUME CONTENT:
${resumeText.substring(0, 8000)} 

ANALYSIS REQUIREMENTS:
1. Extract and list ALL technical and soft skills mentioned
2. Determine experience level (Entry Level, Junior, Mid Level, Senior, Expert)
3. Estimate years of experience
4. Identify key strengths and unique selling points
5. Suggest improvements for the resume
6. Recommend suitable job titles based on skills and experience
7. Rate the resume quality (0-100)
8. Provide professional insights

Return your analysis in this EXACT JSON format:
{
  "summary": "<2-3 sentence professional summary of the candidate>",
  "detectedSkills": ["skill1", "skill2", "skill3", ...],
  "experienceLevel": "<Entry Level|Junior|Mid Level|Senior|Expert>",
  "yearsOfExperience": <number>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>", "<strength 5>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "suggestedJobTitles": ["<job title 1>", "<job title 2>", "<job title 3>"],
  "overallScore": <number 0-100>,
  "insights": {
    "education": "<education background summary>",
    "professionalSummary": "<detailed professional background>",
    "keyAchievements": ["<achievement 1>", "<achievement 2>", "<achievement 3>"]
  }
}
`;
}

/**
 * Validate experience level
 */
function validateExperienceLevel(level: string): ResumeAnalysis['experienceLevel'] {
  const validLevels: ResumeAnalysis['experienceLevel'][] = [
    'Entry Level',
    'Junior',
    'Mid Level',
    'Senior',
    'Expert',
  ];
  
  if (validLevels.includes(level as any)) {
    return level as ResumeAnalysis['experienceLevel'];
  }
  
  return 'Mid Level';
}

/**
 * Fallback: Basic resume analysis without AI
 */
function analyzeResumeBasic(resumeText: string): ResumeAnalysis {
  const text = resumeText.toLowerCase();
  
  // Extract skills using common keywords
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'react', 'angular', 'vue',
    'node.js', 'express', 'django', 'flask', 'spring', 'sql', 'mongodb', 'postgresql',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership',
    'communication', 'problem solving', 'teamwork', 'html', 'css', 'rest api',
  ];
  
  const detectedSkills = commonSkills.filter(skill =>
    text.includes(skill.toLowerCase())
  );

  // Estimate experience
  const experienceKeywords = ['years of experience', 'years experience', 'year experience'];
  let yearsOfExperience = 0;
  
  experienceKeywords.forEach(keyword => {
    const regex = new RegExp(`(\\d+)\\+?\\s*${keyword}`, 'i');
    const match = resumeText.match(regex);
    if (match && match[1]) {
      yearsOfExperience = Math.max(yearsOfExperience, parseInt(match[1]));
    }
  });

  // Determine level
  let experienceLevel: ResumeAnalysis['experienceLevel'] = 'Entry Level';
  if (yearsOfExperience >= 7) experienceLevel = 'Senior';
  else if (yearsOfExperience >= 4) experienceLevel = 'Mid Level';
  else if (yearsOfExperience >= 2) experienceLevel = 'Junior';

  // Basic scoring
  let score = 50;
  if (detectedSkills.length > 10) score += 20;
  else if (detectedSkills.length > 5) score += 10;
  
  if (text.includes('bachelor') || text.includes('degree')) score += 10;
  if (text.includes('master') || text.includes('phd')) score += 10;
  if (text.includes('project') || text.includes('developed')) score += 10;

  return {
    summary: `Professional with ${yearsOfExperience} years of experience and skills in ${detectedSkills.slice(0, 3).join(', ')}.`,
    detectedSkills: detectedSkills.slice(0, 15),
    experienceLevel,
    yearsOfExperience,
    strengths: [
      `${detectedSkills.length} technical skills identified`,
      'Well-structured resume format',
      'Clear professional experience',
    ],
    improvements: [
      'Add more quantifiable achievements',
      'Include specific project outcomes',
      'Expand on technical skills',
    ],
    suggestedJobTitles: ['Software Developer', 'Full Stack Engineer', 'Technical Consultant'],
    overallScore: Math.min(100, score),
    insights: {
      education: 'Education details detected',
      professionalSummary: `${yearsOfExperience} years of professional experience`,
      keyAchievements: ['Multiple technical projects', 'Diverse skill set'],
    },
  };
}

