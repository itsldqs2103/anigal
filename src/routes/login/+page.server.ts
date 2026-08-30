import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession, verifyUser } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required.',
				email
			});
		}

		const user = await verifyUser(email, password);

		if (!user) {
			return fail(400, {
				error: 'Invalid email or password.',
				email
			});
		}

		const sessionToken = await createSession(user.id);

		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		redirect(303, '/');
	}
};
