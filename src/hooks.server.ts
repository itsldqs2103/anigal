import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	event.locals.user = null;

	if (sessionToken) {
		event.locals.user = await getUserFromSession(sessionToken);
	}

	return resolve(event);
});
export const handleError = Sentry.handleErrorWithSentry();
