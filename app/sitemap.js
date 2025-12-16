export default function sitemap() {
    return [
        {
            url: 'https://anigal.vercel.app',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://anigal.vercel.app/manage',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        }
    ]
}