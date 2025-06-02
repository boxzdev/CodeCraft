import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface CommandPaletteProps {
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: "file.new",
      label: "File: New File",
      description: "Create a new file",
      action: () => console.log("New file"),
    },
    {
      id: "view.terminal",
      label: "View: Toggle Terminal",
      description: "Show or hide the terminal",
      action: () => console.log("Toggle terminal"),
    },
    {
      id: "format.document",
      label: "Format Document",
      description: "Format the entire document",
      action: () => console.log("Format document"),
    },
    {
      id: "file.save",
      label: "File: Save",
      description: "Save the current file",
      action: () => console.log("Save file"),
    },
    {
      id: "file.saveAll",
      label: "File: Save All",
      description: "Save all open files",
      action: () => console.log("Save all files"),
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
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
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 command-overlay">
      <div className="bg-[hsl(var(--vs-sidebar))] border border-[hsl(var(--vs-border))] rounded-md w-96 shadow-xl">
        <div className="p-2 border-b border-[hsl(var(--vs-border))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--vs-text))] opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command..."
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
          {filteredCommands.map((command, index) => (
            <div
              key={command.id}
              onClick={() => {
                command.action();
                onClose();
              }}
              className={`
                cursor-pointer px-3 py-2 border-l-2 border-transparent
                ${index === selectedIndex
                  ? "bg-[hsl(var(--vs-hover))] border-[hsl(var(--vs-accent))]"
                  : "hover:bg-[hsl(var(--vs-hover))]"
                }
              `}
            >
              <div className="text-[hsl(var(--vs-text))] text-sm">{command.label}</div>
              <div className="text-xs text-[hsl(var(--vs-text))] opacity-75">{command.description}</div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && query && (
            <div className="px-3 py-2 text-[hsl(var(--vs-text))] opacity-75 text-sm">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
