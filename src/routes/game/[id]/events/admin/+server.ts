import { getAdminGame } from '$lib/server/db/admins';
import { cancelGame, getActiveGame, getGame, getGamePlayers } from '$lib/server/db/games';
import { getRoomsByGame } from '$lib/server/db/rooms.js';
import { error } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';

export async function GET({ cookies, params }) {
    const adminId = cookies.get('admin-id');
    if (!adminId || (await getAdminGame(adminId))?.id !== params.id) {
        return error(401, "Unauthorized");
    }
    const gameId = params.id;
    const game = await getActiveGame(gameId);
    if (!game) {
        return error(404, "Not found");
    }
    return produce(async function start({ emit }) {
        console.log('Admin SSE connection established for game', gameId);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const game = await getGame(gameId);
            if (!game) {
                emit('end', 'Game ended');
                break;
            }
            if (game.started && game.endTime && new Date() > game.endTime) {
                await cancelGame(gameId);
                emit('end', 'Game ended');
                break;
            }
            const players = game ? await getGamePlayers(gameId) : [];
            const rooms = game ? await getRoomsByGame(gameId) : [];
            if (emit('game', JSON.stringify(game)).error) break;
            if (emit('players', JSON.stringify(players)).error) break;
            if (emit('rooms', JSON.stringify(rooms)).error) break;
        }
        console.log('Admin SSE connection closed for game', gameId);
    });
}