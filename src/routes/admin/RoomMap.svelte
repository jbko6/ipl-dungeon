<script lang="ts">
	import type { rooms as Rooms } from "$lib/server/db/schema";
	import { SvelteMap } from "svelte/reactivity";

    let { rooms }: { rooms: (typeof Rooms.$inferSelect)[] } = $props();

    const levels: Map<number, typeof rooms> = $derived.by(() => {
        const map = new SvelteMap<number, typeof rooms>();
        rooms.forEach(room => {
            if (!map.has(room.depth)) {
                map.set(room.depth, []);
            }
            map.get(room.depth)?.push(room);
        });
        console.log("Levels map:", Array.from(map.entries()));
        return map;
    });

    const findRoomById = (id: string) => rooms.find(r => r.id === id);

    const findRoomPosition = (id: string) => {
        for (const [level, rooms] of levels.entries()) {
            const index = rooms.findIndex(r => r.id === id);
            if (index !== -1) {
                return { level, index, total: rooms.length };
            }
        }
        return null;
    };

    const calculateX = (index: number, total: number) => `${((0.5 + index) / total) * 100}%`;
    const calculateArrowX = (index: number, total: number) => `${((0.5 + index) / total) * 100}%`;
    const calculateY = (level: number) => level * 120;

    const calculateTextX = (index: number, total: number) => `${((0.5 + index) / total) * 100 - 0.5}%`;


</script>

<svg width="100%" height="600px">
    {#each Array.from(levels.entries()) as [level, rooms] (level)}
        {#each Object.entries(rooms) as [index, room] (room.id)}
            {#if room.end}
                <circle 
                    cy={calculateY(level)+25} 
                    cx={calculateX(Number(index), rooms.length)} 
                    r="25" 
                    fill="red"
                    stroke="black" 
                />
            {:else}
            <circle 
                cy={calculateY(level)+25} 
                cx={calculateX(Number(index), rooms.length)} 
                r="25" 
                fill="white"
                stroke="black" 
            />
            <text y={calculateY(level) + 32} x={calculateTextX(Number(index), rooms.length)} font-size="25">{room.playerIds.length}</text>

            <g transform='translate(0, 0)'>
                {#each room.subroomIds as subroomId (subroomId)}
                    {#if findRoomById(subroomId)}
                            <line 
                                x1={calculateArrowX(Number(index), rooms.length)} 
                                y1={calculateY(level) + 50} 
                                x2={calculateArrowX(findRoomPosition(subroomId)!.index, findRoomPosition(subroomId)!.total)} 
                                y2={calculateY(findRoomPosition(subroomId)!.level)} 
                                stroke="white"
                                stroke-width="2" 
                            />
                    {/if}
                {/each}
            </g>
            {/if}
        {/each}
    {/each}
</svg>