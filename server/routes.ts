import type { Express } from "express";
import { createServer, type Server } from "http";
import { handleAIChat } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Assistant endpoint
  app.post("/api/ai/chat", handleAIChat);
  
  // File operations endpoints
  app.get("/api/files", (req, res) => {
    // Return file tree structure
    res.json({ message: "File API not implemented yet" });
  });

  app.post("/api/files", (req, res) => {
    // Create new file
    res.json({ message: "File creation not implemented yet" });
  });

  app.put("/api/files/:path", (req, res) => {
    // Update file content
    res.json({ message: "File update not implemented yet" });
  });

  app.delete("/api/files/:path", (req, res) => {
    // Delete file
    res.json({ message: "File deletion not implemented yet" });
  });

  // Terminal execution endpoint
  app.post("/api/terminal/execute", async (req, res) => {
    try {
      const { command } = req.body;
      
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: 'Command is required' });
      }

      const { spawn } = await import('child_process');
      const childProcess = spawn('bash', ['-c', command], {
        cwd: process.cwd(),
        env: process.env,
      });

      let output = '';
      let error = '';

      childProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      childProcess.on('close', (code) => {
        res.json({
          output: output || error,
          exitCode: code,
          command,
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        childProcess.kill();
        if (!res.headersSent) {
          res.json({
            output: output + error + '\nCommand timed out after 30 seconds',
            exitCode: 124,
            command,
          });
        }
      }, 30000);

    } catch (err) {
      console.error('Terminal execution error:', err);
      res.status(500).json({ 
        error: 'Failed to execute command',
        output: '',
        exitCode: 1,
        command: req.body.command || ''
      });
    }
  });

  // Code execution endpoints (for future implementation)
  app.post("/api/execute/javascript", (req, res) => {
    res.json({ message: "JavaScript execution not implemented yet" });
  });

  app.post("/api/execute/python", (req, res) => {
    res.json({ message: "Python execution not implemented yet" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
