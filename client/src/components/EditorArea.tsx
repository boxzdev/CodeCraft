import { X } from "lucide-react";
import MonacoEditor from "./MonacoEditor";
import { getFileIcon } from "@/utils/fileIcons";
import type { FileItem } from "@/types/ide";

interface EditorAreaProps {
  openFiles: FileItem[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileClose: (fileId: string) => void;
  onFileContentChange?: (fileId: string, content: string) => void;
}

export default function EditorArea({
  openFiles,
  activeFileId,
  onFileSelect,
  onFileClose,
  onFileContentChange,
}: EditorAreaProps) {
  const activeFile = openFiles.find(f => f.id === activeFileId);

  const renderBreadcrumb = () => {
    if (!activeFile) return null;

    const pathParts = activeFile.path.split("/").filter(Boolean);
    
    return (
      <div className="h-6 bg-[hsl(var(--vs-bg))] border-b border-[hsl(var(--vs-border))] flex items-center px-3 text-xs text-[hsl(var(--vs-text))]">
        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 opacity-50">›</span>
            )}
            <span className={index === pathParts.length - 1 ? "" : "opacity-75"}>
              {part}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Tabs */}
      <div className="h-9 bg-[hsl(var(--vs-tab))] border-b border-[hsl(var(--vs-border))] flex items-center overflow-x-auto">
        {openFiles.map((file) => (
          <div
            key={file.id}
            className={`
              flex items-center h-full px-3 cursor-pointer min-w-0 max-w-48 editor-tab
              border-r border-[hsl(var(--vs-border))]
              ${file.id === activeFileId 
                ? "bg-[hsl(var(--vs-bg))] text-[hsl(var(--vs-text))]" 
                : "bg-[hsl(var(--vs-tab))] text-[hsl(var(--vs-text))] hover:bg-[hsl(var(--vs-hover))]"
              }
            `}
            onClick={() => onFileSelect(file.id)}
          >
            <div className="w-4 h-4 mr-2 flex items-center justify-center flex-shrink-0">
              {getFileIcon(file.name, file.type)}
            </div>
            <span className="text-sm truncate">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(file.id);
              }}
              className="ml-2 flex-shrink-0 hover:bg-[hsl(var(--vs-hover))] p-1 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="flex-1" />
      </div>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Editor Content */}
      <div className="flex-1 relative">
        {activeFile ? (
          <MonacoEditor 
            file={activeFile} 
            onContentChange={(content) => {
              if (onFileContentChange) {
                onFileContentChange(activeFile.id, content);
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[hsl(var(--vs-text))] text-sm">
            <div className="text-center">
              <p className="mb-2">No file selected</p>
              <p className="text-xs opacity-75">Open a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
