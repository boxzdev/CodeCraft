import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Code, FileText, Lightbulb, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";
import type { FileItem } from "@/types/ide";

interface AIAssistantProps {
  activeFile?: FileItem;
  onCreateFile?: (name: string, content: string) => void;
  onUpdateFile?: (content: string) => void;
}

export default function AIAssistant({ activeFile, onCreateFile, onUpdateFile }: AIAssistantProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const context = activeFile ? {
      filename: activeFile.name,
      content: activeFile.content || "",
      language: getLanguageFromExtension(activeFile.name)
    } : null;

    const inputValue = input.trim();
    setInput("");

    await sendMessage(inputValue, context, onCreateFile, onUpdateFile);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
      py: "python", html: "html", css: "css", json: "json", md: "markdown"
    };
    return languageMap[ext || ""] || "text";
  };

  const formatContent = (content: string) => {
    // Simple formatting for code blocks
    const parts = content.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).trim();
        const lines = code.split("\n");
        const language = lines[0] || "";
        const codeContent = lines.slice(1).join("\n");
        
        return (
          <div key={index} className="my-2 bg-[hsl(var(--vs-bg))] border border-[hsl(var(--vs-border))] rounded">
            {language && (
              <div className="px-3 py-1 bg-[hsl(var(--vs-hover))] text-xs text-[hsl(var(--vs-text))] border-b border-[hsl(var(--vs-border))]">
                {language}
              </div>
            )}
            <pre className="p-3 text-sm text-[hsl(var(--vs-text))] overflow-x-auto">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-[hsl(var(--vs-sidebar))] h-full flex flex-col">
      <div className="h-8 flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-[hsl(var(--vs-text))] border-b border-[hsl(var(--vs-border))]">
        <div className="flex items-center space-x-2">
          <Bot className="w-3 h-3" />
          <span>AI Assistant</span>
        </div>
        <Button
          onClick={clearMessages}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-[hsl(var(--vs-hover))]"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 vs-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <div className="w-6 h-6 bg-[hsl(var(--vs-accent))] rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-[hsl(var(--vs-hover))] rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-[hsl(var(--vs-text))]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[hsl(var(--vs-text))] text-sm whitespace-pre-wrap break-words">
                  {formatContent(message.content)}
                </div>
                <div className="text-xs text-[hsl(var(--vs-text))] opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex space-x-3">
              <div className="w-6 h-6 bg-[hsl(var(--vs-hover))] rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 text-[hsl(var(--vs-text))]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-1 text-[hsl(var(--vs-text))] text-sm">
                  <span>Thinking</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-[hsl(var(--vs-text))] rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-[hsl(var(--vs-text))] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-1 bg-[hsl(var(--vs-text))] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-[hsl(var(--vs-border))]">
        {activeFile && (
          <div className="mb-2 text-xs text-[hsl(var(--vs-text))] opacity-75">
            Context: {activeFile.name}
          </div>
        )}
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about code, request explanations, or describe what you want to build..."
            className="flex-1 min-h-[60px] max-h-[120px] bg-[hsl(var(--vs-bg))] border-[hsl(var(--vs-border))] text-[hsl(var(--vs-text))] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="bg-[hsl(var(--vs-accent))] hover:bg-[hsl(var(--vs-accent))]/80 text-white px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-[hsl(var(--vs-text))] opacity-50">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Powered by Mistral Small 3.1 24B</span>
        </div>
      </div>
    </div>
  );
}