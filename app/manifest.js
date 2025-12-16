export default function manifest() {
    return {
        name: 'AniGal',
        short_name: 'AniGal',
        description: 'AniGal - a gallery of stunning anime-style illustrations and artwork.',
        start_url: '/',
        display: 'standalone',
        background_color: '#272938',
        theme_color: '#ffb66d',
        icons: [
            {
                src: '/icon256.jpg',
                sizes: '256x256',
                type: 'image/jpeg',
            }
        ],
    }
}