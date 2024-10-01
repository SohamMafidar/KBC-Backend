import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event, context) {
    const headers = {
        "Access-Control-Allow-Origin": "https://soham-kbcapp.netlify.app/", // Change "*" to your frontend URL for better security
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers,
        };
    }
    // Check if method is POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    // Parse the incoming request body
    const { ansOptions, question } = JSON.parse(event.body);
    if (!ansOptions || !question) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Invalid request data" }),
        };
    }

    // Construct the prompt using question and ansOptions
    const prompt = `Answer the following question with answer options provided. Question: ${question}\nAnswer options: ${ansOptions}`;

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            max_output_tokens: 50,
        },
        systemInstruction:
            "You are an expert sitting in a Trivia quiz game show, you help contestents by giving answers.",
    });

    try {
        const result = await model.generateContent(prompt);
        const generatedText = result.response.text();
        const body = JSON.stringify(generatedText);

        return {
            statusCode: 200,
            headers,
            body,
        };
    } catch (error) {
        // Return error response
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
