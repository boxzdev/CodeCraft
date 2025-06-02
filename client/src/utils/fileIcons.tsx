import { 
  FileText, 
  Folder, 
  FolderOpen,
  Code,
  FileImage,
  Settings,
  Database,
  Archive,
  Film
} from "lucide-react";

export function getFileIcon(filename: string, type: "file" | "folder", isOpen?: boolean) {
  if (type === "folder") {
    return isOpen ? 
      <FolderOpen className="w-4 h-4 text-blue-400" /> : 
      <Folder className="w-4 h-4 text-blue-400" />;
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  
  // React/JSX files
  if (ext === "jsx" || ext === "tsx") {
    return <div className="w-4 h-4 text-blue-400 font-bold text-xs flex items-center justify-center">R</div>;
  }
  
  // JavaScript/TypeScript
  if (ext === "js" || ext === "mjs") {
    return <div className="w-4 h-4 bg-orange-500 text-white font-bold text-xs flex items-center justify-center rounded">JS</div>;
  }
  
  if (ext === "ts") {
    return <div className="w-4 h-4 bg-blue-500 text-white font-bold text-xs flex items-center justify-center rounded">TS</div>;
  }
  
  // Web files
  if (ext === "html" || ext === "htm") {
    return <div className="w-4 h-4 text-orange-500 font-bold text-xs flex items-center justify-center">H</div>;
  }
  
  if (ext === "css") {
    return <div className="w-4 h-4 text-blue-500 font-bold text-xs flex items-center justify-center">C</div>;
  }
  
  if (ext === "scss" || ext === "sass") {
    return <div className="w-4 h-4 text-pink-500 font-bold text-xs flex items-center justify-center">S</div>;
  }
  
  // Python
  if (ext === "py") {
    return <div className="w-4 h-4 text-green-500 font-bold text-xs flex items-center justify-center">PY</div>;
  }
  
  // JSON
  if (ext === "json") {
    return <div className="w-4 h-4 text-orange-400 font-bold text-xs flex items-center justify-center">{"{}"}</div>;
  }
  
  // Markdown
  if (ext === "md" || ext === "markdown") {
    return <div className="w-4 h-4 text-gray-400 font-bold text-xs flex items-center justify-center">M</div>;
  }
  
  // Images
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext || "")) {
    return <FileImage className="w-4 h-4 text-green-400" />;
  }
  
  // Config files
  if (["yml", "yaml", "toml", "ini", "conf", "config"].includes(ext || "") || 
      filename.startsWith(".") || 
      ["package.json", "tsconfig.json", "vite.config.ts"].includes(filename)) {
    return <Settings className="w-4 h-4 text-gray-400" />;
  }
  
  // Database
  if (["sql", "db", "sqlite", "sqlite3"].includes(ext || "")) {
    return <Database className="w-4 h-4 text-blue-400" />;
  }
  
  // Archives
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext || "")) {
    return <Archive className="w-4 h-4 text-purple-400" />;
  }
  
  // Media
  if (["mp4", "avi", "mov", "webm", "mp3", "wav", "ogg"].includes(ext || "")) {
    return <Film className="w-4 h-4 text-red-400" />;
  }
  
  // Code files
  if (["java", "c", "cpp", "h", "hpp", "cs", "php", "rb", "go", "rs", "kt", "swift"].includes(ext || "")) {
    return <Code className="w-4 h-4 text-blue-400" />;
  }
  
  // Default file icon
  return <FileText className="w-4 h-4 text-gray-400" />;
}
