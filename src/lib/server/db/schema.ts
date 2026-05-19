import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const timestamps = {
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
}

export const admins = sqliteTable('admins', {
    id: text('id').primaryKey().$defaultFn(() => nanoid(15)),
    ...timestamps
});

export const players = sqliteTable('players', {
    id: text('id').primaryKey().$defaultFn(() => nanoid(15)),
    name: text('name').notNull(),
    roomId: text('room_id').references(() => rooms.id),
    gameId: text('game_id').notNull().references(() => games.id),
    ...timestamps
});

export const games = sqliteTable('games', {
    id: text('id').primaryKey().$defaultFn(() => nanoid(5)),
    createdBy: text('created_by').notNull().references(() => admins.id),
    active: integer('active').notNull().default(1),
    started: integer('started').notNull().default(0),
    endTime: integer('end_time', { mode: 'timestamp' }),
    surfaceRooms: text('surface_rooms', { mode: 'json' }).notNull().$type<string[]>(),
    winner: text('winner'),
    ...timestamps
});

export const rooms = sqliteTable('rooms', {
    id: text('id').primaryKey().notNull().$defaultFn(() => nanoid(15)),
    gameId: text('game_id').notNull().references(() => games.id),
    subroomIds: text('subroom_ids', { mode: 'json' }).notNull().$type<string[]>(),
    playerIds: text('player_ids', { mode: 'json' }).notNull().$type<string[]>().default([]),
    persona: text('persona').notNull(),
    discovered: integer('discovered').notNull().default(0),
    depth: integer('depth').notNull().default(0),
    end: integer('end').notNull().default(0),
    ...timestamps
});

export const interactions = sqliteTable('interactions', {
    id: text('id').primaryKey().notNull(),
    gameId: text('game_id').notNull().references(() => games.id),
    playerId: text('player_id').notNull().references(() => players.id),
    roomId: text('room_id').notNull().references(() => rooms.id),
    messages: text('messages', { mode: 'json' }).notNull().$type<ChatCompletionMessageParam[]>(),
    completed: integer('completed').notNull().default(0),
    ...timestamps
});

export const adminsRelations = relations(admins, ({ many }) => ({
    games: many(games)
}));

export const playersRelations = relations(players, ({ one, many }) => ({
    game: one(games, {
        fields: [players.gameId],
        references: [games.id],
        relationName: 'player_game'
    }),
    room: one(rooms, {
        fields: [players.roomId],
        references: [rooms.id],
        relationName: 'player_room'
    }),
    interactions: many(interactions)
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
    creator: one(admins, {
        fields: [games.createdBy],
        references: [admins.id],
        relationName: 'admin_games'
    }),
    players: many(players),
    rooms: many(rooms),
    interactions: many(interactions)
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    game: one(games, {
        fields: [rooms.gameId],
        references: [games.id]
    }),
    players: many(players),
    interactions: many(interactions)
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
    game: one(games, {
        fields: [interactions.gameId],
        references: [games.id]
    }),
    player: one(players, {
        fields: [interactions.playerId],
        references: [players.id]
    }),
    room: one(rooms, {
        fields: [interactions.roomId],
        references: [rooms.id]
    })
}));