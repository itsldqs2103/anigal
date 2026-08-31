import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://f40d6105f75c556911c64d45047af4ba@o4512003038380032.ingest.de.sentry.io/4512003043229776',

	tracesSampleRate: 1.0
	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
