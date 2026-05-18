import { getActiveGame } from "$lib/server/db/games";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
    joinGame: async ({ request }) => {
        const formData = await request.formData();
        const gameId = formData.get('gameId');
        if (typeof gameId !== 'string') {
            return fail(400, { error: 'Game ID is required' });
        }
        if (!(await getActiveGame(gameId))) {
            return fail(404, { error: 'Game not found' });
        }
        redirect(303, `/game/${gameId}`);
    }
}