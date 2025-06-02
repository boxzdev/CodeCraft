import { useState, useEffect } from "react";
import TitleBar from "./TitleBar";
import ActivityBar from "./ActivityBar";
import FileExplorer from "./FileExplorer";
import EditorArea from "./EditorArea";
import BottomPanel from "./BottomPanel";
import StatusBar from "./StatusBar";
import CommandPalette from "./CommandPalette";
import QuickOpen from "./QuickOpen";
import ContextMenu from "./ContextMenu";
import AIAssistant from "./AIAssistant";
import Preview from "./Preview";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useKeyboard } from "@/hooks/useKeyboard";
import type { IDEState, FileItem } from "@/types/ide";

export default function IDE() {
  const [ideState, setIdeState] = useState<IDEState>({
    activeView: "explorer",
    openFiles: [],
    activeFileId: null,
    sidebarVisible: true,
    panelVisible: true,
    panelHeight: 192,
    sidebarWidth: 240,
    previewUrl: null,
  });

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    target?: FileItem;
  }>({ visible: false, x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);

  const { files, createFile, createFolder, deleteFile, renameFile, getFileContent, updateFileContent } = useFileSystem();

  // Keyboard shortcuts
  useKeyboard({
    "ctrl+shift+p": () => setShowCommandPalette(true),
    "ctrl+p": () => setShowQuickOpen(true),
    "ctrl+s": () => {
      // TODO: Save current file
      console.log("Save file");
    },
    "ctrl+`": () => {
      setIdeState(prev => ({
        ...prev,
        panelVisible: !prev.panelVisible
      }));
    },
  });

  const openFile = async (file: FileItem) => {
    if (file.type === "folder") return;

    const content = await getFileContent(file.path);
    const newFile = { ...file, content };

    setIdeState(prev => {
      const existingIndex = prev.openFiles.findIndex(f => f.id === file.id);
      if (existingIndex >= 0) {
        return {
          ...prev,
          activeFileId: file.id,
        };
      }

      return {
        ...prev,
        openFiles: [...prev.openFiles, newFile],
        activeFileId: file.id,
      };
    });
  };

  const closeFile = (fileId: string) => {
    setIdeState(prev => {
      const newOpenFiles = prev.openFiles.filter(f => f.id !== fileId);
      const newActiveFileId = prev.activeFileId === fileId 
        ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].id : null)
        : prev.activeFileId;

      return {
        ...prev,
        openFiles: newOpenFiles,
        activeFileId: newActiveFileId,
      };
    });
  };

  const handleContextMenu = (e: React.MouseEvent, target?: FileItem) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      target,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(200, Math.min(800, e.clientX - 48)); // 48px for activity bar
      setIdeState(prev => ({ ...prev, sidebarWidth: newWidth }));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar 
          activeView={ideState.activeView}
          onViewChange={(view) => setIdeState(prev => ({ ...prev, activeView: view }))}
        />
        
        {ideState.sidebarVisible && (
          <div className="flex">
            <div 
              className="flex-shrink-0 border-r border-[hsl(var(--vs-border))]"
              style={{ width: ideState.sidebarWidth }}
            >
              {ideState.activeView === "explorer" && (
                <FileExplorer
                  files={files}
                  onFileSelect={openFile}
                  onContextMenu={handleContextMenu}
                  onCreateFile={createFile}
                  onCreateFolder={createFolder}
                  onDeleteFile={deleteFile}
                  onRenameFile={renameFile}
                />
              )}
              {ideState.activeView === "ai-assistant" && (
                <AIAssistant
                  activeFile={ideState.openFiles.find(f => f.id === ideState.activeFileId)}
                  onCreateFile={(name, content) => {
                    createFile("", name);
                    // TODO: Set file content
                  }}
                  onUpdateFile={(content) => {
                    // TODO: Update current file content
                    console.log("Update file with content:", content);
                  }}
                />
              )}
              {ideState.activeView === "preview" && (
                <Preview
                  files={files}
                  onCreateFile={(name, content) => {
                    createFile("", name);
                    // TODO: Set file content
                  }}
                />
              )}
            </div>
            <div
              className="w-1 bg-[hsl(var(--vs-border))] hover:bg-[hsl(var(--vs-accent))] cursor-col-resize transition-colors"
              onMouseDown={handleMouseDown}
              title="Drag to resize sidebar"
            />
          </div>
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorArea
            openFiles={ideState.openFiles}
            activeFileId={ideState.activeFileId}
            onFileSelect={(fileId) => setIdeState(prev => ({ ...prev, activeFileId: fileId }))}
            onFileClose={closeFile}
            onFileContentChange={updateFileContent}
          />
          
          {ideState.panelVisible && (
            <div 
              className="flex-shrink-0 border-t border-[hsl(var(--vs-border))]"
              style={{ height: ideState.panelHeight }}
            >
              <BottomPanel />
            </div>
          )}
        </div>
      </div>
      
      <StatusBar 
        activeFile={ideState.openFiles.find(f => f.id === ideState.activeFileId)}
      />

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}

      {showQuickOpen && (
        <QuickOpen 
          files={files}
          onFileSelect={openFile}
          onClose={() => setShowQuickOpen(false)}
        />
      )}

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0 })}
          onCreateFile={createFile}
          onCreateFolder={createFolder}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
        />
      )}
    </div>
  );
}
