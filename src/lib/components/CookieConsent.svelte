<script lang="ts">
	import { Cookie } from '@lucide/svelte';

	let dialog: HTMLDialogElement;

	function showModal() {
		dialog.showModal();
	}

	function accept() {
		document.cookie = 'cookie-consent=accepted; path=/; max-age=31536000; SameSite=Lax';

		dialog.close();
	}

	if (typeof document !== 'undefined') {
		const accepted = document.cookie.includes('cookie-consent=accepted');

		if (!accepted) {
			setTimeout(() => showModal(), 0);
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<div class="flex items-start gap-3">
			<Cookie class="mt-1 size-6 shrink-0 text-primary" />

			<div>
				<h3 class="text-lg font-bold">We use cookies</h3>

				<p class="mt-2 text-sm text-base-content/70">
					We use cookies to keep our site running smoothly and improve your experience.
				</p>
			</div>
		</div>

		<div class="modal-action">
			<button class="btn btn-primary" onclick={accept}> Accept </button>
		</div>
	</div>
</dialog>
