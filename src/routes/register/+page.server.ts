import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession, createUser } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail) {
			return fail(400, {
				error: 'Email is required.',
				email
			});
		}

		if (!normalizedEmail.includes('@')) {
			return fail(400, {
				error: 'Please enter a valid email.',
				email
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters.',
				email
			});
		}

		try {
			const user = await createUser(normalizedEmail, password);
			const sessionToken = await createSession(user.id);

			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : '';

			if (message.includes('duplicate key')) {
				return fail(400, {
					error: 'An account with this email already exists.',
					email
				});
			}

			console.error(error);

			return fail(500, {
				error: 'Something went wrong. Please try again.',
				email
			});
		}

		redirect(303, '/');
	}
};
