import { del } from '@vercel/blob';

import database from '@/lib/database';
import { download } from '@/lib/download';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 24);
  const offset = (page - 1) * limit;

  const [images, [{ count }]] = await Promise.all([
    database`
      SELECT id, path, url, width, height, created_at, updated_at
      FROM images
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
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
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing URL' }), { status: 400 });
    }

    const { id, path, width, height } = await download(url);

    const [row] = await database`
      INSERT INTO images (id, path, url, width, height)
      VALUES (${id}, ${path}, ${url}, ${width}, ${height})
      RETURNING id, path, url, width, height, created_at, updated_at
    `;

    return new Response(JSON.stringify(row), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to process image' }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  const { id: oldId, url } = await req.json();
  if (!oldId || !url) {
    return new Response(JSON.stringify({ error: 'Missing id or url' }), {
      status: 400,
    });
  }

  const [old] = await database`
    SELECT id, path FROM images WHERE id = ${oldId}
  `;
  if (!old) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
    });
  }

  await del(old.path);

  const { id: newId, path, width, height } = await download(url);

  const [updated] = await database`
    UPDATE images
    SET
      id = ${newId},
      path = ${path},
      url = ${url},
      width = ${width},
      height = ${height},
      updated_at = now()
    WHERE id = ${oldId}
    RETURNING id, path, url, width, height, created_at, updated_at
  `;

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
    });
  }

  const [row] = await database`
    SELECT path FROM images WHERE id = ${id}
  `;
  if (!row) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
    });
  }

  await del(row.path);

  await database`DELETE FROM images WHERE id = ${id}`;

  return new Response(JSON.stringify({ id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
