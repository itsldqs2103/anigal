<script lang="ts">
	import './app.css';
	import favicon from '../assets/favicon.svg';
	import '$lib/lazysizes';
	import CookieConsent from '$lib/components/CookieConsent.svelte';

	let { children } = $props();

	if (typeof document !== 'undefined') {
		document.addEventListener('dragstart', (e: DragEvent) => {
			if (e.target instanceof Element && e.target.closest('a, img')) {
				e.preventDefault();
			}
		});
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<CookieConsent />
