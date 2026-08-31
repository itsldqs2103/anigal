<script lang="ts">
	import './app.css';
	import '$lib/lazysizes';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { onMount } from 'svelte';
	import favicon from '../assets/favicon.ico';
	import { dev } from '$app/environment';
	import { Images } from 'lucide-svelte';
	import { resolve } from '$app/paths';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	injectSpeedInsights();

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
	<meta name="description" content="Media Library built with SvelteKit." />
	<link rel="icon" href={favicon} />
	{#if !dev}
		<link rel="manifest" href="/manifest.webmanifest" />
	{/if}
</svelte:head>

<div class="p-4">
	{@render children()}

	<footer class="mt-auto border-t border-base-300/60 bg-base-100">
		<div class="mx-auto max-w-6xl px-4 py-6 sm:px-5">
			<div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content"
					>
						<Images class="h-4 w-4" strokeWidth={1.8} />
					</div>

					<div>
						<p class="text-xs font-semibold tracking-tight">Media Library</p>
						<p class="text-[11px] text-base-content/40">Media Library built with SvelteKit.</p>
					</div>
				</div>

				<nav class="flex items-center gap-4 text-xs text-base-content/45">
					<a href={resolve('/privacy')} class="transition hover:text-base-content"> Privacy </a>

					<a href={resolve('/terms')} class="transition hover:text-base-content"> Terms </a>
				</nav>
			</div>

			<div class="my-5 h-px bg-base-200"></div>

			<div class="flex flex-col items-center justify-between gap-2 sm:flex-row">
				<p class="text-[11px] text-base-content/35">
					&copy; 2026 Media Library. All rights reserved.
				</p>

				<div class="flex items-center gap-1.5 text-[11px] text-base-content/35">
					<span>Built with</span>

					<span class="font-medium text-base-content/55">SvelteKit</span>

					<span class="text-base-content/20">·</span>

					<span>Powered by</span>

					<span class="font-medium text-base-content/55">Vercel</span>
				</div>
			</div>
		</div>
	</footer>
</div>

<CookieConsent />
