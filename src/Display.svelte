<script lang="ts">
	import { onMount } from "svelte";
	import { loadImageFromPath } from "./loadImages";
	import { filesReady } from "./fileSystem";
	export let path: string;
	export let size: number = 64;
	let canvas: HTMLCanvasElement;

	const render = async () => {
		if (!canvas) return;
		try {
			const img = await loadImageFromPath(path);
			const ctx = canvas.getContext("2d");
			ctx?.clearRect(0, 0, 12, 12);
			ctx?.drawImage(img, 10, 10, 12, 12, 0, 0, 12, 12);
		} catch {
			// File not available yet
		}
	};

	onMount(() => {
		render();
	});

	// Re-render when files become available after directory restore
	$: if ($filesReady && canvas) {
		render();
	}
</script>

<canvas
	width="12"
	height="12"
	style="image-rendering:pixelated;width:{size}px;height:{size}px;"
	bind:this={canvas}
/>
