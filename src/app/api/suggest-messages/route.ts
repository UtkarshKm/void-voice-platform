import {google} from "@ai-sdk/google";
import { generateText, APICallError } from 'ai';



export async function POST() {
	try {
		const model = google("gemini-2.0-flash", {
			safetySettings: [
				{category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE"},
			],
		});

		const { text } = await generateText({
			model: model,
			prompt: "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.",
		});

		return new Response(JSON.stringify({ text }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		if (APICallError.isInstance(error)) {
			console.error("API Call Error:", {
				url: error.url,
				statusCode: error.statusCode,
				responseBody: error.responseBody,
				isRetryable: error.isRetryable,
				data: error.data,
			});
			return new Response(JSON.stringify({ error: `API Call Error: ${error.message}`, details: error.responseBody }), {
				status: error.statusCode || 500,
				headers: { 'Content-Type': 'application/json' },
			});
		} else if (error instanceof Error) {
            console.error("Error generating text:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
		} else {
			console.error("An unexpected error occurred:", error);
            return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
		}
	}
}
