import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { getFileIcon } from "@/utils/fileIcons";
import type { FileItem } from "@/types/ide";

interface QuickOpenProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onClose: () => void;
}

export default function QuickOpen({ files, onFileSelect, onClose }: QuickOpenProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const flattenFiles = (items: FileItem[]): FileItem[] => {
    const result: FileItem[] = [];
    
    const traverse = (items: FileItem[]) => {
      items.forEach(item => {
        if (item.type === "file") {
          result.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    
    traverse(items);
    return result;
  };

  const allFiles = flattenFiles(files);
  const filteredFiles = allFiles.filter(file =>
    file.name.toLowerCase().includes(query.toLowerCase()) ||
    file.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredFiles.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredFiles.length - 1
        );
      } else if (e.key === "Enter" && filteredFiles[selectedIndex]) {
        onFileSelect(filteredFiles[selectedIndex]);
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredFiles, selectedIndex, onFileSelect, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 command-overlay">
      <div className="bg-[hsl(var(--vs-sidebar))] border border-[hsl(var(--vs-border))] rounded-md w-96 shadow-xl">
        <div className="p-2 border-b border-[hsl(var(--vs-border))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--vs-text))] opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Go to file..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-[hsl(var(--vs-bg))] border border-[hsl(var(--vs-border))] rounded pl-10 pr-3 py-2 text-[hsl(var(--vs-text))] focus:outline-none focus:border-[hsl(var(--vs-accent))]"
            />
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto vs-scrollbar">
          {filteredFiles.map((file, index) => (
            <div
              key={file.id}
              onClick={() => {
                onFileSelect(file);
                onClose();
              }}
              className={`
                cursor-pointer px-3 py-2 flex items-center
                ${index === selectedIndex
                  ? "bg-[hsl(var(--vs-hover))]"
                  : "hover:bg-[hsl(var(--vs-hover))]"
                }
              `}
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                {getFileIcon(file.name, file.type)}
              </div>
              <span className="text-[hsl(var(--vs-text))] text-sm">{file.name}</span>
              <span className="text-[hsl(var(--vs-text))] opacity-50 ml-auto text-xs">
                {file.path.split("/").slice(0, -1).join("/") || "./"}
              </span>
            </div>
          ))}
          
          {filteredFiles.length === 0 && query && (
            <div className="px-3 py-2 text-[hsl(var(--vs-text))] opacity-75 text-sm">
              No files found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
