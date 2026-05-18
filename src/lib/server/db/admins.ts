import { db } from "./client";
import { admins, games } from "./schema";
import { eq } from "drizzle-orm";

export const isAdmin = async (id: string) => await db.select().from(admins).where(eq(admins.id, id)).get() !== undefined;

export const getAdminGame = async (id: string) => await (await db.select().from(games).where(eq(games.createdBy, id))).filter((g) => g.active)[0];