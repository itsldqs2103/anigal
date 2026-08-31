import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	define: { __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('en-US')) },
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		SvelteKitPWA({
			registerType: 'autoUpdate',

			manifest: {
				scope: '/',
				id: '/',
				start_url: '/',
				name: 'AniGal',
				short_name: 'AniGal',
				description: 'AniGal built with SvelteKit',
				theme_color: '#ffffff',
				background_color: '#000000',
				display: 'standalone',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},

			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
			}
		})
	]
});
