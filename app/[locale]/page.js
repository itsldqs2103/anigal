"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useState, useMemo, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Share from "yet-another-react-lightbox/plugins/share";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon, LanguagesIcon, ListCheckIcon } from "lucide-react";
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from "next/navigation";

const LIMIT = 24;

export default function Home() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page") ?? 1);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/images?page=${page}&limit=${LIMIT}`);
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

  const t = useTranslations('Home');
  const locale = useLocale();

  usePageTitle(t('gallery'));

  return (
    <div className="p-4">
      <div className="mb-4 md:flex md:justify-between md:items-center space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">{t('gallery')}</h1>
        <div className="flex gap-2 items-center">
          <Link href="/manage" className="btn btn-accent">
            <ListCheckIcon className="w-4 h-4" /> {t('manage')}
          </Link>
          {locale === 'en' ? (
            <Link href="/" locale="vi" className="btn btn-primary">
              <LanguagesIcon className="w-4 h-4" /> VI
            </Link>
          ) : (
            <Link href="/" locale="en" className="btn btn-primary">
              <LanguagesIcon className="w-4 h-4" /> ENG
            </Link>
          )}
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
              <div key={img.id} className="not-last:mb-4 break-inside-avoid">
                <Image width={256} height={256} loading="eager"
                  src={img.path}
                  alt={`Image ${img.id}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setOpen(true);
                  }}
                  className="w-full cursor-pointer rounded-default shadow-lg hover:brightness-75 transition-[filter]"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <div className="join">
              <button
                className="join-item btn"
                disabled={loading || page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex">
                {(() => {
                  const pages = [];

                  if (page > 2) pages.push(1);
                  if (page > 3) pages.push("start-ellipsis");
                  for (let p = Math.max(1, page - 1); p <= Math.min(totalPages, page + 1); p++) {
                    pages.push(p);
                  }
                  if (page < totalPages - 2) pages.push("end-ellipsis");
                  if (page < totalPages - 1) pages.push(totalPages);

                  return pages.map((p, i) =>
                    typeof p === "number" ? (
                      <button
                        key={p} className="join-item btn" disabled={p === page}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ) : (
                      <button
                        key={p + i}
                        className="join-item btn btn-disabled pointer-events-none"
                      >
                        <EllipsisIcon className="w-4 h-4" />
                      </button>
                    )
                  );
                })()}
              </div>

              <div className="sm:hidden join-item btn pointer-events-none">
                {page} / {totalPages}
              </div>

              <button
                className="join-item btn"
                disabled={loading || page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={currentIndex}
        slides={slides}
        plugins={[Fullscreen, Download, Zoom, Share]}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
