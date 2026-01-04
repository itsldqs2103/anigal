import { put } from '@vercel/blob';
import crypto from 'crypto';
import sharp from 'sharp';

export async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download image');

  const buffer = Buffer.from(await res.arrayBuffer());

  const id = crypto.randomUUID();

  const basePath = `images/${id}`;

  const imageFilename = `${basePath}/image_${id}.webp`;
  const previewFilename = `${basePath}/preview_${id}.webp`;

  const image = sharp(buffer).webp({
    quality: 70,
    effort: 6,
  });

  const metadata = await image.metadata();
  const optimizedBuffer = await image.toBuffer();

  const previewBuffer = await sharp(buffer)
    .webp({
      quality: 1,
      effort: 1,
    })
    .toBuffer();

  const [imageBlob, previewBlob] = await Promise.all([
    put(imageFilename, optimizedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    }),
    put(previewFilename, previewBuffer, {
      access: 'public',
      contentType: 'image/webp',
    }),
  ]);

  return {
    id,
    path: imageBlob.url,
    preview_url: previewBlob.url,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
