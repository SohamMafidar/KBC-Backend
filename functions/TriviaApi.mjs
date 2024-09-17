// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
export default async function handler(event) {
    const headers = {
        "Access-Control-Allow-Origin": "https://soham-kbcapp.netlify.app", // Change "*" to your frontend URL for better security
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: "", // No content for OPTIONS
        };
    }
    try {
        const resp = await fetch(
            "https://the-trivia-api.com/api/questions?categories=general_knowledge&limit=10&difficulty=easy"
        );
        if (!resp.ok) {
            throw new Error(`HTTP error! Status: ${resp.status}`);
        }
        const data = await resp.json();
        const transformedDataArray = data.map((jsonData) => {
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
        return {
            statusCode: 200,
            headers,
            body,
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
