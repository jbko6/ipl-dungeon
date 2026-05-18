import { getDb } from "./client";
import { players, rooms } from "./schema";
import { eq } from "drizzle-orm";

export const createPlayer = async (data: typeof players.$inferInsert) => (await getDb().insert(players).values(data).returning())[0];

export const getPlayer = async (id: string) => await getDb().select().from(players).where(eq(players.id, id)).get();

export const moveToRoom = async (playerId: string, roomId: string) => {
    console.log(`Moving player ${playerId} to room ${roomId}. stack: ${new Error().stack}`);
    const currRoom = await getDb().select().from(players).where(eq(players.id, playerId)).get();
    if (currRoom?.roomId) {
        const currRoomData = await getDb().select().from(rooms).where(eq(rooms.id, currRoom.roomId)).get();
        if (currRoomData) {
            const newPlayerIds = currRoomData.playerIds.filter(id => id !== playerId);
            await getDb().update(rooms).set({ playerIds: newPlayerIds }).where(eq(rooms.id, currRoom.roomId));
        }
    }
    const newRoomData = await getDb().select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!newRoomData) {
        throw new Error('Room not found');
    }
    await getDb().update(rooms).set({ playerIds: [...newRoomData.playerIds, playerId] }).where(eq(rooms.id, roomId));
    await getDb().update(players).set({ roomId }).where(eq(players.id, playerId))
};