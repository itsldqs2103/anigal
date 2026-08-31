import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
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
			adapter: adapter(),
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
				theme_color: '#ecf9ff',
				background_color: '#1d232a',
				display: 'standalone',
				icons: [
					{
						src: '/icons/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icons/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/icons/maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				],
				"screenshots": [
					{
						"src": "/screenshots/desktop.png",
						"sizes": "1911x1007",
						"type": "image/png",
						"form_factor": "wide"
					},
					{
						"src": "/screenshots/mobile.png",
						"sizes": "800x2000",
						"type": "image/png"
					}
				]
			},

			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
			}
		})
	]
});
