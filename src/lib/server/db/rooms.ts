import { eq } from "drizzle-orm";
import { db } from "./client";
import { rooms } from "./schema";

export const createRoom = async (data: typeof rooms.$inferInsert) => 
    (await db.insert(rooms)
            .values(data)
            .returning())[0];

export const getRoom = async (id: string) => (await db.select().from(rooms).where(eq(rooms.id, id)))[0];

export const getRoomsByGame = async (gameId: string) => await db.select().from(rooms).where(eq(rooms.gameId, gameId));