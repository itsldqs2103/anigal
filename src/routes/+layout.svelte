<script lang="ts">
	import './app.css';
	import '$lib/lazysizes';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';

	const webManifestLink = pwaInfo?.webManifest?.linkTag ?? '';

	let { children } = $props();

	if (typeof document !== 'undefined') {
		document.addEventListener('dragstart', (e: DragEvent) => {
			if (e.target instanceof Element && e.target.closest('a, img')) {
				e.preventDefault();
			}
		});
	}

	function handleImageError(event: Event): void {
		const img = event.target;

		if (img instanceof HTMLImageElement) {
			img.classList.add('hidden');
		}
	}

	function preventDragDrop(event: DragEvent): void {
		event.preventDefault();
	}

	onMount(() => {
		document.addEventListener('error', handleImageError, true);
		document.addEventListener('dragstart', preventDragDrop);
		document.addEventListener('drop', preventDragDrop);

		return () => {
			document.removeEventListener('error', handleImageError, true);
			document.removeEventListener('dragstart', preventDragDrop);
			document.removeEventListener('drop', preventDragDrop);
		};
	});
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>
{@render children()}

<CookieConsent />
