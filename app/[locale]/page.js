'use client';

import { ListCheckIcon } from 'lucide-react';
import Image from 'next/image';
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

import LocaleSwitch from '@/components/LocaleSwitch';
import Pagination from '@/components/Pagination';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from '@/i18n/navigation';

const limit = 18;

export default function Home() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get('page') ?? 1);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/images?page=${page}&limit=${limit}`);
        const data = await res.json();
        setImages(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  useEffect(() => {
    router.replace(`?page=${page}`, { scroll: false });
  }, [page, router]);

  const slides = useMemo(
    () => images.map(img => ({ src: img.path })),
    [images]
  );

  useEffect(() => {
    if (!open) return;

    const removeTitles = () => {
      const buttons = document.querySelectorAll('.yarl__button');
      buttons.forEach(btn => btn.removeAttribute('title'));
    };

    removeTitles();

    const observer = new MutationObserver(() => {
      removeTitles();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [open]);

  const t = useTranslations('Home');

  usePageTitle(t('gallery'));

  return (
    <div className="p-4">
      <div className="mb-4 space-y-2 md:flex md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-bold">{t('gallery')}</h1>
        <div className="flex items-center gap-2">
          <Link href="/manage" className="btn btn-accent">
            <ListCheckIcon className="h-4 w-4" /> {t('manage')}
          </Link>
          <LocaleSwitch />
        </div>
      </div>

      {loading ? (
        <div className="text-center">{t('loadingimages')}</div>
      ) : images.length === 0 ? (
        <div className="text-center">{t('noimagesfound')}</div>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
            {images.map((img, index) => (
              <div key={img.id} className="break-inside-avoid not-last:mb-4">
                <Image
                  width={img.width}
                  height={img.height}
                  loading="eager"
                  src={img.path || img.url}
                  alt={`Image ${img.id}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setOpen(true);
                  }}
                  quality={70}
                  className="rounded-default w-full cursor-pointer shadow-lg transition-[filter] hover:brightness-75"
                />
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            loading={loading}
            setPage={setPage}
          />
        </>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={currentIndex}
        slides={slides}
        plugins={[Fullscreen, Download, Zoom, Share, Slideshow, Counter]}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
