/// <reference types="vite-plugin-pwa/svelte" />
/// <reference types="vite-plugin-pwa/info" />
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
			} | null;
		}
	}
}

export {};
