import { useEffect } from "react";

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export function useKeyboard(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [];
      
      if (event.ctrlKey) key.push("ctrl");
      if (event.shiftKey) key.push("shift");
      if (event.altKey) key.push("alt");
      if (event.metaKey) key.push("meta");
      
      key.push(event.key.toLowerCase());
      
      const keyString = key.join("+");
      
      if (shortcuts[keyString]) {
        event.preventDefault();
        shortcuts[keyString]();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
}
