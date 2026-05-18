<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { resolve } from "$app/paths";
	import Countdown from "./Countdown.svelte";
	import RoomMap from "./RoomMap.svelte";
	import { page } from "$app/state";

    const { data } = $props();

    let players = $derived(data.players);
    let game = $derived(data.game);
    let rooms = $derived(data.rooms);

    $effect(() => {
        if (data.game) {
            const eventSource = new EventSource(`/game/${data.game.id}/events/admin`);
            eventSource.addEventListener('players', (event) => {
                players = JSON.parse(event.data);
            });
            eventSource.addEventListener('game', (event) => {
                game = JSON.parse(event.data);
            });
            eventSource.addEventListener('rooms', (event) => {
                rooms = JSON.parse(event.data);
            });
            eventSource.addEventListener('end', () => {
                invalidateAll();
            });
            return () => {
                eventSource.close();
            };
        }
    })
</script>

<div class="top-bar">
    {#if !game || !game.started}
        <a href={resolve('/')}>Join Game</a>
    {/if}
    <h1>Admin</h1>
    {#if game && !game.started}
        <form method="POST" use:enhance>
            <button formaction="?/startGame">Start Game</button>
        </form>
    {/if}
</div>


<div class="panel">
    {#if game}
        {#if !game.started}
            <p class="instructions">
                Visit {page.url.hostname} to join the game.
            </p>
        {/if}
        <p class={`game-id ${game.started ? 'started' : 'not-started'}`}>
            {#if !game.started}
                <span>Game ID</span>
            {/if}
            {game.id}
        </p>
        {#if !game.started}
            <div class="players">
                {#each players as player (player.id)}
                    <div>{player.name}</div>
                {/each}
            </div>
        {/if}
        {#if game.started}
            <div class="map">
                <h1>Dungeon Map</h1>
                <RoomMap {rooms} />
            </div>
        {/if}
        {#if game.started && game.endTime}
            <div class="countdown">
                <Countdown deadline={game.endTime} />
            </div>
        {/if}
        <form method="POST" class="cancel-game" use:enhance>
            <button formaction="?/cancelGame">Cancel Game</button>
        </form>
    {:else}
        <form method="POST" action="?/createGame" use:enhance>
            <button type="submit">Create Game</button>
        </form>
    {/if}
</div>

<style>
    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1em 2em;
        background-color: var(--background-color);
        border-bottom: var(--background-color-08) 2px solid;
        position: relative;
        height: 3em;
    }

    .top-bar a {
        color: var(--foreground-color);
        text-decoration: none;
        font-style: italic;
        padding: 0.5em 1em;
        font-size: 1rem;
        transition: background-color 0.3s ease;
    }

    .top-bar h1 {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'New Rocker', cursive;
        font-size: 2.5rem;
        margin: 0;
        text-align: center;
        color: var(--foreground-color);
    }

    .cancel-game {
        position: absolute;
        left: 1em;
        bottom: 1em;
        & button {
            border: none;
        }
    }

    .panel {
        padding: 2em;
        border-radius: 8px;
        width: 100%;
        max-width: 75vw;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .game-id {
        font-size: 5rem;
        color: var(--foreground-color);
        margin-top: 0;
        background-color: var(--background-color-08);
        border-radius: 16px;
        padding: 0.25em 0.5em;
        transition: all 0.3s ease;
    }

    .game-id span {
        display: block;
        font-size: 1rem;
        font-style: italic;
        text-align: center;
    }

    .game-id.started {
        font-size: 2em;
        position: absolute;
        top: 0.5em;
        right: 0.5em;
    }

    .players {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1em;
        margin-bottom: 1em;
    }

    .players > div {
        background-color: var(--background-color-08);
        padding: 0.5em 1em;
        border-radius: 4px;
        color: var(--foreground-color);
    }

    button {
        padding: 0.5em 1em;
        font-size: 1.2rem;
        background-color: var(--background-color-08);
        color: var(--foreground-color);
        border: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
        cursor: pointer;
    }

    button:hover {
        background-color: var(--background-color-06);
    }

    .countdown {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 0.3em;
    }

    .map {
        background: var(--background-color);
        padding: 1em 2em;
        border-radius: 16px;
        text-align: center;
        width: 100%;
    }
</style>