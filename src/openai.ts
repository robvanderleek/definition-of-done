import OpenAI from "openai";

const openAI = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function executeGPT(query: string, content: string) {
    console.log('checking...');
    const result = await openAI.chat.completions.create({
        messages: [{
            role: 'system',
            content: query
        }, {
            role: 'user',
            content: content
        }],
        model: 'gpt-4-1106-preview',
        max_tokens: 1000
    });
    console.log(result.choices[0].message.content);
}