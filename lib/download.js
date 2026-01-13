import { put } from '@vercel/blob';
import crypto from 'crypto';
import sharp from 'sharp';

const FULL_IMAGE_OPTIONS = {
  quality: 70,
  effort: 6,
};

const PREVIEW_IMAGE_OPTIONS = {
  quality: 1,
  effort: 1,
};

const WEBP_CONTENT_TYPE = 'image/webp';

export async function download(url) {
  const originalBuffer = await fetchImageBuffer(url);

  const id = crypto.randomUUID();
  const paths = buildImagePaths(id);

  const { optimizedBuffer, previewBuffer, metadata } =
    await processImages(originalBuffer);

  const [fullImage, previewImage] = await uploadImages(
    paths,
    optimizedBuffer,
    previewBuffer
  );

  return {
    id,
    path: fullImage.url,
    preview_url: previewImage.url,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

async function fetchImageBuffer(url) {
  const response = await fetch(url);
  return Buffer.from(await response.arrayBuffer());
}

function buildImagePaths(id) {
  const basePath = `images/${id}`;

  return {
    full: `${basePath}/image.webp`,
    preview: `${basePath}/preview.webp`,
  };
}

async function processImages(buffer) {
  const image = sharp(buffer).webp(FULL_IMAGE_OPTIONS);

  const metadata = await image.metadata();

  const optimizedBuffer = await image.toBuffer();
  const previewBuffer = await sharp(buffer)
    .webp(PREVIEW_IMAGE_OPTIONS)
    .toBuffer();

  return { optimizedBuffer, previewBuffer, metadata };
}

function uploadImages(paths, optimizedBuffer, previewBuffer) {
  return Promise.all([
    upload(paths.full, optimizedBuffer),
    upload(paths.preview, previewBuffer),
  ]);
}

function upload(path, buffer) {
  return put(path, buffer, {
    access: 'public',
    contentType: WEBP_CONTENT_TYPE,
  });
}
