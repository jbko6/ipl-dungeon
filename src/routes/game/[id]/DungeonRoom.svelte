<script lang="ts">
	import { enhance } from "$app/forms";
	import type { rooms } from "$lib/server/db/schema";
	import { fade, fly } from "svelte/transition";

    const { room }: { room: typeof rooms.$inferSelect } = $props();

    let latestMessage = $state('');
    let pending = $state(true);
    let inputElement: HTMLInputElement | null = $state(null);
    let completed = $state(false);
    let loading = $state(true);

    const fetchInteraction = async () => {
        pending = true;
        loading = true;
        completed = false;
        const response = await fetch(`/game/${room.gameId}/room/${room.id}`);
        const data = await response.json();
        latestMessage = data.output;
        pending = false;
        loading = false;
        console.log("Fetched interaction data:", data);
        if (data.interactionCompleted) {
            completed = true;
        }
    };

    $effect(() => {
        fetchInteraction();
    });

    $effect(() => {
        if (!pending && inputElement) {
            inputElement.focus();
        }
    });

    const sendMessage = async (event: SubmitEvent) => {
        event.preventDefault();
        (event.target as HTMLFormElement).reset();
        pending = true;
        const formData = new FormData(event.target as HTMLFormElement);
        const response = await fetch(`/game/${room.gameId}/room/${room.id}`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        latestMessage = result.output;
        pending = false;
        if (result.interactionCompleted) {
            pending = true;
            setTimeout(() => {
                completed = true;
            }, 5000);
        }
    };

    const personaToImage = (persona: string) => {
        console.log(room.persona);
        switch (persona) {
            case "The Overwhelmed Procrastinator":
                return "/student1.png";
            case "The Overconfident Student":
                return "/student2.png";
            case "The Reluctant Asker":
                return "/student3.png";
            case "The Frequent Flyer":
                return "/student4.png";
            case "The Shortcut Seeker":
                return "/student5.png";
            default:
                return "/student1.png";
        }
    }

    function typewriter(node: HTMLElement, { speed = 1 }: { speed?: number }) {
		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t: number) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
    
</script>

<div class="student-overlay"></div>
{#if !loading}
    {#if completed}
        <div class="doors">
            {#each room.subroomIds as subroomId (subroomId)}
                <form method="POST" action="?/enterSubroom" use:enhance>
                    <input type="hidden" name="subroomId" value={subroomId} />
                    <button class="door" title="Enter Branch"></button>
                </form>
            {/each}
        </div>
    {:else}
        <div class="room">
            <img src={personaToImage(room.persona)} alt="Student Avatar" class="avatar"  transition:fly|global={{ y: 500, duration: 800 }} />
            <div class="msg" in:fade|global={{ duration: 500 }}>
                <div class="name">{room.persona}</div>
                {#key latestMessage}
                    <p in:typewriter={{ speed: 7 }}>{latestMessage}</p>
                {/key}
            </div>
            <div class="interaction" in:fade|global={{ duration: 500, delay: 300 }}>
                <form onsubmit={sendMessage} aria-busy={pending}>
                    <input bind:this={inputElement} type="text" name="message" placeholder="Your input here" required disabled={pending} />
                    <button type="submit" disabled={pending}>Speak</button>
                </form>
                <div class="actions">
                </div>
            </div>
        </div>
    {/if}
{/if}

<style>
    .student-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        background-image: linear-gradient(transparent, var(--background-color) 60%);
        z-index: -1;
    }

    .room {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .avatar {
        height: 500px;
        margin-bottom: 1em;
        position: absolute;
        z-index: -2;
    }

    .name {
        position: absolute;
        top: -25px;
        left: -30px;
        background: var(--background-color);
        border: var(--foreground-color-08) 2px solid;
        padding: 0.1em 0.7em;
        font-family: 'New Rocker', cursive;
        font-size: 1.2em;
    }

    .msg {
        position: absolute;
        bottom: 30%;
        padding: 0.1em 0.7em;
        background: var(--background-color);
        width: 60%;
        height: 7em;
        min-height: 3.2em;
        border: var(--foreground-color-08) 2px solid;
    }

    .interaction {
        position: absolute;
        bottom: 10%;
        display: flex;
        justify-content: center;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .interaction form {
        width: 50%;
        display: flex;
        justify-content: center;
        gap: 5px;
    }

    .interaction form[aria-busy="true"] {
        opacity: 0.5;
    }

    .interaction input {
        flex: 1;
        font-size: 1.2em;
        padding: 0.5em;
        background-color: var(--background-color);
        border: var(--foreground-color-08) 2px solid;
        color: var(--foreground-color);
        outline: none;
    }

    .interaction input:focus {
        border-color: var(--foreground-color);
    }

    .interaction button {
        background-color: var(--background-color-08);
        color: var(--foreground-color);
        border: none;
        padding: 0.5em 1em;
        font-size: 1.2em;
        cursor: pointer;
        font-family: 'New Rocker', cursive;
    }

    .doors {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        gap: 2em;
    }

    .door {
        width: 100px;
        height: 150px;
        background-color: var(--background-color-08);
        border: var(--foreground-color-08) 2px solid;
        cursor: pointer;
    }
</style>