'use client';

import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

import LocaleSwitch from '@/components/LocaleSwitch';
import Pagination from '@/components/Pagination';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from '@/i18n/navigation';

const ImageCard = memo(function ImageCard({
  id,
  path,
  width,
  height,
  onEdit,
  onDelete,
}) {
  const t = useTranslations('Manage');

  return (
    <div className="card bg-base-100 rounded-default flex flex-col overflow-hidden shadow-lg">
      <Image
        src={path}
        loading="eager"
        alt={`Image ${id}`}
        width={width}
        height={height}
        className="h-48 w-full object-cover transition-[filter] hover:brightness-75"
        quality={70}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <button
          className="btn btn-warning w-full"
          onClick={() => onEdit(id)}
          type="button"
        >
          <PencilIcon className="h-4 w-4" /> {t('edit')}
        </button>
        <button
          className="btn btn-error w-full"
          onClick={() => onDelete(id)}
          type="button"
        >
          <Trash2Icon className="h-4 w-4" /> {t('delete')}
        </button>
      </div>
    </div>
  );
});

const limit = 18;

export default function Manage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get('page') ?? 1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const t = useTranslations('Manage');

  const fetchImages = useCallback(() => {
    setLoading(true);
    fetch(`/api/images?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(res => {
        setImages(res.data);
        setTotalPages(res.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    router.replace(`?page=${page}`, { scroll: false });
  }, [page, router]);

  const addImage = useCallback(async () => {
    const url = prompt(`${t('enterimageurl')}:`);
    if (!url) return;

    const toastId = toast.loading(t('addingimage'));

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error();

      setPage(1);
      fetchImages();

      toast.update(toastId, {
        render: t('imageadded'),
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      });
    } catch {
      toast.update(toastId, {
        render: t('addfailed'),
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    }
  }, [fetchImages, t]);

  const editImage = useCallback(
    async id => {
      const url = prompt(`${t('enternewimageurl')}:`);
      if (!url) return;

      const toastId = toast.loading(t('updatingimage'));

      try {
        const res = await fetch('/api/images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, url }),
        });

        if (!res.ok) throw new Error();

        setImages(prev =>
          prev.map(img => (img.id === id ? { ...img, path: url } : img))
        );

        toast.update(toastId, {
          render: t('imageupdated'),
          type: 'success',
          isLoading: false,
          autoClose: 2500,
        });
      } catch {
        toast.update(toastId, {
          render: t('updatefailed'),
          type: 'error',
          isLoading: false,
          autoClose: 2500,
        });
      }
    },
    [t]
  );

  const deleteImage = useCallback(
    async id => {
      if (!confirm(`${t('areyousure')}?`)) return;

      const toastId = toast.loading(t('deletingimage'));

      try {
        const res = await fetch('/api/images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error();

        setPage(1);
        fetchImages();

        toast.update(toastId, {
          render: t('imagedeleted'),
          type: 'success',
          isLoading: false,
          autoClose: 2500,
        });
      } catch {
        toast.update(toastId, {
          render: t('deletefailed'),
          type: 'error',
          isLoading: false,
          autoClose: 2500,
        });
      }
    },
    [fetchImages, t]
  );

  usePageTitle(t('manage'));

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" newestOnTop={true} />

      <div className="p-4">
        <div className="mb-4 space-y-2 md:flex md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold">{t('manage')}</h1>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={addImage}
              type="button"
            >
              <PlusIcon className="h-4 w-4" /> {t('add')}
            </button>
            <Link href="/" className="btn btn-accent">
              <CheckIcon className="h-4 w-4" /> {t('done')}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {images.map(img => (
                <ImageCard
                  key={img.id}
                  id={img.id}
                  path={img.path}
                  width={img.width}
                  height={img.height}
                  onEdit={editImage}
                  onDelete={deleteImage}
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
      </div>
    </>
  );
}
