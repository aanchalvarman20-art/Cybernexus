export const config = {
    runtime: 'edge', // Makes it fast
};

export default async function handler(req) {
    // 1. Get the prompt from the frontend
    const { messages, model } = await req.json();

    // 2. Get the key from Vercel Environment Variables (Secure!)
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Server API Key missing" }), { status: 500 });
    }

    // 3. Forward the request to OpenRouter
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://cybernexus.vercel.app", // Change to your site later
                "X-Title": "CyberNexus"
            },
            body: JSON.stringify({
                model: model || "openai/gpt-oss-20b:free",
                messages: messages
            })
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to reach AI provider" }), { status: 500 });
    }
}