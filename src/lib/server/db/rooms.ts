import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { rooms } from "./schema";

export const createRoom = async (data: typeof rooms.$inferInsert) => 
    (await getDb().insert(rooms)
            .values(data)
            .returning())[0];

export const getRoom = async (id: string) => (await getDb().select().from(rooms).where(eq(rooms.id, id)))[0];

export const getRoomsByGame = async (gameId: string) => await getDb().select().from(rooms).where(eq(rooms.gameId, gameId));