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

    const calculateX = (index: number, total: number) => `${((0.33 + index) / total) * 100}%`;
    const calculateArrowX = (index: number, total: number) => `${((0.33 + index) / total) * 100}%`;
    const calculateY = (level: number) => level * 120;


</script>

<svg width="100%" height="500px">
    {#each Array.from(levels.entries()) as [level, rooms] (level)}
        {#each Object.entries(rooms) as [index, room] (room.id)}
            <rect 
                y={calculateY(level)} 
                x={calculateX(Number(index), rooms.length)} 
                width="100" 
                height="50" 
                fill={room.playerIds.length > 0 ? 'lightblue' : 'lightgray'} 
                stroke="black" 
            />
            <text y={calculateY(level) + 10} x={calculateX(Number(index), rooms.length)} font-size="12">{room.id}</text>

            <g transform='translate(50, 0)'>
                {#each room.subroomIds as subroomId (subroomId)}
                    {#if findRoomById(subroomId)}
                            <line 
                                x1={calculateArrowX(Number(index), rooms.length)} 
                                y1={calculateY(level) + 50} 
                                x2={calculateArrowX(findRoomPosition(subroomId)!.index, findRoomPosition(subroomId)!.total)} 
                                y2={calculateY(findRoomPosition(subroomId)!.level)} 
                                stroke="black" 
                            />
                    {/if}
                {/each}
            </g>
        {/each}
    {/each}
</svg>