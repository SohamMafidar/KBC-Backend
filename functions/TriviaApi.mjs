// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
export default async function handler(event) {
    const headers = {
        "Access-Control-Allow-Origin": "*", // Change "*" to your frontend URL for better security
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json", // Make sure Content-Type is set correctly
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers,
        };
    }
    try {
        console.log("Fetching trivia data");
        const resp = await fetch(
            "https://the-trivia-api.com/api/questions?categories=general_knowledge&limit=10&difficulty=easy"
        );
        if (!resp.ok) {
            throw new Error(`HTTP error! Status: ${resp.status}`);
        }
        const data = await resp.json();
        if (!Array.isArray(data)) {
            throw new Error("Unexpected response format from trivia API");
        }
        console.log("Transforming trivia data");
        const transformedDataArray = data.map((jsonData) => {
            if (
                !jsonData.question ||
                !jsonData.correctAnswer ||
                !Array.isArray(jsonData.incorrectAnswers)
            ) {
                throw new Error("Missing required fields in trivia data");
            }
            const shuffledAnswers = [...jsonData.incorrectAnswers];
            shuffledAnswers.push(jsonData.correctAnswer);

            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [
                    shuffledAnswers[j],
                    shuffledAnswers[i],
                ];
            }

            return {
                question: jsonData.question,
                answers: shuffledAnswers.map((text) => ({
                    text,
                    correct: text === jsonData.correctAnswer,
                })),
            };
        });

        const body = JSON.stringify(transformedDataArray);
        console.log("Returning success response");
        return {
            statusCode: 200,
            headers,
            body,
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || "Internal server error",
            }),
        };
    }
}
