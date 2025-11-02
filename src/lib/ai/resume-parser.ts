import * as mammoth from 'mammoth';

interface ResumeParseResult {
  text: string;
  wordCount: number;
  pageCount?: number;
}

/**
 * Extract text from PDF buffer
 * Note: PDF parsing is currently not supported. Please use DOCX or TXT format.
 */
async function parsePDF(buffer: Buffer): Promise<ResumeParseResult> {
  // PDF parsing temporarily disabled - use DOCX or TXT for best results
  return {
    text: `📄 PDF Parsing Not Available

For the best AI analysis experience, please convert your resume to one of these formats:

✅ DOCX (Microsoft Word) - RECOMMENDED
✅ TXT (Plain Text) - Also works great!

How to convert:
1. Open your PDF in any PDF viewer
2. Save As → Choose "Word Document (.docx)" or "Text File (.txt)"
3. Upload the converted file here
4. Get instant AI-powered resume tips!

All AI features work perfectly with DOCX and TXT files.`,
    wordCount: 0,
    pageCount: 1,
  };
}

/**
 * Extract text from DOCX buffer
 */
async function parseDOCX(buffer: Buffer): Promise<ResumeParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Parse resume file and extract text
 * Supports: PDF, DOCX, TXT
 */
export async function parseResume(
  buffer: Buffer,
  mimeType: string
): Promise<ResumeParseResult> {
  try {
    // Handle PDF files
    if (mimeType === 'application/pdf') {
      return await parsePDF(buffer);
    }

    // Handle DOCX files
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await parseDOCX(buffer);
    }

    // Handle plain text files
    if (mimeType === 'text/plain') {
      const text = buffer.toString('utf-8');
      return {
        text,
        wordCount: text.split(/\s+/).length,
      };
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

/**
 * Extract key sections from resume text
 */
export function extractResumeSections(text: string): {
  education?: string;
  experience?: string;
  skills?: string;
  contact?: string;
} {
  const sections: Record<string, string> = {};

  // Common section headers
  const educationKeywords = /(?:education|academic|degree|university|college)/i;
  const experienceKeywords = /(?:experience|employment|work history|professional)/i;
  const skillsKeywords = /(?:skills|technical|competencies|technologies)/i;
  const contactKeywords = /(?:contact|email|phone|address)/i;

  const lines = text.split('\n');
  let currentSection = '';
  let sectionContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;

    // Check if line is a section header
    if (educationKeywords.test(trimmedLine) && trimmedLine.length < 50) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
      }
      currentSection = 'education';
      sectionContent = [];
    } else if (experienceKeywords.test(trimmedLine) && trimmedLine.length < 50) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
      }
      currentSection = 'experience';
      sectionContent = [];
    } else if (skillsKeywords.test(trimmedLine) && trimmedLine.length < 50) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
      }
      currentSection = 'skills';
      sectionContent = [];
    } else if (contactKeywords.test(trimmedLine) && trimmedLine.length < 50) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
      }
      currentSection = 'contact';
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(trimmedLine);
    }
  }

  // Add last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.join('\n');
  }

  return sections;
}

