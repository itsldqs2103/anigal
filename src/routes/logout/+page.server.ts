import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('session');

		if (sessionToken) {
			await deleteSession(sessionToken);
		}

		cookies.delete('session', {
			path: '/'
		});

		redirect(303, '/login');
	}
};