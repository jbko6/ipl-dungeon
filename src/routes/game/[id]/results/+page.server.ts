import { getGame } from "$lib/server/db/games";
import { redirect } from "@sveltejs/kit";
import { error } from "console";

export const load = async ({ params }) => {
    const game = await getGame(params.id);
    if (!game) {
        throw error(404, 'Not found');
    }
    if (!game.started) {
        redirect(302, '/');
    }
    if (game.active || !game.endTime) {
        throw error(400, 'Game is not over yet');
    }
    return {
        game
    };
}