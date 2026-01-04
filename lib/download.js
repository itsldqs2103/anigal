import { put } from '@vercel/blob';
import crypto from 'crypto';
import sharp from 'sharp';

export async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download image');
  }

  const originalBuffer = Buffer.from(await response.arrayBuffer());

  const id = crypto.randomUUID();

  const folderPath = `images/${id}`;

  const fullImageName = `${folderPath}/image.webp`;
  const previewImageName = `${folderPath}/preview.webp`;

  const imageProcessor = sharp(originalBuffer).webp({
    quality: 70,
    effort: 6,
  });

  const metadata = await imageProcessor.metadata();

  const optimizedImageBuffer = await imageProcessor.toBuffer();

  const previewBuffer = await sharp(originalBuffer)
    .webp({
      quality: 1,
      effort: 1,
    })
    .toBuffer();

  const [fullImage, previewImage] = await Promise.all([
    put(fullImageName, optimizedImageBuffer, {
      access: 'public',
      contentType: 'image/webp',
    }),
    put(previewImageName, previewBuffer, {
      access: 'public',
      contentType: 'image/webp',
    }),
  ]);

  return {
    id,
    path: fullImage.url,
    preview_url: previewImage.url,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
