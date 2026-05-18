<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
	import DungeonRoom from "./DungeonRoom.svelte";

    const { data } = $props();

    let game = $derived(data.game);
    let player = $derived(data.player);
    let room = $derived(data.room);

    $effect(() => {
        if (data.game) {
            const eventSource = new EventSource(`/game/${data.game.id}/events`);
            eventSource.addEventListener('game', (event) => {
                game = JSON.parse(event.data);
            });
            eventSource.addEventListener('room', (event) => {
                const newRoom = JSON.parse(event.data);
                if (!room || newRoom.id !== room.id) {
                    room = newRoom;
                }
            });
            eventSource.addEventListener('end', () => {
                navigation.navigate(page.url.pathname + '/results');
            });
            return () => {
                eventSource.close();
            };
        }
    });
</script>

<p class="game-id">{page.params.id + (game && player ? ` | ${player.name}` : '')}</p>
<div class="game-container">
    {#if player}
        {#if game?.started}
            {#if room}
                <DungeonRoom {room} />
            {/if}
        {:else}
            <p class="waiting">Waiting for the game to start...</p>
        {/if}
    {:else}
        <h2 class="game-intro">You prepare to enter the dungeon...</h2>
        <form method="POST" action="?/joinGame" use:enhance={() => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    if (result.data && result.data.playerId) {
                        window.cookieStore.set('player-id', result.data.playerId as string);
                        invalidateAll();
                    }
                }
            }
        }}>
            <input type="text" name="name" placeholder="Your Name" required autofocus />
            <button type="submit">Enter</button>
        </form>
    {/if}
</div>

<style>
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2em;
        height: 80vh;
        justify-content: center;
    }

    .game-id {
        margin: 0;
        background: var(--background-color);
        padding: 0.5em 1em;
        border-radius: 8px;
        font-size: 1.5em;
        position: absolute;
        left: 1em;
        top: 1em;
        color: rgba(from var(--foreground-color) r g b / 0.4);
    }

    .game-intro {
        font-family: 'New Rocker', cursive;
        font-size: 2rem;
        text-align: center;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
    }

    input {
        background: var(--background-color);
        border: var(--background-color-04) 2px solid;
        color: var(--foreground-color);
        padding: 0.5em 0.8em;
        outline: none;
        transition: all 0.1s ease;
    }

    input:focus {
        border-color: var(--foreground-color);
    }

    button {
        background: var(--background-color-08);
        color: var(--foreground-color);
        border: none;
        padding: 0.5em 1em;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        font-family: 'New Rocker', cursive;
    }

    button:hover {
        background: var(--background-color-04);
    }

    .waiting {
        font-size: 1.5rem;
        color: var(--foreground-color);
        font-style: italic;
    }
</style>