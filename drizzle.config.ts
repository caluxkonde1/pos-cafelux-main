import { defineConfig } from "drizzle-kit";

// Use SQLite for local development if DATABASE_URL is not provided
const databaseUrl = process.env.DATABASE_URL;
const useLocalSQLite = !databaseUrl || databaseUrl.trim() === '';

if (useLocalSQLite) {
  console.log("🗄️ Using local SQLite database for development");
} else {
  console.log("🗄️ Using PostgreSQL database");
}

export default defineConfig(
  useLocalSQLite
    ? {
        out: "./migrations",
        schema: "./shared/schema.ts",
        dialect: "sqlite",
        dbCredentials: {
          url: "./local-database.sqlite",
        },
      }
    : {
        out: "./migrations",
        schema: "./shared/schema.ts",
        dialect: "postgresql",
        dbCredentials: {
          url: databaseUrl!,
        },
      }
);
