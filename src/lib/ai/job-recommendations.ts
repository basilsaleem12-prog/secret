import { GoogleGenerativeAI } from '@google/generative-ai';

interface UserProfile {
  fullName: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  department: string | null;
  year: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  tags: string[];
  type: string;
  location: string | null;
}

export interface JobRecommendation {
  jobId: string;
  score: number;
  reasoning: string;
  matchHighlights: string[];
  growthPotential: string;
}

export interface RecommendationResponse {
  recommendations: JobRecommendation[];
  careerInsights: string;
  topSkillsToLearn: string[];
}

/**
 * Get AI-powered job recommendations for a user
 */
export async function getJobRecommendations(
  profile: UserProfile,
  jobs: Job[]
): Promise<RecommendationResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a career advisor AI. Analyze this user's profile and recommend the best jobs for them.

USER PROFILE:
- Name: ${profile.fullName || 'N/A'}
- Bio: ${profile.bio || 'N/A'}
- Skills: ${profile.skills.join(', ') || 'None'}
- Interests: ${profile.interests.join(', ') || 'None'}
- Department: ${profile.department || 'N/A'}
- Year: ${profile.year || 'N/A'}

AVAILABLE JOBS:
${jobs.map((job, idx) => `
${idx + 1}. JOB ID: ${job.id}
   Title: ${job.title}
   Type: ${job.type}
   Location: ${job.location || 'Not specified'}
   Description: ${job.description.substring(0, 300)}...
   Requirements: ${job.requirements || 'Not specified'}
   Tags: ${job.tags.join(', ')}
`).join('\n')}

Analyze ALL jobs and provide recommendations. Return your response in this EXACT JSON format:
{
  "recommendations": [
    {
      "jobId": "job_id_here",
      "score": 95,
      "reasoning": "Why this job is perfect for the user (2-3 sentences)",
      "matchHighlights": ["Skill match", "Interest alignment", "Career growth"],
      "growthPotential": "What the user will learn and how they'll grow"
    }
  ],
  "careerInsights": "Overall career advice for this user (2-3 sentences)",
  "topSkillsToLearn": ["Skill 1", "Skill 2", "Skill 3"]
}

IMPORTANT:
- Recommend TOP 5 jobs maximum (or fewer if less than 5 jobs available)
- Score from 0-100 (higher = better match)
- Order by score (highest first)
- Be specific and personalized
- Consider career growth and learning opportunities
- Match skills, interests, and career stage
- Return ONLY valid JSON, no markdown or extra text`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const data = JSON.parse(jsonMatch[0]) as RecommendationResponse;

    // Validate response
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      throw new Error('Invalid recommendations format');
    }

    // Ensure recommendations exist in jobs list
    const validRecommendations = data.recommendations.filter(rec =>
      jobs.some(job => job.id === rec.jobId)
    );

    return {
      recommendations: validRecommendations.slice(0, 5),
      careerInsights: data.careerInsights || 'Continue building your skills and applying to relevant opportunities.',
      topSkillsToLearn: data.topSkillsToLearn || [],
    };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    
    // Fallback: Simple matching algorithm
    return getFallbackRecommendations(profile, jobs);
  }
}

/**
 * Fallback recommendation system
 */
function getFallbackRecommendations(
  profile: UserProfile,
  jobs: Job[]
): RecommendationResponse {
  const userTags = [...profile.skills, ...profile.interests];
  
  const scoredJobs = jobs.map(job => {
    let score = 0;
    const highlights: string[] = [];

    // Match skills and interests
    const matchingTags = job.tags.filter(tag =>
      userTags.some(userTag =>
        tag.toLowerCase().includes(userTag.toLowerCase()) ||
        userTag.toLowerCase().includes(tag.toLowerCase())
      )
    );

    if (matchingTags.length > 0) {
      score += (matchingTags.length / Math.max(job.tags.length, 1)) * 60;
      highlights.push(`${matchingTags.length} matching skill${matchingTags.length > 1 ? 's' : ''}`);
    }

    // Match keywords in description
    const descLower = job.description.toLowerCase();
    const bioLower = (profile.bio || '').toLowerCase();
    userTags.forEach(tag => {
      if (descLower.includes(tag.toLowerCase())) {
        score += 5;
      }
      if (bioLower && tag.toLowerCase().length > 3 && descLower.includes(tag.toLowerCase())) {
        highlights.push(`Relevant experience in ${tag}`);
      }
    });

    // Department/Year bonus
    if (profile.department && job.tags.some(tag => 
      tag.toLowerCase().includes(profile.department!.toLowerCase())
    )) {
      score += 10;
      highlights.push('Department match');
    }

    return {
      jobId: job.id,
      score: Math.min(Math.round(score), 100),
      reasoning: `This position matches your profile with ${matchingTags.length} overlapping skills and relevant requirements.`,
      matchHighlights: highlights.length > 0 ? highlights : ['General fit based on profile'],
      growthPotential: 'Opportunity to expand your skills and gain valuable experience.',
    };
  });

  // Sort by score and take top 5
  const recommendations = scoredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    recommendations,
    careerInsights: 'Focus on roles that match your current skills while offering growth opportunities.',
    topSkillsToLearn: ['Communication', 'Problem Solving', 'Leadership'],
  };
}

