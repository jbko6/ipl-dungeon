import { getActiveGame, getGame } from '$lib/server/db/games.js';
import { getPlayer, moveToRoom } from '$lib/server/db/players.js';
import { getRoom } from '$lib/server/db/rooms.js';
import { produce } from 'sveltekit-sse';

export async function GET({ params, cookies }) {
    const gameID = params.id;
    const game = await getActiveGame(gameID);
    const playerId = cookies.get('player-id');
    const player = playerId ? await getPlayer(playerId) : null;
    if (!game) {
        return new Response('Not found', { status: 404 });
    }
    return produce(async function start({ emit }) {
        console.log('SSE connection established for game', gameID, 'and player', playerId);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const game = await getGame(gameID);
            if (!game || !game.active) {
                emit('end', 'Game ended');
                break;
            }
            if (game.started && player) {
                // gameplay logic here
                if (!player.roomId) {
                    // Assign player to a random surface room if they don't have one
                    player.roomId = game.surfaceRooms[Math.floor(Math.random() * game.surfaceRooms.length)];
                    await moveToRoom(player.id, player.roomId);
                }

                const room = await getRoom(player.roomId);

                if (emit('room', JSON.stringify(room)).error) break;
            }
            
            if (emit('game', JSON.stringify(game)).error) break;
        }
        console.log('SSE connection closed');
    });
}
