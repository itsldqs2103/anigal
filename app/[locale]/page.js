'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Share from 'yet-another-react-lightbox/plugins/share';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { XCircleIcon } from 'lucide-react';

import Pagination from '@/components/Pagination';
import { usePageTitle } from '@/hooks/usePageTitle';
import axios from 'axios';

const PAGE_LIMIT = 24;

export default function Home() {
  const t = useTranslations('Home');
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get('page') ?? 1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  usePageTitle(t('home'));

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    router.replace(`?page=${page}`, { scroll: false });
  }, [page, router]);

  useEffect(() => {
    fetchImages(page, setImages, setTotalPages, setLoading);
  }, [page]);

  const slides = useMemo(
    () => images.map(img => ({ src: img.path })),
    [images]
  );

  const LIGHTBOX_PLUGINS = useMemo(() => {
    const plugins = [Fullscreen, Download, Zoom, Share, Counter];
    if (slides.length > 1) plugins.push(Slideshow);
    return plugins;
  }, [slides.length]);

  useRemoveLightboxTitles(lightboxOpen);

  return (
    <div className="px-8 py-4">
      {loading ? (
        <LoadingState text={t('loadingimages')} />
      ) : images.length === 0 ? (
        <EmptyState text={t('noimagesfound')} />
      ) : (
        <>
          <ImageMasonry
            images={images}
            onImageClick={index => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            loading={loading}
            setPage={setPage}
          />
        </>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={LIGHTBOX_PLUGINS}
        controller={{ closeOnBackdropClick: true }}
        render={{
          buttonPrev: slides.length <= 1 ? () => null : undefined,
          buttonNext: slides.length <= 1 ? () => null : undefined,
        }}
      />
    </div>
  );
}

async function fetchImages(page, setImages, setTotalPages, setLoading) {
  setLoading(true);
  try {
    const res = await axios.get('/api/images', {
      params: { page, limit: PAGE_LIMIT },
    });

    setImages(res.data.data);
    setTotalPages(res.data.totalPages);
  } finally {
    setLoading(false);
  }
}

function useRemoveLightboxTitles(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const removeTitles = () => {
      document.querySelectorAll('.yarl__button').forEach(btn => {
        btn.removeAttribute('title');
        btn.removeAttribute('aria-label');
      });
    };

    removeTitles();

    const observer = new MutationObserver(removeTitles);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [enabled]);
}

function LoadingState({ text }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <span className="loading loading-spinner loading-xs" />
      {text}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center">
      <div className="rounded-default bg-error text-error-content inline-flex items-center gap-1 px-3 py-2 shadow-lg">
        <XCircleIcon className="h-4 w-4" />
        {text}
      </div>
    </div>
  );
}

function ImageMasonry({ images, onImageClick }) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
      {images.map((img, index) => (
        <div key={img.id} className="break-inside-avoid not-last:mb-4">
          <LazyLoadImage
            effect="opacity"
            src={img.preview_url}
            alt={`Image ${img.id}`}
            width={img.width}
            height={img.height}
            wrapperProps={{
              style: { display: 'block', color: 'transparent' },
            }}
            onClick={() => onImageClick(index)}
            className="rounded-default w-full cursor-pointer shadow-lg transition hover:brightness-75"
          />
        </div>
      ))}
    </div>
  );
}
