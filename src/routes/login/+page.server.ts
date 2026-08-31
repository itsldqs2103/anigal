import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession, verifyUser } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail || !password) {
			return fail(400, {
				error: 'Email and password are required.',
				email
			});
		}

		if (!normalizedEmail.includes('@')) {
			return fail(400, {
				error: 'Please enter a valid email.',
				email
			});
		}

		const user = await verifyUser(normalizedEmail, password);

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