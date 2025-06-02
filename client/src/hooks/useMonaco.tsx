import { useState, useCallback } from "react";

declare global {
  interface Window {
    monaco?: any;
    require?: any;
  }
}

export function useMonaco() {
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEditor = useCallback(async (container: HTMLElement) => {
    if (editor || isLoading) return;

    setIsLoading(true);

    try {
      // Load Monaco Editor via AMD loader
      if (!window.require) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Configure paths
      window.require.config({
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
      });

      // Load the editor
      await new Promise((resolve) => {
        window.require(['vs/editor/editor.main'], resolve);
      });

      // Create editor instance
      const monacoEditor = window.monaco.editor.create(container, {
        value: '',
        language: 'typescript',
        theme: 'vs-dark',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        minimap: { enabled: true },
        automaticLayout: true,
        wordWrap: 'off',
        folding: true,
        glyphMargin: true,
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        selectOnLineNumbers: true,
        smoothScrolling: true,
        cursorBlinking: 'blink',
        cursorStyle: 'line',
        mouseWheelZoom: true,
      });

      setEditor(monacoEditor);

      // Auto-resize on window resize
      const resizeHandler = () => {
        monacoEditor.layout();
      };
      window.addEventListener('resize', resizeHandler);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', resizeHandler);
        monacoEditor.dispose();
      };

    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editor, isLoading]);

  return {
    editor,
    isLoading,
    loadEditor,
  };
}
