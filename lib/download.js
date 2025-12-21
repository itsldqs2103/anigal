import { put } from '@vercel/blob';
import crypto from 'crypto';
import sharp from 'sharp';

export async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download image');

  const buffer = Buffer.from(await res.arrayBuffer());

  const filename = `images/image_${crypto.randomUUID()}.webp`;

  const image = sharp(buffer).webp({
    quality: 70,
    effort: 6,
  });

  const metadata = await image.metadata();
  const optimizedBuffer = await image.toBuffer();

  const blob = await put(filename, optimizedBuffer, {
    access: 'public',
    contentType: 'image/webp',
  });

  return {
    path: blob.url,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
