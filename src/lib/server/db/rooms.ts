import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { rooms } from "./schema";

export const createRoom = async (data: typeof rooms.$inferInsert) => 
    (await getDb().insert(rooms)
            .values(data)
            .returning())[0];

export const getRoom = async (id: string) => (await getDb().select().from(rooms).where(eq(rooms.id, id)))[0];

export const updateRoom = async (id: string, data: Partial<typeof rooms.$inferInsert>) =>
    (await getDb().update(rooms).set(data).where(eq(rooms.id, id)).returning())[0];

export const getRoomsByGame = async (gameId: string) => await getDb().select().from(rooms).where(eq(rooms.gameId, gameId));

export const isEnd = async (roomId: string) => {
    const room = await getRoom(roomId);
    return room?.end === 1;
}

export const discoverRoom = async (roomId: string) => {
    await getDb().update(rooms).set({ discovered: 1 }).where(eq(rooms.id, roomId));
}