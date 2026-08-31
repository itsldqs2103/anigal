<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} - Error</title>
</svelte:head>

<div class="hero bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<div class="mb-6 text-8xl font-bold text-error">404</div>

			<h1 class="mb-4 text-4xl font-bold">
				{page.error?.message ?? 'Something went wrong'}
			</h1>

			<p class="mb-8 text-base-content/70">
				The page you're looking for doesn't exist or an unexpected error occurred.
			</p>

			<a href={resolve('/')} class="btn btn-primary"> Go back home </a>
		</div>
	</div>
</div>
