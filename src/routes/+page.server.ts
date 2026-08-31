import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { sql } from '$lib/server/db';

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
			uploader,
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

async function consumeUploadQuota(userId: string): Promise<boolean> {
	const result = await sql`
		INSERT INTO image_usage (
			"userId",
			"date",
			"uploads",
			"updates"
		)
		VALUES (
			${userId},
			(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
			1,
			0
		)
		ON CONFLICT ("userId", "date")
		DO UPDATE SET
			"uploads" = image_usage."uploads" + 1
		WHERE image_usage."uploads" < 10
		RETURNING "uploads"
	`;

	return result.length > 0;
}

async function consumeUpdateQuota(userId: string): Promise<boolean> {
	const result = await sql`
		INSERT INTO image_usage (
			"userId",
			"date",
			"uploads",
			"updates"
		)
		VALUES (
			${userId},
			(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
			0,
			1
		)
		ON CONFLICT ("userId", "date")
		DO UPDATE SET
			"updates" = image_usage."updates" + 1
		WHERE image_usage."updates" < 10
		RETURNING "updates"
	`;

	return result.length > 0;
}

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
	save: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

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

		if (file.size > 1 * 1024 * 1024) {
			return fail(400, {
				error: 'Image must be smaller than 1 MB'
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
						AND uploader = ${locals.user.email}
					LIMIT 1
				`;

				if (existingResult.length === 0) {
					error(404, {
						message: 'Not found'
					});
				}

				const allowed = await consumeUpdateQuota(locals.user.id);

				if (!allowed) {
					return fail(429, {
						error: 'Daily update limit reached. You can update up to 10 images per day.'
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
							AND uploader = ${locals.user.email}
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

			const allowed = await consumeUploadQuota(locals.user.id);

			if (!allowed) {
				return fail(429, {
					error: 'Daily upload limit reached. You can upload up to 10 images per day.'
				});
			}

			const newId = crypto.randomUUID();
			const stored = await storeImage(file, newId);

			try {
				await sql`
					INSERT INTO image (
						id,
						file,
						thumbnail,
						uploader
					)
					VALUES (
						${newId},
						${stored.file},
						${stored.thumbnail},
						${locals.user.email}
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

	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

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
				AND uploader = ${locals.user.email}
			LIMIT 1
		`;

		if (result.length === 0) {
			error(404, {
				message: 'Not found'
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
					AND uploader = ${locals.user.email}
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