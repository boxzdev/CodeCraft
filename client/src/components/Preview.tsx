import { useState, useEffect } from "react";
import { Play, RefreshCw, ExternalLink, Globe, Smartphone, Tablet, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileItem } from "@/types/ide";

interface PreviewProps {
  files: FileItem[];
  onCreateFile?: (name: string, content: string) => void;
}

export default function Preview({ files, onCreateFile }: PreviewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [customUrl, setCustomUrl] = useState("");

  // Check if project has an index.html or package.json to determine preview type
  const hasHtml = files.some(f => f.name === "index.html" || f.path.includes("index.html"));
  const hasPackageJson = files.some(f => f.name === "package.json");
  const isReactProject = hasPackageJson;

  const deviceSizes = {
    desktop: { width: "100%", height: "100%" },
    tablet: { width: "768px", height: "1024px" },
    mobile: { width: "375px", height: "667px" }
  };

  const startPreview = async () => {
    setIsRunning(true);
    
    // For React projects, we'd typically start a dev server
    if (isReactProject) {
      // In a real implementation, this would start the React dev server
      setPreviewUrl("http://localhost:3000");
    } else if (hasHtml) {
      // For static HTML, serve directly
      setPreviewUrl("/preview/static");
    } else {
      // Create a basic HTML preview
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project Preview</h1>
        <p>Your project will appear here when you add HTML files or start a development server.</p>
        <p>To get started:</p>
        <ul>
            <li>Create an index.html file for static websites</li>
            <li>Or add a package.json for React/Node.js projects</li>
        </ul>
    </div>
</body>
</html>`;
      
      if (onCreateFile) {
        onCreateFile("index.html", htmlContent);
      }
      setPreviewUrl("/preview/default");
    }
  };

  const stopPreview = () => {
    setIsRunning(false);
    setPreviewUrl("");
  };

  const refreshPreview = () => {
    if (previewUrl) {
      // Force reload the iframe
      const iframe = document.querySelector('#preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const loadCustomUrl = () => {
    if (customUrl) {
      setPreviewUrl(customUrl);
      setIsRunning(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--vs-editor-bg))] text-[hsl(var(--vs-editor-fg))]">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-[hsl(var(--vs-border))] bg-[hsl(var(--vs-sidebar-bg))]">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Preview
        </h2>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-b border-[hsl(var(--vs-border))] bg-[hsl(var(--vs-panel-bg))]">
        {!isRunning ? (
          <Button 
            onClick={startPreview}
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-3 h-3 mr-1" />
            Start
          </Button>
        ) : (
          <Button 
            onClick={stopPreview}
            size="sm" 
            variant="destructive"
          >
            Stop
          </Button>
        )}
        
        <Button 
          onClick={refreshPreview}
          size="sm" 
          variant="outline"
          disabled={!isRunning}
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
        
        <Button 
          onClick={openInNewTab}
          size="sm" 
          variant="outline"
          disabled={!isRunning}
        >
          <ExternalLink className="w-3 h-3" />
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            onClick={() => setDeviceMode("desktop")}
            size="sm"
            variant={deviceMode === "desktop" ? "default" : "outline"}
          >
            <Monitor className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => setDeviceMode("tablet")}
            size="sm"
            variant={deviceMode === "tablet" ? "default" : "outline"}
          >
            <Tablet className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => setDeviceMode("mobile")}
            size="sm"
            variant={deviceMode === "mobile" ? "default" : "outline"}
          >
            <Smartphone className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Custom URL Input */}
      <div className="flex items-center gap-2 p-3 border-b border-[hsl(var(--vs-border))] bg-[hsl(var(--vs-panel-bg))]">
        <Input
          placeholder="Enter custom URL to preview..."
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="flex-1 text-xs bg-[hsl(var(--vs-input-bg))] border-[hsl(var(--vs-border))]"
          onKeyDown={(e) => e.key === 'Enter' && loadCustomUrl()}
        />
        <Button onClick={loadCustomUrl} size="sm" variant="outline">
          Load
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-3 bg-[hsl(var(--vs-editor-bg))]">
        {isRunning && previewUrl ? (
          <div className="h-full flex justify-center items-start">
            <div 
              className="bg-white border border-[hsl(var(--vs-border))] rounded overflow-hidden shadow-lg"
              style={{
                width: deviceSizes[deviceMode].width,
                height: deviceSizes[deviceMode].height,
                maxWidth: "100%",
                maxHeight: "100%"
              }}
            >
              <iframe
                id="preview-iframe"
                src={previewUrl}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-[hsl(var(--vs-editor-fg))] opacity-60">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium mb-2">No Preview Running</h3>
              <p className="text-sm mb-4">
                {isReactProject ? 
                  "Click Start to run your React application" :
                  hasHtml ? 
                    "Click Start to preview your HTML project" :
                    "Create an index.html file or add a package.json to preview your project"
                }
              </p>
              <p className="text-xs opacity-60">
                You can also enter a custom URL above to preview any website
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}