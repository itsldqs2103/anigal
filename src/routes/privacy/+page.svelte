<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Privacy Policy - Media Library</title>
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
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Privacy Policy</h1>
			<p class="mt-1 text-xs text-base-content/40">
				Last updated: {new Date().toLocaleDateString()}
			</p>
		</div>

		<div class="space-y-6 px-5 py-6 text-sm leading-6 text-base-content/65 sm:px-6 sm:py-7">
			<section>
				<h2 class="font-semibold text-base-content">Information we collect</h2>
				<p class="mt-1.5">
					We may collect your email address, account information, uploaded images, and information
					needed to operate and secure Media Library.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">How we use your information</h2>
				<p class="mt-1.5">
					Your information is used to provide, maintain, secure, and improve the service, including
					authentication and image management.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Uploaded images</h2>
				<p class="mt-1.5">
					Images you upload are stored so you can view and manage them through your account. You are
					responsible for the content you upload.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Cookies</h2>
				<p class="mt-1.5">
					We may use cookies when necessary for authentication, security, and core functionality.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Data security</h2>
				<p class="mt-1.5">
					We take reasonable measures to protect your information, but no online service can
					guarantee complete security.
				</p>
			</section>

			<section>
				<h2 class="font-semibold text-base-content">Contact</h2>
				<p class="mt-1.5">
					If you have questions about this Privacy Policy, please contact the service administrator.
				</p>
			</section>
		</div>
	</article>
</main>
