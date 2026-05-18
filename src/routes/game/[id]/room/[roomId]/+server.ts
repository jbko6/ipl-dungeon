import type { RouteParams } from "$app/types";
import { getOrStartInteraction } from "$lib/server/db/interactions.js";
import { getPlayer } from "$lib/server/db/players";
import { getRoom } from "$lib/server/db/rooms.js";
import { error, json, type Cookies } from "@sveltejs/kit";

const determinePlayer = async (cookies: Cookies, params: RouteParams<"/game/[id]/room/[roomId]"> ) => {
    const playerId = cookies.get('player-id');
    if (!playerId) {
        return null;
    }
    const player = await getPlayer(playerId);
    if (!player || !player.roomId || player.gameId !== params.id || player.roomId !== params.roomId) {
        return null;
    }
    return player;
}

export async function GET({ cookies, params }) {
    const player = await determinePlayer(cookies, params);
    if (!player) {
        return error(401, "Unauthorized");
    }
    const conversationId = player.id + "-" + player.roomId;
    if (player.roomId !== params.roomId) {
        return error(400, "Player is not in the correct room");
    }
    const room = await getRoom(player.roomId);
    const existingConversation = await getOrStartInteraction({
        gameId: params.id,
        playerId: player.id,
        id: conversationId,
        roomId: params.roomId,
        messages: []
    }, room.persona);
    console.log("Existing conversation for player", player.id, "in room", player.roomId, ":", existingConversation);
    return json({ 
        output: existingConversation.messages[existingConversation.messages.length - 1]?.content || "", 
        interactionCompleted: existingConversation.completed
    });
}

export async function POST({ cookies, params, request }) {
    const player = await determinePlayer(cookies, params);
    if (!player) {
        return error(401, "Unauthorized");
    }
    const formData: FormData = await request.formData();
    const message = formData.get("message");
    if (typeof message !== "string") {
        return error(400, "Message is required");
    }
    const conversationId = player.id + "-" + player.roomId;
    if (player.roomId !== params.roomId) {
        return error(400, "Player is not in the correct room");
    }
    const room = await getRoom(player.roomId);
    const conversation = await getOrStartInteraction({
        gameId: params.id,
        playerId: player.id,
        id: conversationId,
        roomId: params.roomId,
        messages: []
    }, room.persona);
    if (!conversation) {
        return error(500, "Failed to start conversation") ;
    }
    const response = await conversation.respond({ role: "user", content: message });
    console.log("Received message:", message);
    console.log("Responding with:", response);
    console.log(response.response);
    return json({ output: response.response, interactionCompleted: response.interactionCompleted });
}