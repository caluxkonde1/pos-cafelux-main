import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerEnhancedRoutes } from "./enhanced-routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Skip database seeding if USE_MOCK_DATA is true
  if (process.env.USE_MOCK_DATA !== 'true') {
    try {
      await seedDatabase();
    } catch (error) {
      console.log('⚠️ Database seeding failed, continuing with mock data...');
      console.log('🔧 Set USE_MOCK_DATA=true to skip database connection');
    }
  } else {
    console.log('📦 Using mock data for development');
  }
  
  const server = await registerRoutes(app);
  
  // Register enhanced features routes
  registerEnhancedRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Force port 5001 to avoid conflict
  const port = 5001;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 POS CafeLux Enhanced Product Management System`);
    log(`📱 Server running on http://localhost:${port}`);
    log(`💎 Pro Features: Opsi Tambahan, Bundel, Bahan Baku & Resep`);
    log(`🔗 Kelola Produk: http://localhost:${port}/kelola-produk`);
  });
})();
