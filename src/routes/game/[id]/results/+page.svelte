<script lang="ts">
    const { data } = $props();
</script>

<div class="results-container">
    <h1>Game Over!</h1>
    <h2>Winner: {data.game.winner}</h2>
</div>

<style>
    .results-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 75vh;
        text-align: center;
    }

    .results-container h1 {
        font-family: 'New Rocker', cursive;
        font-size: 6rem;
        margin-bottom: 0rem;
    }

    .results-container h2 {
        font-size: 2rem;
        max-width: 600px;
        font-style: italic;
        margin: 0.5rem;
    }
</style>