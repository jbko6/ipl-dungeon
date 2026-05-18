<script lang="ts">
    import { page } from "$app/state";
</script>

<div class="error-container">
    <h1>{page.status}</h1>
    <p>{page.error?.message}</p>
</div>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 75vh;
        text-align: center;
    }

    .error-container h1 {
        font-family: 'New Rocker', cursive;
        font-size: 6rem;
        margin-bottom: 0rem;
    }

    .error-container p {
        font-size: 1.5rem;
        max-width: 600px;
        font-style: italic;
        margin: 0.5rem;
    }
</style>