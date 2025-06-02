import { useEffect, useRef } from "react";
import { useMonaco } from "@/hooks/useMonaco";
import type { FileItem } from "@/types/ide";

interface MonacoEditorProps {
  file: FileItem;
  onContentChange?: (content: string) => void;
}

export default function MonacoEditor({ file, onContentChange }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { editor, isLoading, loadEditor } = useMonaco();

  useEffect(() => {
    if (containerRef.current && !editor) {
      loadEditor(containerRef.current);
    }
  }, [editor, loadEditor]);

  useEffect(() => {
    if (editor && file.content !== undefined && window.monaco) {
      const language = getLanguageFromExtension(file.name);
      
      // Create a unique URI for this file
      const fileUri = window.monaco.Uri.parse(`file:///${file.path}`);
      
      // Check if model already exists for this file
      let model = window.monaco.editor.getModel(fileUri);
      
      if (!model) {
        // Create new model for this file
        model = window.monaco.editor.createModel(file.content, language, fileUri);
        
        // Set up content change listener for new model
        model.onDidChangeContent(() => {
          if (onContentChange) {
            onContentChange(model.getValue());
          }
        });
      }
      
      // Switch to this file's model
      editor.setModel(model);
    }
  }, [editor, file, onContentChange]);

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      json: "json",
      xml: "xml",
      md: "markdown",
      yaml: "yaml",
      yml: "yaml",
      sql: "sql",
      php: "php",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      rb: "ruby",
      sh: "shell",
      bat: "bat",
    };

    return languageMap[ext || ""] || "plaintext";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[hsl(var(--vs-bg))]">
        <div className="flex items-center space-x-2 text-[hsl(var(--vs-text))]">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[hsl(var(--vs-accent))]"></div>
          <span>Loading Monaco Editor...</span>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="monaco-editor-container" />;
}
