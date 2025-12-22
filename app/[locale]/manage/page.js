'use client';

import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Pagination from '@/components/Pagination';
import { usePageTitle } from '@/hooks/usePageTitle';

function Modal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    open ? dialogRef.current.showModal() : dialogRef.current.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <div className="mb-4">
          <div className="font-bold text-lg">{title}</div>
        </div>

        {children}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

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
      <LazyLoadImage
        wrapperProps={{ style: { display: 'block', color: 'transparent' } }}
        src={path}
        alt={`Image ${id}`}
        width={width}
        height={height}
        className="h-48 w-full object-cover hover:brightness-75"
      />
      <div className="flex flex-col gap-2 p-4">
        <button className="btn btn-warning" onClick={() => onEdit(id, path)}>
          <PencilIcon className="h-4 w-4" /> {t('edit')}
        </button>
        <button className="btn btn-error" onClick={() => onDelete(id)}>
          <Trash2Icon className="h-4 w-4" /> {t('delete')}
        </button>
      </div>
    </div>
  );
});

const limit = 24;

export default function Manage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Manage');

  const initialPage = Number(searchParams.get('page') ?? 1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [modal, setModal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

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

  const addImage = async url => {
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
  };

  const editImage = async (id, url) => {
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
  };

  const deleteImage = async id => {
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
  };

  usePageTitle(t('manage'));

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" newestOnTop />

      <Modal
        open={modal === 'add' || modal === 'edit'}
        title={modal === 'add' ? t('add') : t('edit')}
        onClose={() => setModal(null)}
      >
        <input
          className="input w-full mb-4"
          placeholder={modal === 'add' ? t('enterimageurl') : t('enternewimageurl')}
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setModal(null)}>
            {t('cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setModal(null);
              modal === 'add'
                ? addImage(imageUrl)
                : editImage(selectedId, imageUrl);
            }}
          >
            {t('save')}
          </button>
        </div>
      </Modal>

      <Modal
        open={modal === 'delete'}
        title={t('delete')}
        onClose={() => setModal(null)}
      >
        <p className="mb-4">{t('areyousure')}?</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setModal(null)}>
            {t('cancel')}
          </button>
          <button
            className="btn btn-error"
            onClick={() => {
              setModal(null);
              deleteImage(selectedId);
            }}
          >
            {t('delete')}
          </button>
        </div>
      </Modal>

      <div className="p-4">
        <div className='text-end'>
          <button
            className="btn btn-primary mb-4"
            onClick={() => {
              setImageUrl('');
              setModal('add');
            }}
          >
            <PlusIcon className="h-4 w-4" /> {t('add')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-xs" />
            {t('loadingimages')}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center">
            <div className="inline-flex items-center gap-1 bg-error px-3 py-2 rounded-default text-error-content font-bold">
              <XCircleIcon className="w-4 h-4" />
              {t('noimagesfound')}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {images.map(img => (
                <ImageCard
                  key={img.id}
                  {...img}
                  onEdit={(id, url) => {
                    setSelectedId(id);
                    setImageUrl(url);
                    setModal('edit');
                  }}
                  onDelete={id => {
                    setSelectedId(id);
                    setModal('delete');
                  }}
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
