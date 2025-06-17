import { google } from "@ai-sdk/google";
import { generateText, APICallError } from 'ai';

export async function POST() {
  try {
    const model = google("gemini-2.0-flash", {
      safetySettings: [
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
      ],
    });

    // ✅ Enhanced prompt with randomization and variety
    const currentTime = new Date().toISOString();
    const randomSeed = Math.floor(Math.random() * 1000000);

    const { text } = await generateText({
      model: model,
      prompt: `Generate 3 unique, creative, and engaging conversation starters for an anonymous messaging platform. 

Context: People use this to send anonymous feedback, questions, or thoughts to each other. The questions should encourage meaningful, positive interactions.

Requirements:
- Each question must be completely different from typical Q&A formats
- Vary the question types: some introspective, some creative, some about experiences
- Make them thought-provoking but accessible to all ages
- Avoid generic questions about hobbies, skills, or instruments
- Focus on unique angles that spark genuine curiosity
- Keep each question under 15 words

Categories to rotate between:
- Hypothetical scenarios ("If you could...")
- Personal reflections ("What's something that...")
- Creative thinking ("Describe a moment when...")
- Life perspectives ("How do you...")
- Memory-based ("Tell me about a time...")
- Future-oriented ("What would you...")
- Emotional insights ("What makes you...")

Format: Separate each question with '||' (no spaces around the separators)

Timestamp: ${currentTime}
Seed: ${randomSeed}

Generate fresh, unique questions now:`,
      maxTokens: 300,
      temperature: 0.9, // ✅ Higher temperature for more creativity
      topP: 0.95,       // ✅ More diverse token selection
    });

    return Response.json({ 
      success: true,
      text: text.trim(),
      timestamp: currentTime, // ✅ For debugging uniqueness
    });

  } catch (error) {
    console.error("Error in suggest-message:", error);

    if (APICallError.isInstance(error)) {
      return Response.json(
        { 
          success: false,
          error: `AI Service Error: ${error.message}`, 
          details: error.responseBody 
        },
        { status: error.statusCode || 500 }
      );
    } 
    
    if (error instanceof Error) {
      return Response.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    return Response.json(
      { 
        success: false,
        error: "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}