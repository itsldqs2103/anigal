import { del } from '@vercel/blob';

import database from '@/lib/database';
import { download } from '@/lib/download';

export const runtime = 'nodejs';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function GET(req) {
  const { page, limit, offset } = getPagination(req);

  const [images, total] = await Promise.all([
    fetchImages(limit, offset),
    fetchImageCount(),
  ]);

  return jsonResponse({
    data: images,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req) {
  const { url } = await req.json();

  const image = await download(url);
  const saved = await insertImage(image, url);

  return jsonResponse(saved);
}

export async function PUT(req) {
  const { id, url } = await req.json();

  const oldImage = await getImageFiles(id);
  await deleteImageFiles(oldImage);

  const newImage = await download(url);
  const updated = await updateImage(id, newImage, url);

  return jsonResponse(updated);
}

export async function DELETE(req) {
  const { id } = await req.json();

  const image = await getImageFiles(id);
  await deleteImageFiles(image);
  await deleteImage(id);

  return jsonResponse({ id });
}

function getPagination(req) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

async function fetchImages(limit, offset) {
  return database`
    SELECT *
    FROM images
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

async function fetchImageCount() {
  const [{ count }] = await database`
    SELECT COUNT(*)::int AS count FROM images
  `;
  return count;
}

async function insertImage(image, url) {
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
  return saved;
}

async function updateImage(id, image, url) {
  const [updated] = await database`
    UPDATE images
    SET
      id = ${image.id},
      path = ${image.path},
      preview_url = ${image.preview_url},
      url = ${url},
      width = ${image.width},
      height = ${image.height},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return updated;
}

async function deleteImage(id) {
  await database`DELETE FROM images WHERE id = ${id}`;
}

async function getImageFiles(id) {
  const [image] = await database`
    SELECT path, preview_url
    FROM images
    WHERE id = ${id}
  `;
  return image;
}

async function deleteImageFiles(image) {
  if (!image) return;

  await Promise.all([del(image.path), del(image.preview_url)]);
}
