import { useState, useCallback, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Global chat store to persist messages across view changes
let globalMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm your AI coding assistant powered by Mistral Small 3.1 24B. I can help you with:\n\n• Writing and explaining code\n• Debugging issues\n• Creating new files\n• Code reviews and suggestions\n• Answering programming questions\n\nWhat would you like to work on?",
    timestamp: new Date(),
  }
];

let globalListeners: Set<() => void> = new Set();

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>(globalMessages);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to global state changes
  const forceUpdate = useCallback(() => {
    setMessages([...globalMessages]);
  }, []);

  useEffect(() => {
    globalListeners.add(forceUpdate);
    return () => {
      globalListeners.delete(forceUpdate);
    };
  }, [forceUpdate]);

  const addMessage = useCallback((message: Message) => {
    globalMessages = [...globalMessages, message];
    globalListeners.forEach(listener => listener());
  }, []);

  const clearMessages = useCallback(() => {
    globalMessages = [{
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI coding assistant powered by Mistral Small 3.1 24B. I can help you with:\n\n• Writing and explaining code\n• Debugging issues\n• Creating new files\n• Code reviews and suggestions\n• Answering programming questions\n\nWhat would you like to work on?",
      timestamp: new Date(),
    }];
    globalListeners.forEach(listener => listener());
  }, []);

  const sendMessage = useCallback(async (
    input: string, 
    context: any, 
    onCreateFile?: (name: string, content: string) => void,
    onUpdateFile?: (content: string) => void
  ) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          context,
          history: globalMessages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);

      // Handle file operations if suggested by AI
      if (data.fileOperation) {
        if (data.fileOperation.type === "create" && onCreateFile) {
          onCreateFile(data.fileOperation.filename, data.fileOperation.content);
        } else if (data.fileOperation.type === "update" && onUpdateFile) {
          onUpdateFile(data.fileOperation.content);
        }
      }

    } catch (error) {
      console.error("AI request failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}