import { getActiveGame } from '$lib/server/db/games.js';
import { createPlayer, getPlayer, moveToRoom } from '$lib/server/db/players';
import { getRoom } from '$lib/server/db/rooms.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params, cookies }) => {
    const game = await getActiveGame(params.id);
    if (!game) {
        redirect(302, '/');
    }
    const playerId = cookies.get('player-id');
    if (!playerId) {
        return;
    }
    const player = await getPlayer(playerId);
    const room = player && player.roomId ? await getRoom(player.roomId) : null;
    return {
        player,
        game,
        room
    }
};

export const actions = {
    joinGame: async ({ params, cookies, request }) => {
        const gameId = params.id;
        if (!(await getActiveGame(gameId))) {
            throw error(404, 'Not found');
        }
        const playerId = cookies.get('player-id');
        if (playerId && (await getPlayer(playerId))) {
            throw error(400, 'Player already exists');
        }
        const name = (await request.formData()).get('name') as string | undefined;
        if (!name) {
            throw error(400, 'Name is required');
        }
        const player = await createPlayer({ gameId, name });
        return {
            playerId: player.id
        }
    },
    enterSubroom: async ({ params, cookies, request }) => {
        const gameId = params.id;
        if (!(await getActiveGame(gameId))) {
            throw error(404, 'Not found');
        }
        const playerId = cookies.get('player-id');
        if (!playerId) {
            throw error(401, 'Unauthorized');
        }
        const player = await getPlayer(playerId);
        if (!player) {
            throw error(401, 'Unauthorized');
        }
        const formData = await request.formData();
        const roomId = formData.get('subroomId') as string | undefined;
        if (!roomId) {
            throw error(400, 'Room ID is required');
        }
        const room = await getRoom(roomId);
        if (!room || room.gameId !== gameId) {
            throw error(400, 'Invalid room ID');
        }
        await moveToRoom(player.id, roomId);
    }
}