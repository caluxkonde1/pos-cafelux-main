import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

// Vercel Function Runtime: nodejs18.x (configured in vercel.json)

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize routes and database
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return;
  
  try {
    // Dynamic imports for TypeScript files (Vercel handles TS compilation)
    const routesModule = await import('../server/routes');
    const enhancedRoutesModule = await import('../server/enhanced-routes');
    
    // Setup routes
    if (routesModule.registerRoutes) {
      await routesModule.registerRoutes(app);
    }
    if (enhancedRoutesModule.registerEnhancedRoutes) {
      enhancedRoutesModule.registerEnhancedRoutes(app);
    }
    
    isInitialized = true;
    console.log('✅ Vercel API initialized successfully');
  } catch (error) {
    console.error('❌ Setup error:', error);
    console.error('Error details:', error.message);
    // Continue with basic functionality even if setup fails
    isInitialized = true; // Mark as initialized to prevent retry loops
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    initialized: isInitialized
  });
});

// Catch-all for API routes
app.all('/api/*', async (req, res, next) => {
  await initializeApp();
  next();
});

// Export for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure initialization
  await initializeApp();
  
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
