<script lang="ts">
	import type { ActionData } from './$types';
	import { UserPlus, Mail, LockKeyhole, TriangleAlert, Images } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Create account - Meida Library</title>
</svelte:head>

<div class="bg-base-200/30">
	<header class="border-b border-base-300/60 bg-base-100">
		<div class="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-5 sm:py-5">
			<div class="flex min-w-0 items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content"
				>
					<Images class="h-5 w-5" strokeWidth={1.8} />
				</div>

				<div class="min-w-0">
					<h1 class="truncate text-lg font-semibold tracking-tight">Media Library</h1>
					<p class="text-xs text-base-content/50">Manage your images</p>
				</div>
			</div>
		</div>
	</header>

	<main
		class="mx-auto flex max-w-6xl items-start justify-center px-4 py-8 sm:px-5 sm:py-14"
	>
		<section class="w-full max-w-md">
			<div class="mb-6 text-center">
				<div
					class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
				>
					<UserPlus class="h-6 w-6" strokeWidth={1.8} />
				</div>

				<h2 class="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">Create your account</h2>

				<p class="mt-1.5 text-sm leading-5 text-base-content/50">
					Get started with <b>Media Library</b>.
				</p>
			</div>

			<div class="overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm">
				<div class="p-4 sm:p-5">
					{#if form?.error}
						<div
							class="mb-5 flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 px-3 py-3 text-error sm:px-4"
							role="alert"
						>
							<TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />

							<span class="min-w-0 text-sm leading-5 wrap-break-word">
								{form.error}
							</span>
						</div>
					{/if}

					<form method="POST" class="flex flex-col gap-4">
						<div>
							<label
								for="email"
								class="mb-1.5 block text-xs font-semibold tracking-wide text-base-content/50 uppercase"
							>
								Email
							</label>

							<div
								class="flex h-12 items-center rounded-xl border border-base-300 bg-base-100 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
							>
								<div class="flex w-11 shrink-0 items-center justify-center text-base-content/40">
									<Mail class="h-4 w-4" strokeWidth={1.8} />
								</div>

								<input
									id="email"
									name="email"
									type="email"
									autocomplete="off"
									autocapitalize="off"
									value={form?.email ?? ''}
									placeholder="you@example.com"
									class="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-base-content/30"
								/>
							</div>
						</div>

						<div>
							<label
								for="password"
								class="mb-1.5 block text-xs font-semibold tracking-wide text-base-content/50 uppercase"
							>
								Password
							</label>

							<div
								class="flex h-12 items-center rounded-xl border border-base-300 bg-base-100 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
							>
								<div class="flex w-11 shrink-0 items-center justify-center text-base-content/40">
									<LockKeyhole class="h-4 w-4" strokeWidth={1.8} />
								</div>

								<input
									id="password"
									name="password"
									type="password"
									autocomplete="new-password"
									minlength="8"
									placeholder="At least 8 characters"
									class="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-base-content/30"
								/>
							</div>

							<p class="mt-1.5 px-1 text-[11px] text-base-content/40">
								Use at least 8 characters for your password.
							</p>
						</div>

						<button type="submit" class="btn mt-1 h-11 w-full rounded-xl btn-primary">
							<UserPlus class="h-4 w-4" strokeWidth={1.8} />
							Create account
						</button>
					</form>
				</div>

				<div class="border-t border-base-200 bg-base-200/30 px-4 py-4 text-center sm:px-5">
					<p class="text-xs text-base-content/50">
						Already have an account?
						<a
							href={resolve('/login')}
							class="font-semibold text-primary transition hover:underline"
						>
							Log in
						</a>
					</p>
				</div>
			</div>
		</section>
	</main>
</div>
