import type { Handle } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	event.locals.user = null;

	if (sessionToken) {
		event.locals.user = await getUserFromSession(sessionToken);
	}

	return resolve(event);
};
