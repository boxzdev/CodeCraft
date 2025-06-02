import { Code, Minus, Square, X } from "lucide-react";

export default function TitleBar() {
  const menuItems = ["File", "Edit", "View", "Go", "Run", "Terminal", "Help"];

  return (
    <div className="h-8 bg-[hsl(var(--vs-title))] border-b border-[hsl(var(--vs-border))] flex items-center justify-between px-2 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Code className="text-[hsl(var(--vs-accent))] w-4 h-4" />
          <span className="text-[hsl(var(--vs-text))] text-xs">Visual Studio Code</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 text-xs">
          {menuItems.map((item) => (
            <span
              key={item}
              className="hover:bg-[hsl(var(--vs-hover))] px-2 py-1 cursor-pointer text-[hsl(var(--vs-text))]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center">
        <button className="w-11 h-8 hover:bg-[hsl(var(--vs-hover))] flex items-center justify-center">
          <Minus className="w-3 h-3 text-[hsl(var(--vs-text))]" />
        </button>
        <button className="w-11 h-8 hover:bg-[hsl(var(--vs-hover))] flex items-center justify-center">
          <Square className="w-3 h-3 text-[hsl(var(--vs-text))]" />
        </button>
        <button className="w-11 h-8 hover:bg-red-600 flex items-center justify-center">
          <X className="w-3 h-3 text-[hsl(var(--vs-text))]" />
        </button>
      </div>
    </div>
  );
}
