import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { DB_URL, AUTH_TOKEN } from "$env/static/private";

let db: ReturnType<typeof drizzle>;

export function getDb() {
    if (!db) {
        const client = createClient({ url: DB_URL, authToken: AUTH_TOKEN });
        db = drizzle(client, { schema });
    }
    return db;
}
