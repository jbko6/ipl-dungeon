import { getAdminGame, isAdmin } from '$lib/server/db/admins.js';
import { cancelGame, createGame, generateMap, getGamePlayers, startGame } from '$lib/server/db/games.js';
import { getRoomsByGame } from '$lib/server/db/rooms.js';
import { error, type Cookies } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const id = cookies.get('admin-id');
    if (!id || !(await isAdmin(id))) {
        error(403, 'Forbidden');
    }

    const game = await getAdminGame(id);
    const players = game ? await getGamePlayers(game.id) : [];
    const rooms = game ? await getRoomsByGame(game.id) : [];

    return {
        game,
        players,
        rooms
    };
}

const checkAdmin = async (cookies: Cookies) => {
    const id = cookies.get('admin-id');
    if (!id || !(await isAdmin(id))) {
        error(403, 'Forbidden');
    }
    return id;
}

export const actions = {
    createGame: async ({ cookies }) => {
        const id = await checkAdmin(cookies);
        await createGame({ createdBy: id, surfaceRooms: [] });
    },
    startGame: async ({ cookies }) => {
        const id = await checkAdmin(cookies);
        const game = await getAdminGame(id);
        if (!game) {
            error(404, 'Not found');
        }
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + 10); // Set end time to 10 minutes from now
        await generateMap(game.id);
        await startGame(game.id, endTime);
    },
    cancelGame: async ({ cookies }) => {
        const id = await checkAdmin(cookies);
        const game = await getAdminGame(id);
        if (!game) {
            error(404, 'Not found');
        }
        await cancelGame(game.id);
    }
};

