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
		Check
	} from 'lucide-svelte';

	let { data, form } = $props();
	let editingId = $state('');
	let deleteId = $state('');
	let isSubmitting = $state(false);
	let selectedFile = $state<File | null>(null);
	let updateModal: HTMLDialogElement;
	let deleteModal: HTMLDialogElement;
	let fileError = $state('');
	const MAX_FILE_SIZE = 1 * 1024 * 1024;

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
			fileError = 'Only JPG, JPEG, PNG, and WebP images are allowed.';
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
		if (input) input.value = '';
	}

	function edit(id: string) {
		if (isSubmitting) return;
		editingId = id;
		resetFile();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancel() {
		if (isSubmitting) return;
		editingId = '';
		resetFile();
	}

	function openUpdateModal() {
		if (isSubmitting || !selectedFile) return;
		updateModal?.showModal();
	}

	function closeUpdateModal() {
		if (isSubmitting) return;
		updateModal?.close();
	}

	function openDeleteModal(id: string) {
		if (isSubmitting) return;
		editingId = '';
		resetFile();
		deleteId = id;
		deleteModal?.showModal();
	}

	function closeDeleteModal() {
		if (isSubmitting) return;
		deleteModal?.close();
	}
</script>

<svelte:head>
	<title>Media Library</title>
	<meta name="description" content="Media Library built with SvelteKit" />
</svelte:head>

<div class="min-h-screen bg-base-200/30">
	<header class="border-b border-base-300/60 bg-base-100">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content"
				>
					<Images class="h-5 w-5" strokeWidth={1.8} />
				</div>
				<div>
					<h1 class="text-lg font-semibold tracking-tight">Media Library</h1>
					<p class="text-xs text-base-content/50">Manage your images</p>
				</div>
			</div>
			<div
				class="flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100 px-3 py-1.5"
			>
				<div class="h-1.5 w-1.5 rounded-full bg-success"></div>
				<span class="text-xs font-medium text-base-content/60"
					>{data.images?.length ?? 0} images</span
				>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-6xl px-5 py-8">
		<div class="mb-7">
			<h2 class="text-2xl font-semibold tracking-tight">Your collection</h2>
			<p class="mt-1.5 text-sm text-base-content/50">
				Upload and manage the images in your library.
			</p>
		</div>
		<section
			class="mb-10 overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm"
		>
			<div class="flex items-center justify-between border-b border-base-200 px-5 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/60"
					>
						{#if editingId}
							<RefreshCw class="h-4 w-4" strokeWidth={1.8} />
						{:else}
							<Upload class="h-4 w-4" strokeWidth={1.8} />
						{/if}
					</div>
					<div>
						<h3 class="text-sm font-semibold">{editingId ? 'Replace image' : 'Upload image'}</h3>
						<p class="text-xs text-base-content/45">
							{editingId
								? `Choose a new file for image ${editingId}`
								: 'Add an image to your collection'}
						</p>
					</div>
				</div>
				{#if editingId}
					<button
						type="button"
						class="btn btn-circle btn-square btn-ghost btn-xs"
						onclick={cancel}
						disabled={isSubmitting}
						aria-label="Cancel editing"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</div>
			<div class="p-5">
				<form
					method="POST"
					action="?/save"
					enctype="multipart/form-data"
					id="image-form"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
							if (!form?.error) {
								editingId = '';
								resetFile();
								closeUpdateModal();
							}
						};
					}}
				>
					<input type="hidden" name="id" value={editingId} />
					<div class="flex flex-col gap-3 sm:flex-row sm:items-end">
						<div class="flex-1">
							<label
								for="image-file"
								class="mb-1.5 block text-xs font-semibold tracking-wide text-base-content/50 uppercase"
							>
								Image file <span class="font-normal text-base-content/40 normal-case">
									(max 1 MB)
								</span>
							</label>
							<div
								class="flex h-12 items-center rounded-xl border border-base-300 bg-base-100 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
							>
								<label
									for="image-file"
									class="flex h-full cursor-pointer items-center gap-2 rounded-l-xl px-4 text-sm font-medium hover:bg-base-200/50"
								>
									<Upload class="h-4 w-4 text-base-content/50" strokeWidth={1.8} />Choose file</label
								>
								<div class="h-6 w-px bg-base-300"></div>
								<p class="min-w-0 flex-1 truncate px-3 text-sm text-base-content/50">
									{#if selectedFile?.name}
										{#if selectedFile.name.length > 32}
											{selectedFile.name.slice(0, 14)}...{selectedFile.name.slice(-15)}
										{:else}
											{selectedFile.name}
										{/if}
									{:else}
										No file selected
									{/if}
								</p>
								<input
									id="image-file"
									class="sr-only"
									type="file"
									name="file"
									accept=".jpg,.jpeg,.png,.webp"
									required
									disabled={isSubmitting}
									onchange={handleFileChange}
								/>
								{#if selectedFile}
									<div
										class="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success"
									>
										<Check class="h-3.5 w-3.5" strokeWidth={2.5} />
									</div>
								{/if}
								{#if fileError}
									<div
										class="mt-3 flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-error"
									>
										<TriangleAlert class="h-4 w-4 shrink-0" strokeWidth={2} />
										<span class="text-sm">{fileError}</span>
									</div>
								{/if}
							</div>
						</div>
						<div class="flex gap-2">
							{#if editingId}
								<button
									type="button"
									class="btn h-12 rounded-xl btn-primary"
									onclick={openUpdateModal}
									disabled={isSubmitting || !selectedFile || !!fileError}
								>
									{#if isSubmitting}
										<span class="loading loading-sm loading-spinner"></span>
									{:else}
										<RefreshCw class="h-4 w-4" strokeWidth={1.8} />
									{/if} Update
								</button>
								<button
									type="button"
									class="btn h-12 rounded-xl"
									onclick={cancel}
									disabled={isSubmitting}>Cancel</button
								>
							{:else}
								<button
									type="submit"
									class="btn h-12 rounded-xl btn-primary"
									disabled={isSubmitting || !selectedFile || !!fileError}
								>
									{#if isSubmitting}
										<span class="loading loading-sm loading-spinner"></span>
									{:else}
										<Upload class="h-4 w-4" strokeWidth={1.8} />
									{/if} Upload
								</button>
							{/if}
						</div>
					</div>
				</form>
				{#if form?.error}
					<div
						class="mt-4 flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-error"
					>
						<TriangleAlert class="h-4 w-4 shrink-0" strokeWidth={2} />
						<span class="text-sm">{form.error}</span>
					</div>
				{/if}
			</div>
		</section>
		<div class="mb-4 flex items-end justify-between">
			<div>
				<h2 class="text-base font-semibold">Images</h2>
				<p class="mt-0.5 text-xs text-base-content/45">All uploaded images</p>
			</div>
			{#if data.images?.length > 0}
				<span class="text-xs text-base-content/40">{data.images.length} total</span>
			{/if}
		</div>
		{#if data.images?.length > 0}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{#each data.images as image (image.id)}
					<article
						class="group overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm transition hover:shadow-md"
					>
						<div class="relative aspect-square overflow-hidden bg-base-200">
							<img
								src={image.thumbnail}
								alt="Image {image.id}"
								loading="lazy"
								class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
							/>
							<div
								class="absolute inset-x-0 bottom-0 hidden items-end justify-end bg-linear-to-t from-black/60 to-transparent p-3 pt-10 opacity-0 transition group-hover:opacity-100 sm:flex"
							>
								<div class="flex gap-2">
									<button
										type="button"
										class="btn btn-circle btn-sm"
										onclick={() => edit(image.id)}
										disabled={isSubmitting}
										aria-label="Edit image {image.id}"
									>
										<Pencil class="h-3.5 w-3.5" strokeWidth={1.8} />
									</button>
									<button
										type="button"
										class="btn btn-circle btn-error btn-sm"
										onclick={() => openDeleteModal(image.id)}
										disabled={isSubmitting}
										aria-label="Delete image {image.id}"
									>
										<Trash2 class="h-3.5 w-3.5" strokeWidth={1.8} />
									</button>
								</div>
							</div>
						</div>
						<div class="flex items-center justify-between px-3.5 py-3">
							<div class="flex items-center gap-2">
								<div
									class="flex h-7 w-7 items-center justify-center rounded-lg bg-base-200 text-base-content/50"
								>
									<Image class="h-3.5 w-3.5" strokeWidth={1.8} />
								</div>
								<div>
									<p class="text-xs font-semibold">{image.id}</p>
									<p class="text-[11px] text-base-content/40">
										{new Date(image.createdAt).toLocaleString()}
									</p>
								</div>
							</div>
							<div class="flex gap-0.5 sm:hidden">
								<button
									type="button"
									class="btn btn-circle btn-square btn-ghost btn-xs"
									onclick={() => edit(image.id)}
									disabled={isSubmitting}
									aria-label="Edit image {image.id}"
								>
									<Pencil class="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									class="btn btn-circle btn-square btn-ghost text-error btn-xs"
									onclick={() => openDeleteModal(image.id)}
									disabled={isSubmitting}
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
				class="rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-20 text-center"
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
	<div class="modal-box max-w-sm rounded-2xl">
		<div class="flex items-start gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
			>
				<RefreshCw class="h-5 w-5" strokeWidth={1.8} />
			</div>
			<div>
				<h3 class="font-semibold">Update image?</h3>
				<p class="mt-1 text-sm leading-5 text-base-content/50">
					The current image will be replaced with the selected file.
				</p>
			</div>
		</div>
		<div class="modal-action">
			<button type="button" class="btn" onclick={closeUpdateModal} disabled={isSubmitting}
				>Cancel</button
			>
			<button
				type="submit"
				form="image-form"
				class="btn btn-primary"
				disabled={isSubmitting || !selectedFile}
			>
				{#if isSubmitting}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					Update
				{/if}
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop"><button disabled={isSubmitting}>close</button></form>
</dialog>
<dialog bind:this={deleteModal} class="modal">
	<div class="modal-box max-w-sm rounded-2xl">
		<div class="flex items-start gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error"
			>
				<TriangleAlert class="h-5 w-5" strokeWidth={1.8} />
			</div>
			<div>
				<h3 class="font-semibold">Delete image?</h3>
				<p class="mt-1 text-sm leading-5 text-base-content/50">
					Image {deleteId} will be permanently deleted. This cannot be undone.
				</p>
			</div>
		</div>
		<div class="modal-action">
			<button type="button" class="btn" onclick={closeDeleteModal} disabled={isSubmitting}
				>Cancel</button
			>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
						if (!form?.error) {
							closeDeleteModal();
							deleteId = '';
						}
					};
				}}
			>
				<input type="hidden" name="id" value={deleteId} />
				<button type="submit" class="btn btn-error" disabled={isSubmitting || !deleteId}>
					{#if isSubmitting}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						<Trash2 class="h-4 w-4" strokeWidth={1.8} /> Delete
					{/if}
				</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop"><button disabled={isSubmitting}>close</button></form>
</dialog>
