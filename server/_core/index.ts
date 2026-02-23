import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Ensure temp directory exists
  const fs = await import('fs');
  const path = await import('path');
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File download endpoint
  app.get("/api/download/:filePath(*)", async (req, res) => {
    try {
      let filePath = decodeURIComponent(req.params.filePath);
      const fs = await import('fs');
      
      // Security check: only allow files with temp/temporary patterns in path
      // This is more lenient to support different temp directory structures across systems
      const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
      const isTempFile = normalizedPath.includes('/temp/') || 
                         normalizedPath.includes('/tmp/') ||
                         normalizedPath.startsWith('/tmp/') ||
                         normalizedPath.match(/\/temp[^\/]*\//);
      
      if (!isTempFile) {
        console.error('[Download] Access denied - not a temp file:', filePath);
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Set headers for download
      // Use custom filename from query parameter if provided, otherwise extract from path
      const fileName = req.query.filename ? String(req.query.filename) : (filePath.split('/').pop() || 'download');
      const fileExt = fileName.split('.').pop()?.toLowerCase();
      
      // Set appropriate Content-Type based on file extension
      let contentType = 'application/octet-stream';
      if (fileExt === 'pdf') {
        contentType = 'application/pdf';
      } else if (fileExt === 'docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileExt === 'xlsx') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (fileExt === 'csv') {
        contentType = 'text/csv';
      } else if (fileExt === 'zip') {
        contentType = 'application/zip';
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
