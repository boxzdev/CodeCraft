import { useState, useRef, useEffect } from "react";
import { Terminal, AlertTriangle, List, Bug, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TerminalEntry {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
}

export default function BottomPanel() {
  const [activeTab, setActiveTab] = useState("terminal");
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  const executeCommand = useMutation({
    mutationFn: async (command: string) => {
      const response = await apiRequest("POST", "/api/terminal/execute", { command });
      return response.json();
    },
    onSuccess: (data) => {
      const entry: TerminalEntry = {
        id: Math.random().toString(36).substr(2, 9),
        command: data.command,
        output: data.output,
        exitCode: data.exitCode,
        timestamp: new Date(),
      };
      setTerminalHistory(prev => [...prev, entry]);
      setCurrentCommand("");
    },
    onError: (error) => {
      const entry: TerminalEntry = {
        id: Math.random().toString(36).substr(2, 9),
        command: currentCommand,
        output: `Error: ${error.message}`,
        exitCode: 1,
        timestamp: new Date(),
      };
      setTerminalHistory(prev => [...prev, entry]);
      setCurrentCommand("");
    },
  });

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Focus terminal input when terminal tab is active
  useEffect(() => {
    if (activeTab === "terminal" && terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  }, [activeTab]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !executeCommand.isPending) {
      executeCommand.mutate(currentCommand.trim());
    }
  };

  const tabs = [
    { id: "terminal", icon: Terminal, label: "Terminal", badge: null },
    { id: "problems", icon: AlertTriangle, label: "Problems", badge: 2 },
    { id: "output", icon: List, label: "Output", badge: null },
    { id: "debug", icon: Bug, label: "Debug Console", badge: null },
  ];

  const handleTerminalClick = () => {
    if (terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  };

  const renderTerminal = () => (
    <div 
      className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-thin cursor-text"
      ref={terminalScrollRef}
      onClick={handleTerminalClick}
      style={{ 
        backgroundColor: '#0c0c0c',
        color: '#cccccc',
        fontFamily: 'Consolas, "Courier New", monospace'
      }}
    >
      {terminalHistory.length === 0 && (
        <div className="text-gray-400 mb-2 text-xs">
          Terminal initialized.
        </div>
      )}
      
      {terminalHistory.map((entry) => (
        <div key={entry.id} className="mb-1">
          <div className="text-green-400">
            user@computer:~$ {entry.command}
          </div>
          {entry.output && (
            <pre className={`whitespace-pre-wrap font-mono ${
              entry.exitCode !== 0 ? 'text-red-400' : 'text-gray-300'
            }`}>
              {entry.output}
            </pre>
          )}
        </div>
      ))}
      
      {executeCommand.isPending && (
        <div className="text-yellow-400">
          user@computer:~$ {currentCommand}
          <div className="text-gray-400 text-xs">Executing...</div>
        </div>
      )}
      
      {/* Current input line */}
      <div className="flex items-center">
        <span className="text-green-400">user@computer:~$ </span>
        <input
          ref={terminalInputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCommandSubmit(e);
            }
          }}
          disabled={executeCommand.isPending}
          className="flex-1 bg-transparent text-white outline-none border-none"
          style={{ 
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: '#ffffff'
          }}
          autoComplete="off"
          autoFocus
        />
        <span className="w-2 h-4 bg-white terminal-cursor"></span>
      </div>
    </div>
  );

  const renderProblems = () => (
    <div 
      className="flex-1 p-4 text-sm overflow-y-auto scrollbar-thin"
      style={{ 
        backgroundColor: '#0c0c0c',
        color: '#cccccc',
        fontFamily: 'Consolas, "Courier New", monospace'
      }}
    >
      <div className="text-gray-400 mb-3 text-xs">
        Problems (0)
      </div>
      <div className="text-gray-500 text-center mt-8">
        No problems detected.
      </div>
    </div>
  );

  const renderOutput = () => (
    <div 
      className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-thin"
      style={{ 
        backgroundColor: '#0c0c0c',
        color: '#cccccc',
        fontFamily: 'Consolas, "Courier New", monospace'
      }}
    >
      <div className="text-gray-400 mb-3 text-xs">
        Output Channel: General
      </div>
      <div className="text-gray-300">[2025-06-02 02:13:45] Server started on port 5000</div>
      <div className="text-green-400">[2025-06-02 02:13:45] ✓ Build completed successfully</div>
      <div className="text-blue-400">[2025-06-02 02:13:45] Watching for file changes...</div>
      <div className="text-gray-300">[2025-06-02 02:13:46] Hot reload enabled</div>
    </div>
  );

  const renderDebugConsole = () => (
    <div 
      className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-thin"
      style={{ 
        backgroundColor: '#0c0c0c',
        color: '#cccccc',
        fontFamily: 'Consolas, "Courier New", monospace'
      }}
    >
      <div className="text-gray-400 mb-3 text-xs">
        Debug Console
      </div>
      <div className="text-gray-500 text-center mt-8">
        No debug session active.
        <br />
        <span className="text-xs">Start debugging to see console output.</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "terminal":
        return renderTerminal();
      case "problems":
        return renderProblems();
      case "output":
        return renderOutput();
      case "debug":
        return renderDebugConsole();
      default:
        return renderTerminal();
    }
  };

  return (
    <div className="bg-[hsl(var(--vs-sidebar))] h-full flex flex-col">
      {/* Panel Tabs */}
      <div className="h-8 flex items-center bg-[hsl(var(--vs-tab))] border-b border-[hsl(var(--vs-border))]">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center h-full px-3 cursor-pointer text-sm
                ${isActive 
                  ? "bg-[hsl(var(--vs-bg))] text-[hsl(var(--vs-text))]" 
                  : "hover:bg-[hsl(var(--vs-hover))] text-[hsl(var(--vs-text))]"
                }
              `}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 bg-red-600 text-white text-xs px-1 rounded">
                  {tab.badge}
                </span>
              )}
            </div>
          );
        })}
        
        <div className="flex-1" />
        
        <button className="w-8 h-8 flex items-center justify-center hover:bg-[hsl(var(--vs-hover))] text-[hsl(var(--vs-text))]">
          <X className="w-3 h-3" />
        </button>
      </div>
      
      {/* Panel Content */}
      {renderContent()}
    </div>
  );
}
