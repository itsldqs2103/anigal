import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { sql } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

type StoredImage = {
	file: string;
	thumbnail: string;
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}

	const images = await sql`
		SELECT
			id,
			file,
			thumbnail,
			"createdAt",
			"updatedAt"
		FROM image
		ORDER BY "createdAt" DESC
	`;

	return {
		images,
		user: locals.user
	};
};

async function storeImage(file: File, id: string): Promise<StoredImage> {
	const buffer = Buffer.from(await file.arrayBuffer());
	const image = sharp(buffer).rotate();
	const metadata = await image.metadata();

	if (!metadata.format) {
		throw new Error('Invalid image');
	}

	const mainBuffer = await image
		.clone()
		.jpeg({
			quality: 90,
			mozjpeg: true
		})
		.toBuffer();

	const thumbnailBuffer = await image
		.clone()
		.resize(256, 256, {
			fit: 'cover',
			position: 'centre',
			withoutEnlargement: true
		})
		.webp({
			quality: 75
		})
		.toBuffer();

	const unit = Date.now();

	const [mainBlob, thumbnailBlob] = await Promise.all([
		put(`images/${id}/${unit}.jpg`, mainBuffer, {
			access: 'public',
			contentType: 'image/jpeg'
		}),
		put(`images/${id}/${unit}_thumb.webp`, thumbnailBuffer, {
			access: 'public',
			contentType: 'image/webp'
		})
	]);

	return {
		file: mainBlob.url,
		thumbnail: thumbnailBlob.url
	};
}

async function deleteImageFiles(image: StoredImage) {
	const urls = [image.file, image.thumbnail].filter(Boolean);

	if (urls.length > 0) {
		await del(urls);
	}
}

export const actions: Actions = {
	save: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('id')?.toString() || null;
		const file = data.get('file');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, {
				error: 'Please select an image'
			});
		}

		if (!file.type.startsWith('image/')) {
			return fail(400, {
				error: 'File must be an image'
			});
		}

		if (file.size > 10 * 1024 * 1024) {
			return fail(400, {
				error: 'Image must be smaller than 10 MB'
			});
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const metadata = await sharp(buffer).metadata();

			if (!metadata.format) {
				return fail(400, {
					error: 'Invalid image file'
				});
			}

			if (id) {
				const existingResult = await sql`
					SELECT
						id,
						file,
						thumbnail
					FROM image
					WHERE id = ${id}
					LIMIT 1
				`;

				if (existingResult.length === 0) {
					return fail(404, {
						error: 'Image not found'
					});
				}

				const existing = existingResult[0];

				const stored = await storeImage(file, id);

				try {
					await sql`
						UPDATE image
						SET
							file = ${stored.file},
							thumbnail = ${stored.thumbnail},
							"updatedAt" = CURRENT_TIMESTAMP
						WHERE id = ${id}
					`;
				} catch (error) {
					await deleteImageFiles(stored).catch((cleanupError) => {
						console.error('Failed to cleanup new blobs:', cleanupError);
					});

					throw error;
				}

				await deleteImageFiles({
					file: existing.file,
					thumbnail: existing.thumbnail
				}).catch((error) => {
					console.error('Failed to delete old blobs:', error);
				});

				return {
					success: true,
					action: 'updated'
				};
			}

			const newId = crypto.randomUUID();
			const stored = await storeImage(file, newId);

			try {
				await sql`
					INSERT INTO image (
						id,
						file,
						thumbnail
					)
					VALUES (
						${newId},
						${stored.file},
						${stored.thumbnail}
					)
				`;
			} catch (error) {
				await deleteImageFiles(stored).catch((cleanupError) => {
					console.error('Failed to cleanup uploaded blobs:', cleanupError);
				});

				throw error;
			}

			return {
				success: true,
				action: 'created'
			};
		} catch (error) {
			console.error('Failed to save image:', error);

			return fail(500, {
				error: 'Failed to save image'
			});
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, {
				error: 'Image ID is required'
			});
		}

		const result = await sql`
			SELECT
				id,
				file,
				thumbnail
			FROM image
			WHERE id = ${id}
			LIMIT 1
		`;

		if (result.length === 0) {
			return fail(404, {
				error: 'Image not found'
			});
		}

		const image = result[0];

		try {
			await deleteImageFiles({
				file: image.file,
				thumbnail: image.thumbnail
			});

			await sql`
				DELETE FROM image
				WHERE id = ${id}
			`;

			return {
				success: true
			};
		} catch (error) {
			console.error('Failed to delete image:', error);

			return fail(500, {
				error: 'Failed to delete image'
			});
		}
	}
};
