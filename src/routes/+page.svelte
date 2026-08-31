<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		TriangleAlert,
		Image,
		Pencil,
		RefreshCw,
		Trash2,
		Upload,
		X,
		Images,
		Check,
		Eye,
		LogOut,
		ChevronDown
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { data, form } = $props();
	let editingId = $state('');
	let deleteId = $state('');
	let isUploading = $state(false);
	let isUpdating = $state(false);
	let isDeleting = $state(false);
	let selectedFile = $state<File | null>(null);
	let fileError = $state('');
	let successMessage = $state('');

	let updateModal: HTMLDialogElement;
	let deleteModal: HTMLDialogElement;

	const MAX_FILE_SIZE = 1 * 1024 * 1024;

	let successTimer: ReturnType<typeof setTimeout> | null = null;
	let successRemaining = 5000;
	let successStartedAt = 0;
	let successPaused = false;

	let Fancybox: typeof import('@fancyapps/ui').Fancybox | undefined;

	onMount(() => {
		let instances: Array<{
			destroy: () => void;
		}> = [];

		let destroyed = false;

		const init = async () => {
			const { default: SimpleParallax } = await import('simple-parallax-js/vanilla');

			if (destroyed) return;

			const images = document.querySelectorAll<HTMLImageElement>('img[data-parallax]');

			instances = [...images].map(
				(image) =>
					new SimpleParallax(image, {
						scale: 1.25,
						delay: 0,
						overflow: false
					})
			);
		};

		init();

		return () => {
			destroyed = true;

			instances.forEach((instance) => {
				instance.destroy();
			});
		};
	});

	onMount(() => {
		let mounted = true;

		const init = async () => {
			const { Fancybox: FancyboxModule } = await import('@fancyapps/ui');

			if (mounted) {
				Fancybox = FancyboxModule;
			}
		};

		init();

		return () => {
			mounted = false;
		};
	});

	function openLightbox(url: string, filename: string) {
		if (!Fancybox) return;

		Fancybox.show([
			{
				src: url,
				type: 'image',
				downloadSrc: url,
				downloadFilename: filename
			}
		]);
	}

	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		fileError = '';

		if (!file) {
			selectedFile = null;
			return;
		}

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

		if (!allowedTypes.includes(file.type)) {
			fileError = 'Only JPG, JPEG, PNG, and WEBP images are allowed.';
			selectedFile = null;
			input.value = '';
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			fileError = 'Image must be 1 MB or smaller.';
			selectedFile = null;
			input.value = '';
			return;
		}

		selectedFile = file;
	}

	function resetFile() {
		selectedFile = null;
		fileError = '';

		const input = document.getElementById('image-file') as HTMLInputElement | null;

		if (input) {
			input.value = '';
		}
	}

	function showSuccess(message: string) {
		if (successTimer) {
			clearTimeout(successTimer);
			successTimer = null;
		}

		successMessage = message;
		successRemaining = 5000;
		successPaused = false;

		startSuccessTimer();
	}

	function startSuccessTimer() {
		if (!successMessage || successPaused || successTimer) return;

		successStartedAt = Date.now();

		successTimer = setTimeout(() => {
			successMessage = '';
			successTimer = null;
			successRemaining = 5000;
		}, successRemaining);
	}

	function pauseSuccessTimer() {
		if (!successMessage || successPaused) return;

		successPaused = true;

		if (successTimer) {
			clearTimeout(successTimer);
			successTimer = null;

			successRemaining = Math.max(0, successRemaining - (Date.now() - successStartedAt));
		}
	}

	function resumeSuccessTimer() {
		if (!successMessage || !successPaused) return;

		successPaused = false;

		if (successRemaining <= 0) {
			dismissSuccess();
			return;
		}

		startSuccessTimer();
	}

	function dismissSuccess() {
		if (successTimer) {
			clearTimeout(successTimer);
			successTimer = null;
		}

		successMessage = '';
		successRemaining = 5000;
		successPaused = false;
	}

	function edit(id: string) {
		if (isUploading || isUpdating || isDeleting) return;

		editingId = id;
		dismissSuccess();
		resetFile();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancel() {
		if (isUploading || isUpdating || isDeleting) return;

		editingId = '';
		resetFile();
	}

	function openUpdateModal() {
		if (isUploading || isUpdating || isDeleting || !selectedFile) return;

		updateModal?.showModal();
	}

	function closeUpdateModal() {
		if (isUploading || isUpdating || isDeleting) return;

		updateModal?.close();
	}

	function openDeleteModal(id: string) {
		if (isUploading || isUpdating || isDeleting) return;

		editingId = '';
		resetFile();
		deleteId = id;
		deleteModal?.showModal();
	}

	function closeDeleteModal() {
		if (isUploading || isUpdating || isDeleting) return;

		deleteModal?.close();
	}
</script>

<svelte:head>
	<title>Homepage - AniGal</title>
</svelte:head>

<div class="bg-base-200/30">
	<header class="border-b border-base-300/60 bg-base-100">
		<div
			class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4"
		>
			<div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content sm:h-10 sm:w-10"
				>
					<Images class="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.8} />
				</div>

				<div class="min-w-0">
					<h1 class="truncate text-base font-semibold tracking-tight sm:text-lg">AniGal</h1>

					<p class="hidden text-xs text-base-content/50 sm:block">Manage your images</p>
				</div>
			</div>

			<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
				<div
					class="flex items-center gap-1.5 rounded-full border border-base-300/70 bg-base-100 px-2.5 py-1.5 sm:px-3"
					title={`${data.images?.length ?? 0} images`}
				>
					<div class="h-1.5 w-1.5 shrink-0 rounded-full bg-success"></div>

					<span class="text-xs font-medium text-base-content/60">
						<span class="sm:hidden">{data.images?.length ?? 0}</span>
						<span class="hidden sm:inline">{data.images?.length ?? 0} images</span>
					</span>
				</div>

				<div class="dropdown dropdown-end">
					<button
						type="button"
						class="btn h-9 min-h-9 w-9 rounded-xl border-base-300/70 bg-base-100 p-0 shadow-none hover:bg-base-200 sm:h-10 sm:min-h-10 sm:w-auto sm:gap-2 sm:px-2.5"
						aria-label="Open user menu"
					>
						<div
							class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-content"
						>
							{(data.user?.email?.[0] ?? 'U').toUpperCase()}
						</div>

						<span class="hidden max-w-32 truncate text-xs font-medium sm:block">
							{data.user?.email?.split('@')[0] ?? 'User'}
						</span>

						<ChevronDown class="hidden h-3.5 w-3.5 text-base-content/40 sm:block" strokeWidth={2} />
					</button>

					<div
						class="dropdown-content z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-64 overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 p-1.5 shadow-lg sm:w-64"
					>
						<div class="flex items-center gap-3 px-3 py-3">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content"
							>
								{(data.user?.email?.[0] ?? 'U').toUpperCase()}
							</div>

							<div class="min-w-0">
								<p class="text-[10px] font-medium tracking-wide text-base-content/40 uppercase">
									Signed in as
								</p>

								<p class="mt-0.5 truncate text-sm font-medium">
									{data.user?.email ?? 'User'}
								</p>
							</div>
						</div>

						<div class="my-1 h-px bg-base-200"></div>

						<form method="POST" action="/logout">
							<button
								type="submit"
								class="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition hover:bg-error/10 active:bg-error/15"
							>
								<LogOut class="h-4 w-4 shrink-0" strokeWidth={1.8} />
								<span>Log out</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
		{#if successMessage}
			<div
				role="alert"
				class="mb-6 alert rounded-xl border border-success/20 bg-success/10 alert-success text-success shadow-sm"
				onmouseenter={pauseSuccessTimer}
				onmouseleave={resumeSuccessTimer}
				onfocusin={pauseSuccessTimer}
				onfocusout={(event) => {
					const currentTarget = event.currentTarget as HTMLElement;
					const relatedTarget = event.relatedTarget as Node | null;

					if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
						resumeSuccessTimer();
					}
				}}
			>
				<Check class="h-5 w-5 shrink-0" strokeWidth={2} />

				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium">{successMessage}</p>
				</div>

				<button
					type="button"
					class="btn btn-circle btn-ghost text-success btn-sm hover:bg-success/10"
					onclick={dismissSuccess}
					aria-label="Dismiss success message"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/if}

		<div class="mb-6 sm:mb-7">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Your collection</h2>

			<p class="mt-1.5 text-sm leading-5 text-base-content/50">
				Upload and manage the images in your library.
			</p>
		</div>

		<section
			class="mb-8 overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm sm:mb-10"
		>
			<div
				class="flex items-start justify-between gap-3 border-b border-base-200 px-4 py-4 sm:px-5"
			>
				<div class="flex min-w-0 items-center gap-3">
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/60"
					>
						{#if editingId}
							<RefreshCw class="h-4 w-4" strokeWidth={1.8} />
						{:else}
							<Upload class="h-4 w-4" strokeWidth={1.8} />
						{/if}
					</div>

					<div class="min-w-0">
						<h3 class="text-sm font-semibold">
							{editingId ? 'Replace image' : 'Upload image'}
						</h3>

						<p class="mt-0.5 truncate text-xs text-base-content/45">
							{#if editingId}
								Choose a new file for image <strong>{editingId}</strong>
							{:else}
								Add an image to your collection
							{/if}
						</p>
					</div>
				</div>

				{#if editingId}
					<button
						type="button"
						class="btn btn-circle btn-square shrink-0 btn-ghost btn-sm"
						onclick={cancel}
						disabled={isUploading || isUpdating || isDeleting}
						aria-label="Cancel editing"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</div>

			<div class="p-4 sm:p-5">
				<form
					method="POST"
					action="?/save"
					enctype="multipart/form-data"
					id="image-form"
					use:enhance={() => {
						const wasEditing = !!editingId;

						if (wasEditing) {
							isUpdating = true;
						} else {
							isUploading = true;
						}

						return async ({ update }) => {
							await update();

							isUpdating = false;
							isUploading = false;

							if (!form?.error) {
								showSuccess(
									wasEditing ? 'Image updated successfully.' : 'Image uploaded successfully.'
								);

								editingId = '';
								resetFile();
								closeUpdateModal();
							}
						};
					}}
				>
					<input type="hidden" name="id" value={editingId} />

					<div class="flex flex-col gap-3">
						<div class="w-full">
							<label
								for="image-file"
								class="mb-1.5 block text-xs font-semibold tracking-wide text-base-content/50 uppercase"
							>
								Image file
								<span class="font-normal text-base-content/40 normal-case"> (max 1 MB) </span>
							</label>

							<div
								class="flex min-h-12 w-full items-center overflow-hidden rounded-xl border border-base-300 bg-base-100 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
							>
								<label
									for="image-file"
									class="flex h-12 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-medium hover:bg-base-200/50 sm:px-4"
								>
									<Upload class="h-4 w-4 shrink-0 text-base-content/50" strokeWidth={1.8} />

									<span class="hidden sm:inline">Choose file</span>
									<span class="sm:hidden">Choose</span>
								</label>

								<div class="h-6 w-px shrink-0 bg-base-300"></div>

								<p
									class="min-w-0 flex-1 truncate px-2.5 text-xs text-base-content/50 sm:px-3 sm:text-sm"
								>
									{#if selectedFile?.name}
										{#if selectedFile.name.length > 32}
											{selectedFile.name.slice(0, 12)}... {selectedFile.name.slice(-12)}
										{:else}
											{selectedFile.name}
										{/if}
									{:else}
										<span class="hidden sm:inline">No file selected</span>
										<span class="sm:hidden">No file</span>
									{/if}
								</p>

								<input
									id="image-file"
									class="sr-only"
									type="file"
									name="file"
									accept=".jpg,.jpeg,.png,.webp"
									required
									disabled={isUploading || isUpdating || isDeleting}
									onchange={handleFileChange}
								/>

								{#if selectedFile}
									<div
										class="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success sm:mr-3"
									>
										<Check class="h-3.5 w-3.5" strokeWidth={2.5} />
									</div>
								{/if}
							</div>
						</div>

						<div class="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
							{#if editingId}
								<button
									type="button"
									class="btn h-11 w-full rounded-xl btn-primary sm:w-auto sm:min-w-28"
									onclick={openUpdateModal}
									disabled={isUploading || isUpdating || isDeleting || !selectedFile || !!fileError}
								>
									{#if isUpdating}
										<span class="loading loading-sm loading-spinner"></span>
									{:else}
										<RefreshCw class="h-4 w-4" strokeWidth={1.8} />
									{/if}

									Update
								</button>

								<button
									type="button"
									class="btn h-11 w-full rounded-xl sm:w-auto sm:min-w-24"
									onclick={cancel}
									disabled={isUploading || isUpdating || isDeleting}
								>
									Cancel
								</button>
							{:else}
								<button
									type="submit"
									class="btn h-11 w-full rounded-xl btn-primary sm:w-auto sm:min-w-28"
									disabled={isUploading || isUpdating || isDeleting || !selectedFile || !!fileError}
								>
									{#if isUploading}
										<span class="loading loading-sm loading-spinner"></span>
									{:else}
										<Upload class="h-4 w-4" strokeWidth={1.8} />
									{/if}

									Upload
								</button>
							{/if}
						</div>
					</div>
				</form>

				{#if fileError || form?.error}
					<div
						class="mt-4 flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 px-3 py-3 text-error sm:px-4"
					>
						<TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />

						<span class="min-w-0 text-sm leading-5 wrap-break-word">
							{fileError || form?.error}
						</span>
					</div>
				{/if}
			</div>
		</section>

		<div class="mb-4 flex items-end justify-between gap-3">
			<div class="min-w-0">
				<h2 class="text-base font-semibold">Images</h2>
				<p class="mt-0.5 text-xs text-base-content/45">All uploaded images</p>
			</div>

			{#if data.images?.length > 0}
				<span class="shrink-0 text-xs text-base-content/40">
					{data.images.length} total
				</span>
			{/if}
		</div>

		{#if data.images?.length > 0}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
				{#each data.images as image (image.id)}
					<article
						class="group overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm transition hover:shadow-md"
					>
						<div class="relative aspect-square overflow-hidden bg-base-200">
							<img
								data-parallax
								data-lazyload-src={image.thumbnail}
								alt="Image {image.id}"
								class="lazyload h-full w-full object-cover"
							/>

							<div
								class="absolute inset-x-0 bottom-0 hidden items-end justify-end bg-linear-to-t from-black/60 to-transparent p-3 pt-10 opacity-0 transition group-hover:opacity-100 sm:flex"
							>
								<div class="flex gap-2">
									<button
										type="button"
										class="btn btn-circle btn-sm"
										onclick={() => openLightbox(image.file, image.id)}
										disabled={isUploading || isUpdating || isDeleting}
										aria-label="View image {image.id}"
									>
										<Eye class="h-3.5 w-3.5" strokeWidth={1.8} />
									</button>

									<button
										type="button"
										class="btn btn-circle btn-sm"
										onclick={() => edit(image.id)}
										disabled={isUploading || isUpdating || isDeleting}
										aria-label="Edit image {image.id}"
									>
										<Pencil class="h-3.5 w-3.5" strokeWidth={1.8} />
									</button>

									<button
										type="button"
										class="btn btn-circle btn-error btn-sm"
										onclick={() => openDeleteModal(image.id)}
										disabled={isUploading || isUpdating || isDeleting}
										aria-label="Delete image {image.id}"
									>
										<Trash2 class="h-3.5 w-3.5" strokeWidth={1.8} />
									</button>
								</div>
							</div>
						</div>

						<div class="flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:px-3.5">
							<div class="flex min-w-0 items-center gap-2">
								<div
									class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-content"
								>
									{(data.user?.email?.[0] ?? 'U').toUpperCase()}
								</div>

								<div class="min-w-0">
									<p class="truncate text-xs font-semibold">
										{image.uploader.split('@')[0] ?? 'User'}
									</p>

									<p class="truncate text-[10px] text-base-content/40 sm:text-[11px]">
										{new Date(image.createdAt).toLocaleString('en-US')}
									</p>
								</div>
							</div>

							<div class="flex shrink-0 gap-0.5 sm:hidden">
								<button
									type="button"
									class="btn btn-circle btn-square btn-ghost btn-sm"
									onclick={() => openLightbox(image.file, image.id)}
									disabled={isUploading || isUpdating || isDeleting}
									aria-label="View image {image.id}"
								>
									<Eye class="h-3.5 w-3.5" />
								</button>

								<button
									type="button"
									class="btn btn-circle btn-square btn-ghost btn-sm"
									onclick={() => edit(image.id)}
									disabled={isUploading || isUpdating || isDeleting}
									aria-label="Edit image {image.id}"
								>
									<Pencil class="h-3.5 w-3.5" />
								</button>

								<button
									type="button"
									class="btn btn-circle btn-square btn-ghost text-error btn-sm"
									onclick={() => openDeleteModal(image.id)}
									disabled={isUploading || isUpdating || isDeleting}
									aria-label="Delete image {image.id}"
								>
									<Trash2 class="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-2xl border border-dashed border-base-300 bg-base-100 px-5 py-16 text-center sm:px-6 sm:py-20"
			>
				<div
					class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-base-200 text-base-content/40"
				>
					<Image class="h-6 w-6" strokeWidth={1.5} />
				</div>

				<h3 class="mt-4 text-sm font-semibold">No images yet</h3>

				<p class="mx-auto mt-1 max-w-xs text-xs leading-5 text-base-content/45">
					Upload an image above to start building your collection.
				</p>
			</div>
		{/if}
	</main>
</div>

<dialog bind:this={updateModal} class="modal">
	<div class="modal-box mx-3 w-auto max-w-sm rounded-2xl sm:mx-auto">
		<div class="flex items-start gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
			>
				<RefreshCw class="h-5 w-5" strokeWidth={1.8} />
			</div>

			<div class="min-w-0">
				<h3 class="font-semibold">Update image?</h3>

				<p class="mt-1 text-sm leading-5 text-base-content/50">
					The current image will be replaced with the selected file.
				</p>
			</div>
		</div>

		<div class="modal-action flex-col gap-2 sm:flex-row">
			<button
				type="button"
				class="btn w-full sm:w-auto"
				onclick={closeUpdateModal}
				disabled={isUploading || isUpdating || isDeleting}
			>
				Cancel
			</button>

			<button
				type="submit"
				form="image-form"
				class="btn w-full btn-primary sm:w-auto"
				disabled={isUploading || isUpdating || isDeleting || !selectedFile}
			>
				{#if isUpdating}
					<span class="loading loading-sm loading-spinner"></span>
				{/if} Update
			</button>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button disabled={isUploading || isUpdating || isDeleting}>close</button>
	</form>
</dialog>

<dialog bind:this={deleteModal} class="modal">
	<div class="modal-box mx-3 w-auto max-w-sm rounded-2xl sm:mx-auto">
		<div class="flex items-start gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error"
			>
				<TriangleAlert class="h-5 w-5" strokeWidth={1.8} />
			</div>

			<div class="min-w-0">
				<h3 class="font-semibold">Delete image?</h3>

				<p class="mt-1 text-sm leading-5 text-base-content/50">
					Image <b>{deleteId}</b> will be permanently deleted. This cannot be undone.
				</p>
			</div>
		</div>

		<div class="modal-action flex-col gap-2 sm:flex-row">
			<button
				type="button"
				class="btn w-full sm:w-auto"
				onclick={closeDeleteModal}
				disabled={isUploading || isUpdating || isDeleting}
			>
				Cancel
			</button>

			<form
				method="POST"
				action="?/delete"
				class="w-full sm:w-auto"
				use:enhance={() => {
					isDeleting = true;

					return async ({ update }) => {
						await update();

						isDeleting = false;

						if (!form?.error) {
							showSuccess('Image deleted successfully.');
							closeDeleteModal();
							deleteId = '';
						}
					};
				}}
			>
				<input type="hidden" name="id" value={deleteId} />

				<button
					type="submit"
					class="btn w-full btn-error sm:w-auto"
					disabled={isUploading || isUpdating || isDeleting || !deleteId}
				>
					{#if isDeleting}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						<Trash2 class="h-4 w-4" strokeWidth={1.8} />
					{/if} Delete
				</button>
			</form>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button disabled={isUploading || isUpdating || isDeleting}>close</button>
	</form>
</dialog>
