// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
export default async function handler() {
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
        return new Response(body, {
            headers: {
                "content-type": "application/json",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ statusCode: 500, message: error.toString() }),
            {
                headers: {
                    "content-type": "application/json",
                },
            }
        );
    }
}
