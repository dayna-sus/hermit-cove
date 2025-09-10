import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using fallback storage.");
}

// Create a fallback connection for when DATABASE_URL is not set
const fallbackConnectionString = "postgresql://dummy:dummy@dummy:5432/dummy";

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || fallbackConnectionString 
});

// For fallback, we'll still create the db but operations will be handled by storage fallback
export const db = drizzle({ client: pool, schema });
