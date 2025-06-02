export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileItem[];
  content?: string;
}

export type ActivityView = "explorer" | "search" | "source-control" | "run-debug" | "extensions" | "ai-assistant" | "preview";

export interface IDEState {
  activeView: ActivityView;
  openFiles: FileItem[];
  activeFileId: string | null;
  sidebarVisible: boolean;
  panelVisible: boolean;
  panelHeight: number;
  sidebarWidth: number;
  previewUrl: string | null;
}
