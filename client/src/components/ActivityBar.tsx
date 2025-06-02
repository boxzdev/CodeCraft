import { Folder, Search, GitBranch, Play, Puzzle, Settings, Bot, Globe } from "lucide-react";
import type { ActivityView } from "@/types/ide";

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const activities = [
    { id: "explorer" as ActivityView, icon: Folder, label: "Explorer" },
    { id: "search" as ActivityView, icon: Search, label: "Search" },
    { id: "source-control" as ActivityView, icon: GitBranch, label: "Source Control" },
    { id: "run-debug" as ActivityView, icon: Play, label: "Run and Debug" },
    { id: "extensions" as ActivityView, icon: Puzzle, label: "Extensions" },
    { id: "ai-assistant" as ActivityView, icon: Bot, label: "AI Assistant" },
    { id: "preview" as ActivityView, icon: Globe, label: "Preview" },
  ];

  return (
    <div className="w-12 bg-[hsl(var(--vs-sidebar))] border-r border-[hsl(var(--vs-border))] flex flex-col items-center py-2">
      <div className="flex flex-col space-y-1">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          const isActive = activeView === activity.id;
          
          return (
            <button
              key={activity.id}
              onClick={() => onViewChange(activity.id)}
              className={`
                w-12 h-12 flex items-center justify-center hover:bg-[hsl(var(--vs-hover))] cursor-pointer
                ${isActive ? "bg-[hsl(var(--vs-active))] border-l-2 border-[hsl(var(--vs-accent))]" : ""}
              `}
              title={activity.label}
            >
              <IconComponent className="w-5 h-5 text-[hsl(var(--vs-text))]" />
            </button>
          );
        })}
      </div>
      
      <div className="flex-1" />
      
      <button
        className="w-12 h-12 flex items-center justify-center hover:bg-[hsl(var(--vs-hover))] cursor-pointer"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-[hsl(var(--vs-text))]" />
      </button>
    </div>
  );
}
