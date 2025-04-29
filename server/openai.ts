import OpenAI from "openai";

// Create a new OpenAI client with the API key
// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fallback title suggestions in case the API call fails
export const FALLBACK_TITLE_SUGGESTIONS = [
  "The Future of AI in Content Creation: Opportunities and Challenges",
  "How AI is Revolutionizing the Way We Create and Consume Content",
  "AI-Powered Writing: The New Frontier in Digital Content",
  "Artificial Intelligence and Content Creation: A Game-Changing Partnership",
  "Beyond Automation: How AI is Enhancing Human Creativity in Writing"
];

// Fallback summary in case the API call fails
export const FALLBACK_SUMMARY = "Artificial intelligence is rapidly transforming how we create and consume written content in the digital age. From automated journalism to AI-powered writing assistants, the landscape of content creation is evolving at an unprecedented pace.";

/**
 * Generate AI title suggestions based on blog content
 */
export async function generateTitleSuggestions(content: string): Promise<string[]> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log("No OpenAI API key provided, using fallback title suggestions");
      return FALLBACK_TITLE_SUGGESTIONS;
    }
    
    const prompt = `
      Based on the following blog content, generate 5 catchy, creative, and relevant title suggestions.
      Each title should be unique, concise, engaging, and accurately reflect the content of the blog.
      Return the titles as a JSON array of strings without any additional commentary or explanations.
      
      Blog content:
      ${content.slice(0, 4000)} // Limit content to 4000 chars to avoid token limit issues
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional content editor who specializes in creating engaging blog titles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      console.log("Empty response from OpenAI API, using fallback title suggestions");
      return FALLBACK_TITLE_SUGGESTIONS;
    }

    const parsedResponse = JSON.parse(responseContent);
    
    // Ensure response has titles property
    if (!parsedResponse.titles || !Array.isArray(parsedResponse.titles)) {
      console.log("Invalid response format from OpenAI API, using fallback title suggestions");
      return FALLBACK_TITLE_SUGGESTIONS;
    }
    
    return parsedResponse.titles;
  } catch (error) {
    console.error("Error generating title suggestions:", error);
    console.log("Using fallback title suggestions");
    return FALLBACK_TITLE_SUGGESTIONS;
  }
}

/**
 * Generate AI summary suggestion based on blog content
 */
export async function generateSummarySuggestion(content: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log("No OpenAI API key provided, using fallback summary");
      return FALLBACK_SUMMARY;
    }
    
    const prompt = `
      Based on the following blog content, generate a concise and engaging summary paragraph.
      The summary should be approximately 2-3 sentences, capture the main points of the blog,
      and be written in a professional but engaging style.
      
      Blog content:
      ${content.slice(0, 4000)} // Limit content to 4000 chars to avoid token limit issues
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional content editor who specializes in creating concise blog summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const summary = response.choices[0].message.content;
    if (!summary) {
      console.log("Empty response from OpenAI API, using fallback summary");
      return FALLBACK_SUMMARY;
    }
    
    return summary;
  } catch (error) {
    console.error("Error generating summary suggestion:", error);
    console.log("Using fallback summary");
    return FALLBACK_SUMMARY;
  }
}