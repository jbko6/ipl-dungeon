<script lang="ts">
	import { enhance } from "$app/forms";

    const { form } = $props();

    
</script>

<main>
    <h1>Introductory Programming <span class="larger">Dungeon</span></h1>
    <div class="join">
        <form method="POST" action="?/joinGame" use:enhance>
            <input type="text" name="gameId" placeholder="Game ID" required />
            <button type="submit">Enter the Dungeon</button>
            {#if form?.error}
                <p style="color: red;">{form.error}</p>
            {/if}
        </form>
    </div>
</main>

<style>

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100vh;
    }

    h1 {
        font-family: 'New Rocker', cursive;
        font-size: 3rem;
        margin-bottom: 1em;
        margin-top: 2em;
        text-align: center;
        color: var(--foreground-color);
    }

    h1 .larger {
        font-size: 10rem;
        display: block;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
    }

    input:valid ~ button {
        opacity: 1;
        transform: none;
    }

    input {
        padding: 0.5em 0.8em;
        font-size: 1.5rem;
        margin-right: 0.5em;
        border: var(--foreground-color-04) 2px solid;
        border-radius: 4px;
        background-color: var(--background-color-08);
        color: var(--foreground-color);
    }

    input:focus {
        outline: none;
        border-color: var(--foreground-color);
    }

    button {
        font-family: 'New Rocker', cursive;
        padding: 0.5em 1em;
        font-size: 1.2rem;
        cursor: pointer;
        background-color: var(--background-color-08);
        color: var(--foreground-color);
        border: var(--foreground-color-04) 2px solid;
        border-radius: 4px;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
    }

    button:hover {
        background-color: var(--background-color-06);
    }
</style>