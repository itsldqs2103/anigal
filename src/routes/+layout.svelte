<script lang="ts">
	import './app.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/lazysizes';

	let { children } = $props();

	document.addEventListener('dragstart', (e: DragEvent) => {
		if (e.target instanceof Element && e.target.closest('a, img')) {
			e.preventDefault();
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
