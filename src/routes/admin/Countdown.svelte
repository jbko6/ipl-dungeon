<script lang="ts">
    import { onMount } from "svelte";
    import { SvelteDate } from "svelte/reactivity";

        const { deadline, onend }: { deadline: Date | string | number; onend?: () => void } = $props();

        // normalize deadline to a Date object (accepts Date, ISO string, or timestamp)
        const deadlineDate = $derived.by(() => new Date(deadline));

        let now = new SvelteDate();

        // remaining milliseconds until deadline (non-negative)
        const remaining = $derived(Math.max(0, deadlineDate.valueOf() - now.valueOf()));

        const minutes = $derived(Math.floor(remaining / 60000));
        const seconds = $derived(Math.floor((remaining % 60000) / 1000));

        onMount(() => {
            const interval = setInterval(() => {
                if (remaining <= 0) {
                    onend?.();
                    clearInterval(interval);
                    return;
                }
                now = new SvelteDate();
            }, 1000);
            return () => clearInterval(interval);
        });
</script>

<p>{minutes}:{String(seconds).padStart(2, '0')}</p>

<style>
    p {
        font-size: 2rem;
        font-family: 'New Rocker', cursive;
        background-color: var(--background-color-08);
        color: var(--foreground-color);
        padding: 0.5em 1em;
        border-radius: 4px;
        margin: 0;
        width: 4rem;
        text-align: center;
    }
</style>