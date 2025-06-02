import { GitBranch, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import type { FileItem } from "@/types/ide";

interface StatusBarProps {
  activeFile?: FileItem;
}

export default function StatusBar({ activeFile }: StatusBarProps) {
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "JavaScript React",
      ts: "TypeScript",
      tsx: "TypeScript React",
      py: "Python",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      json: "JSON",
      md: "Markdown",
    };

    return languageMap[ext || ""] || "Plain Text";
  };

  return (
    <div className="h-6 bg-[hsl(var(--vs-accent))] flex items-center justify-between px-3 text-xs text-white">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <RefreshCw className="w-3 h-3" />
          <span>0 ↓ 0 ↑</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-yellow-300" />
          <span>2</span>
          <XCircle className="w-3 h-3 text-red-300 ml-2" />
          <span>0</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {activeFile && (
          <>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>{getLanguageFromExtension(activeFile.name)}</span>
          </>
        )}
        <span>Go Live</span>
      </div>
    </div>
  );
}
