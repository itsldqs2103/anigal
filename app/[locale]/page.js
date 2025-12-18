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
import { imageRefreshKey } from '@/utils/imagerefresh';

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
      const res = await fetch(`/api/images?page=${page}&limit=${limit}`);
      const data = await res.json();
      setImages(data.data);
      setTotalPages(data.totalPages);
      setLoading(false);
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    const onStorage = e => {
      if (e.key === imageRefreshKey) {
        setPage(1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    router.replace(`?page=${page}`, { scroll: false });
  }, [page, router]);

  const slides = useMemo(
    () => images.map(img => ({ src: img.path })),
    [images]
  );

  const t = useTranslations('Home');
  usePageTitle(t('gallery'));

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('gallery')}</h1>
        <div className="flex gap-2">
          <Link href="/manage" className="btn btn-accent">
            <ListCheckIcon className="h-4 w-4" /> {t('manage')}
          </Link>
          <LocaleSwitch />
        </div>
      </div>

      {loading ? (
        <div className="text-center">{t('loadingimages')}</div>
      ) : (
        <>
          <div className="columns-2 gap-4 md:columns-4 lg:columns-6">
            {images.map((img, index) => (
              <Image
                key={img.id}
                src={img.path}
                width={img.width}
                height={img.height}
                className="mb-4 cursor-pointer rounded"
                onClick={() => {
                  setCurrentIndex(index);
                  setOpen(true);
                }}
                alt=""
              />
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
      />
    </div>
  );
}
