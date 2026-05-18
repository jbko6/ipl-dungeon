import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/lib/server/db/schema.ts",
    out: "./src/lib/server/db/migrations",
    dialect: 'turso',
    dbCredentials: {
        url: process.env.DB_URL!,
        authToken: process.env.AUTH_TOKEN!
    }
});