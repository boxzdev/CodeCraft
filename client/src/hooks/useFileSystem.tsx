import { useState, useCallback } from "react";
import type { FileItem } from "@/types/ide";

const initialFiles: FileItem[] = [
  {
    id: "1",
    name: "my-ide-project",
    path: "",
    type: "folder",
    children: [
      {
        id: "2",
        name: "src",
        path: "src",
        type: "folder",
        children: [
          {
            id: "3",
            name: "App.tsx",
            path: "src/App.tsx",
            type: "file",
          },
          {
            id: "4",
            name: "index.tsx",
            path: "src/index.tsx",
            type: "file",
          },
          {
            id: "5",
            name: "index.css",
            path: "src/index.css",
            type: "file",
          },
        ],
      },
      {
        id: "6",
        name: "components",
        path: "components",
        type: "folder",
        children: [],
      },
      {
        id: "7",
        name: "package.json",
        path: "package.json",
        type: "file",
      },
      {
        id: "8",
        name: "tsconfig.json",
        path: "tsconfig.json",
        type: "file",
      },
      {
        id: "9",
        name: "index.html",
        path: "index.html",
        type: "file",
      },
      {
        id: "10",
        name: "README.md",
        path: "README.md",
        type: "file",
      },
    ],
  },
];

const sampleFiles: Record<string, string> = {
  "src/App.tsx": `import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;`,
  "src/index.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "src/index.css": `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,
  "package.json": `{
  "name": "my-ide-project",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.18.23",
    "@types/react": "^18.0.35",
    "@types/react-dom": "^18.0.11",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
  "README.md": `# My IDE Project

This is a sample React TypeScript project created in the web IDE.

## Getting Started

To run this project:

\`\`\`bash
npm install
npm start
\`\`\`

## Features

- React 18
- TypeScript
- Modern build tools
- Hot reload development server

## Project Structure

- \`src/\` - Source code
- \`components/\` - Reusable components
- \`public/\` - Static assets`,
};

export function useFileSystem() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);

  const findFileById = useCallback((files: FileItem[], id: string): FileItem | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findParentFolder = useCallback((files: FileItem[], path: string): FileItem | null => {
    const parentPath = path.split("/").slice(0, -1).join("/");
    if (parentPath === "") return files[0]; // Root folder

    for (const file of files) {
      if (file.path === parentPath && file.type === "folder") return file;
      if (file.children) {
        const found = findParentFolder(file.children, path);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const createFile = useCallback((parentPath: string, name: string) => {
    const newFile: FileItem = {
      id: generateId(),
      name,
      path: parentPath ? `${parentPath}/${name}` : name,
      type: "file",
    };

    setFiles(prevFiles => {
      const updateFiles = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.path === parentPath && file.type === "folder") {
            return {
              ...file,
              children: [...(file.children || []), newFile],
            };
          }
          if (file.children) {
            return {
              ...file,
              children: updateFiles(file.children),
            };
          }
          return file;
        });
      };

      if (parentPath === "") {
        return prevFiles.map(file => ({
          ...file,
          children: [...(file.children || []), newFile],
        }));
      }

      return updateFiles(prevFiles);
    });
  }, [generateId]);

  const createFolder = useCallback((parentPath: string, name: string) => {
    const newFolder: FileItem = {
      id: generateId(),
      name,
      path: parentPath ? `${parentPath}/${name}` : name,
      type: "folder",
      children: [],
    };

    setFiles(prevFiles => {
      const updateFiles = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.path === parentPath && file.type === "folder") {
            return {
              ...file,
              children: [...(file.children || []), newFolder],
            };
          }
          if (file.children) {
            return {
              ...file,
              children: updateFiles(file.children),
            };
          }
          return file;
        });
      };

      if (parentPath === "") {
        return prevFiles.map(file => ({
          ...file,
          children: [...(file.children || []), newFolder],
        }));
      }

      return updateFiles(prevFiles);
    });
  }, [generateId]);

  const deleteFile = useCallback((path: string) => {
    setFiles(prevFiles => {
      const updateFiles = (files: FileItem[]): FileItem[] => {
        return files
          .filter(file => file.path !== path)
          .map(file => ({
            ...file,
            children: file.children ? updateFiles(file.children) : undefined,
          }));
      };

      return updateFiles(prevFiles);
    });
  }, []);

  const renameFile = useCallback((oldPath: string, newPath: string) => {
    setFiles(prevFiles => {
      const updateFiles = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.path === oldPath) {
            const newName = newPath.split("/").pop() || file.name;
            return {
              ...file,
              name: newName,
              path: newPath,
            };
          }
          if (file.children) {
            return {
              ...file,
              children: updateFiles(file.children),
            };
          }
          return file;
        });
      };

      return updateFiles(prevFiles);
    });
  }, []);

  const getFileContent = useCallback(async (path: string): Promise<string> => {
    // Return sample content if available, otherwise return empty string
    return sampleFiles[path] || "";
  }, []);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prevFiles => {
      const updateFiles = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === fileId) {
            return { ...file, content };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };
      return updateFiles(prevFiles);
    });
  }, []);

  return {
    files,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    getFileContent,
    updateFileContent,
  };
}
