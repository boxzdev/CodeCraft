import express from "express";

export async function handleAIChat(req: express.Request, res: express.Response) {
  try {
    const { message, context, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenRouter API key not configured" });
    }

    // Build the system prompt with context
    let systemPrompt = `You are an expert coding assistant integrated into a VS Code-like IDE. You help users with:
- Writing, explaining, and debugging code
- Creating new files and components
- Code reviews and suggestions
- Programming questions and best practices

Be concise but helpful. When suggesting code changes or new files, format code blocks with triple backticks and specify the language.

If you want to create a new file, respond with a JSON object like:
{
  "response": "I'll create that component for you.",
  "fileOperation": {
    "type": "create",
    "filename": "Component.tsx",
    "content": "// file content here"
  }
}

If you want to update the current file, use:
{
  "response": "Here's the updated code.",
  "fileOperation": {
    "type": "update", 
    "content": "// updated file content"
  }
}`;

    if (context) {
      systemPrompt += `\n\nCurrent file context:
- Filename: ${context.filename}
- Language: ${context.language}
- Content: ${context.content}`;
    }

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "VS Code IDE Clone"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Try to parse JSON response for file operations
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.response && parsed.fileOperation) {
        return res.json(parsed);
      }
    } catch {
      // Not JSON, treat as regular text response
    }

    res.json({ response: aiResponse });

  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}