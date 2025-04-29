import OpenAI from "openai";

// Create a new OpenAI client with the API key
// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate AI title suggestions based on blog content
 */
export async function generateTitleSuggestions(content: string): Promise<string[]> {
  try {
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
      throw new Error("Failed to generate title suggestions");
    }

    const parsedResponse = JSON.parse(responseContent);
    
    // Ensure response has titles property
    if (!parsedResponse.titles || !Array.isArray(parsedResponse.titles)) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    return parsedResponse.titles;
  } catch (error) {
    console.error("Error generating title suggestions:", error);
    throw new Error("Failed to generate title suggestions");
  }
}

/**
 * Generate AI summary suggestion based on blog content
 */
export async function generateSummarySuggestion(content: string): Promise<string> {
  try {
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
      throw new Error("Failed to generate summary suggestion");
    }
    
    return summary;
  } catch (error) {
    console.error("Error generating summary suggestion:", error);
    throw new Error("Failed to generate summary suggestion");
  }
}