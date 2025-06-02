import { useState } from "react";
import { ChevronDown, ChevronRight, FilePlus, FolderPlus, RotateCcw } from "lucide-react";
import { getFileIcon } from "@/utils/fileIcons";
import type { FileItem } from "@/types/ide";

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, target?: FileItem) => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateFolder: (parentPath: string, name: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
}

export default function FileExplorer({
  files,
  onFileSelect,
  onContextMenu,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={`
            flex items-center py-1 px-2 cursor-pointer file-tree-item text-[hsl(var(--vs-text))]
            hover:bg-[hsl(var(--vs-hover))]
          `}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.path);
            } else {
              onFileSelect(item);
            }
          }}
          onContextMenu={(e) => onContextMenu(e, item)}
        >
          {item.type === "folder" && (
            <div className="w-4 flex justify-center">
              {expandedFolders.has(item.path) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
          )}
          {item.type === "file" && <div className="w-4" />}
          
          <div className="w-4 h-4 mr-2 flex items-center justify-center">
            {getFileIcon(item.name, item.type)}
          </div>
          
          <span className="text-sm truncate">{item.name}</span>
        </div>
        
        {item.type === "folder" && expandedFolders.has(item.path) && item.children && (
          <div>
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="bg-[hsl(var(--vs-sidebar))] h-full flex flex-col">
      <div className="h-8 flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-[hsl(var(--vs-text))]">
        <span>Explorer</span>
        <div className="flex space-x-1">
          <button
            onClick={() => onCreateFile("", "newfile.txt")}
            className="hover:bg-[hsl(var(--vs-hover))] p-1 rounded cursor-pointer"
            title="New File"
          >
            <FilePlus className="w-3 h-3" />
          </button>
          <button
            onClick={() => onCreateFolder("", "newfolder")}
            className="hover:bg-[hsl(var(--vs-hover))] p-1 rounded cursor-pointer"
            title="New Folder"
          >
            <FolderPlus className="w-3 h-3" />
          </button>
          <button
            className="hover:bg-[hsl(var(--vs-hover))] p-1 rounded cursor-pointer"
            title="Refresh Explorer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto vs-scrollbar" onContextMenu={onContextMenu}>
        {renderFileTree(files)}
      </div>
    </div>
  );
}
