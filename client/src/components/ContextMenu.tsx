import { useEffect } from "react";
import { FilePlus, FolderPlus, Edit, Copy, Scissors, Clipboard, Trash2 } from "lucide-react";
import type { FileItem } from "@/types/ide";

interface ContextMenuProps {
  x: number;
  y: number;
  target?: FileItem;
  onClose: () => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateFolder: (parentPath: string, name: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
}

export default function ContextMenu({
  x,
  y,
  target,
  onClose,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
}: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: FilePlus,
      label: "New File",
      action: () => {
        const parentPath = target?.type === "folder" ? target.path : target?.path.split("/").slice(0, -1).join("/") || "";
        const name = prompt("Enter file name:");
        if (name) {
          onCreateFile(parentPath, name);
        }
      },
    },
    {
      icon: FolderPlus,
      label: "New Folder",
      action: () => {
        const parentPath = target?.type === "folder" ? target.path : target?.path.split("/").slice(0, -1).join("/") || "";
        const name = prompt("Enter folder name:");
        if (name) {
          onCreateFolder(parentPath, name);
        }
      },
    },
    { separator: true },
    {
      icon: Edit,
      label: "Rename",
      action: () => {
        if (target) {
          const newName = prompt("Enter new name:", target.name);
          if (newName && newName !== target.name) {
            const newPath = target.path.split("/").slice(0, -1).concat(newName).join("/");
            onRenameFile(target.path, newPath);
          }
        }
      },
      disabled: !target,
    },
    {
      icon: Copy,
      label: "Copy",
      action: () => console.log("Copy"),
      disabled: !target,
    },
    {
      icon: Scissors,
      label: "Cut",
      action: () => console.log("Cut"),
      disabled: !target,
    },
    {
      icon: Clipboard,
      label: "Paste",
      action: () => console.log("Paste"),
    },
    { separator: true },
    {
      icon: Trash2,
      label: "Delete",
      action: () => {
        if (target && confirm(`Are you sure you want to delete "${target.name}"?`)) {
          onDeleteFile(target.path);
        }
      },
      disabled: !target,
      destructive: true,
    },
  ];

  return (
    <div
      className="fixed bg-[hsl(var(--vs-sidebar))] border border-[hsl(var(--vs-border))] rounded-md shadow-xl z-50 context-menu"
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => {
          if ('separator' in item && item.separator) {
            return (
              <div key={index} className="border-t border-[hsl(var(--vs-border))] my-1" />
            );
          }

          const IconComponent = item.icon!;
          
          return (
            <div
              key={index}
              onClick={item.disabled ? undefined : item.action}
              className={`
                cursor-pointer px-3 py-1 text-sm flex items-center
                ${item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : `hover:bg-[hsl(var(--vs-hover))] ${item.destructive ? "text-red-400" : "text-[hsl(var(--vs-text))]"}`
                }
              `}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
