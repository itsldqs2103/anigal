import { put } from '@vercel/blob';
import crypto from 'crypto';
import sharp from 'sharp';

export async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download image');

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const ext = contentType.split('/')[1] || 'jpeg';

  const filename = `images/image_${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await res.arrayBuffer());

  let image = sharp(buffer);

  if (ext === 'jpeg' || ext === 'jpg') {
    image = image.jpeg({ quality: 70 });
  } else if (ext === 'png') {
    image = image.png({ quality: 70, compressionLevel: 9 });
  } else if (ext === 'webp') {
    image = image.webp({ quality: 70 });
  }

  const metadata = await image.metadata();
  const optimizedBuffer = await image.toBuffer();

  const blob = await put(filename, optimizedBuffer, {
    access: 'public',
    contentType,
  });

  return {
    path: blob.url,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
