<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Terms of Service - Media Library</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
	<a
		href={resolve('/')}
		class="mb-6 inline-flex items-center gap-1.5 text-xs text-base-content/45 transition hover:text-base-content"
	>
		<ArrowLeft class="h-3.5 w-3.5" strokeWidth={1.8} />
		Back to library
	</a>

	<article class="overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm">
		<div class="border-b border-base-200 px-5 py-5 sm:px-6">
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Terms of Service</h1>
			<p class="mt-1 text-xs text-base-content/40">
				Last updated: {new Date().toLocaleDateString()}
			</p>
		</div>

		<div class="space-y-6 px-5 py-6 text-sm leading-6 text-base-content/65 sm:px-6 sm:py-7">
			<section>
				<h2 class="font-semibold text-base-content">Acceptance</h2>
				<p class="mt-1.5">
					By using Media Library, you agree to these Terms of Service. If you do not agree, please
					do not use the service.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Using the service</h2>
				<p class="mt-1.5">
					Media Library allows you to upload, store, view, and manage images. You are responsible
					for your account and your use of the service.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Your content</h2>
				<p class="mt-1.5">
					You are responsible for the images and other content you upload. You must have the
					necessary rights and permissions to use that content.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Prohibited use</h2>
				<p class="mt-1.5">
					You must not use Media Library for illegal, fraudulent, abusive, or otherwise harmful
					activities.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Availability</h2>
				<p class="mt-1.5">
					We may modify, suspend, or discontinue the service at any time. We do not guarantee that
					the service will always be available or error-free.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Changes</h2>
				<p class="mt-1.5">
					These terms may be updated from time to time. Continued use of the service after changes
					are published means you accept the updated terms.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Contact</h2>
				<p class="mt-1.5">
					If you have questions about these Terms of Service, please contact the service
					administrator.
				</p>
			</section>
		</div>
	</article>
</main>
