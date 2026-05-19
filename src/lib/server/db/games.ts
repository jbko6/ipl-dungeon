import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { games, players } from "./schema";
import { createRoom } from "./rooms";

export const createGame = async (data: typeof games.$inferInsert) => await getDb().insert(games).values(data).returning();

export const getGame = async (id: string) => (await getDb().select().from(games).where(eq(games.id, id)))[0];

export const getActiveGame = async (id: string) => (await getDb().select().from(games).where(eq(games.id, id))).filter(g => g.active)[0];

export const getGamePlayers = async (gameId: string) => await getDb().select().from(players).where(eq(players.gameId, gameId));

export const startGame = async (gameId: string, endTime: Date) => await getDb().update(games).set({ started: 1, endTime }).where(eq(games.id, gameId));

export const cancelGame = async (gameId: string) => await getDb().update(games).set({ active: 0 }).where(eq(games.id, gameId));

export const winGame = async (gameId: string, winner: string) => await getDb().update(games).set({ active: 0, winner }).where(eq(games.id, gameId));

export const generateMap = async (gameId: string) => {
    const levels = Math.floor(Math.random() * 3) + 3;
    const rooms: string[][] = [];
    for (let i = 0; i < levels; i++) {
        rooms.push([]);
    }
    const end = await createRoom({ gameId, subroomIds: [], persona: "The Final Boss", depth: levels, end: 1 });
    for (let i = levels - 1; i >= 0; i--) {
        const numRooms = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < numRooms; j++) {
            const subrooms: string[] = [];
            if (i < levels - 1) {
                // for now
                subrooms.push(rooms[i + 1][Math.floor((j * rooms[i + 1].length) / numRooms)]);
                if (rooms[i + 1].length > numRooms) {
                    if (!subrooms.includes(rooms[i + 1][Math.floor(((j - 1) * rooms[i + 1].length) / numRooms)]) && Math.random() < 0.4)
                        subrooms.push(rooms[i + 1][Math.floor(((j - 1) * rooms[i + 1].length) / numRooms)]);
                    if (!subrooms.includes(rooms[i + 1][Math.floor(((j + 1) * rooms[i + 1].length) / numRooms)]) && Math.random() < 0.2)
                        subrooms.push(rooms[i + 1][Math.floor(((j + 1) * rooms[i + 1].length) / numRooms)]);
                }
                subrooms.push(...rooms[i + 1].filter(roomId => !subrooms.includes(roomId) && Math.random() < 0.2)); // add some random extra connections
            } else {
                subrooms.push(end.id);
            }
            const personas = [
                "The Overwhelmed Procrastinator",
                "The Overconfident Student",
                "The Reluctant Asker",
                "The Frequent Flyer",
                "The Shortcut Seeker"
            ]
            rooms[i].push((await createRoom({ gameId, subroomIds: subrooms, persona: personas[Math.floor(Math.random() * personas.length)], depth: i })).id);
        }
    }
    await getDb().update(games).set({ surfaceRooms: rooms[0] }).where(eq(games.id, gameId));
}