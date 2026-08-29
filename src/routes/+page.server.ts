import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { sql } from '$lib/db';

export const load: PageServerLoad = async () => {
	const images = await sql`
		SELECT
			id,
			file,
			thumbnail,
			"createdAt"
		FROM image
		ORDER BY "createdAt" DESC
	`;

	return {
		images
	};
};

async function storeImage(file: File, id: string) {
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

	const [mainBlob, thumbnailBlob] = await Promise.all([
		put(`images/${id}/${id}.jpg`, mainBuffer, {
			access: 'public',
			contentType: 'image/jpeg',
			allowOverwrite: true
		}),

		put(`images/${id}/${id}_thumb.webp`, thumbnailBuffer, {
			access: 'public',
			contentType: 'image/webp',
			allowOverwrite: true
		})
	]);

	return {
		file: mainBlob.url,
		thumbnail: thumbnailBlob.url
	};
}

async function deleteImageFiles(image: { file: string; thumbnail: string }) {
	const urls = [image.file, image.thumbnail].filter(Boolean);

	if (urls.length > 0) {
		await del(urls);
	}
}

export const actions: Actions = {
	save: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('id')?.toString();
		const file = data.get('file');

		if (!(file instanceof File) || !file.size) {
			return fail(400, {
				error: 'Please select an image'
			});
		}

		if (!file.type.startsWith('image/')) {
			return fail(400, {
				error: 'File must be an image'
			});
		}

		try {
			if (id) {
				const existing = await sql`
					SELECT
						id,
						file,
						thumbnail,
						"createdAt"
					FROM image
					WHERE id = ${id}
					LIMIT 1
				`;

				if (existing.length === 0) {
					return fail(404, {
						error: 'Image not found'
					});
				}

				const stored = await storeImage(file, id);

				await sql`
					UPDATE image
					SET
						file = ${stored.file},
						thumbnail = ${stored.thumbnail}
					WHERE id = ${id}
				`;

				return {
					success: true,
					action: 'updated'
				};
			}

			const newId = crypto.randomUUID();

			await sql`
				INSERT INTO image (
					id,
					file,
					thumbnail
				)
				VALUES (
					${newId},
					'',
					''
				)
			`;

			try {
				const stored = await storeImage(file, newId);

				await sql`
					UPDATE image
					SET
						file = ${stored.file},
						thumbnail = ${stored.thumbnail}
					WHERE id = ${newId}
				`;

				return {
					success: true,
					action: 'created'
				};
			} catch (error) {
				await sql`
					DELETE FROM image
					WHERE id = ${newId}
				`;

				throw error;
			}
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
