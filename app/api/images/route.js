import { del } from '@vercel/blob';

import database from '@/lib/database';
import { download } from '@/lib/download';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 24);
  const offset = (page - 1) * limit;

  const [images, [{ count }]] = await Promise.all([
    database`
      SELECT *
      FROM images
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    database`SELECT COUNT(*)::int AS count FROM images`,
  ]);

  return new Response(
    JSON.stringify({
      data: images,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(req) {
  const { url } = await req.json();

  const image = await download(url);

  const [saved] = await database`
      INSERT INTO images (id, path, preview_url, url, width, height)
      VALUES (
        ${image.id},
        ${image.path},
        ${image.preview_url},
        ${url},
        ${image.width},
        ${image.height}
      )
      RETURNING *
    `;

  return new Response(JSON.stringify(saved), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(req) {
  const { id, url } = await req.json();

  const [oldImage] = await database`
    SELECT path, preview_url FROM images WHERE id = ${id}
  `;

  await Promise.all([
    del(oldImage.path),
    del(oldImage.preview_url),
  ]);

  const newImage = await download(url);

  const [updated] = await database`
    UPDATE images
    SET
      id = ${newImage.id},
      path = ${newImage.path},
      preview_url = ${newImage.preview_url},
      url = ${url},
      width = ${newImage.width},
      height = ${newImage.height},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(req) {
  const { id } = await req.json();

  const [image] = await database`
    SELECT path, preview_url FROM images WHERE id = ${id}
  `;

  await Promise.all([
    del(image.path),
    del(image.preview_url),
  ]);

  await database`DELETE FROM images WHERE id = ${id}`;

  return new Response(JSON.stringify({ id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
