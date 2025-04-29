import { apiRequest } from './queryClient';

export interface AiTitleSuggestion {
  suggestions: string[];
}

export interface AiSummarySuggestion {
  suggestion: string;
}

/**
 * Generate AI title suggestions based on blog content
 */
export async function getAiTitleSuggestions(content: string): Promise<AiTitleSuggestion> {
  try {
    const response = await apiRequest('POST', '/api/ai/suggestions', {
      content,
      type: 'title'
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error generating AI title suggestions:', error);
    throw new Error('Failed to generate AI title suggestions. Please try again.');
  }
}

/**
 * Generate AI summary suggestion based on blog content
 */
export async function getAiSummarySuggestion(content: string): Promise<AiSummarySuggestion> {
  try {
    const response = await apiRequest('POST', '/api/ai/suggestions', {
      content,
      type: 'summary'
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error generating AI summary suggestion:', error);
    throw new Error('Failed to generate AI summary suggestion. Please try again.');
  }
}
