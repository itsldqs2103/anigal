'use client';

import { PencilIcon, PlusIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Pagination from '@/components/Pagination';
import { usePageTitle } from '@/hooks/usePageTitle';

function BaseModal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    open ? dialogRef.current.showModal() : dialogRef.current.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <div className="mb-4 text-lg font-bold">{title}</div>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

function AddImageModal({ open, onClose, onSave }) {
  const t = useTranslations('Manage');
  const [url, setUrl] = useState('');

  return (
    <BaseModal open={open} title={t('add')} onClose={onClose}>
      <input
        className="input mb-4 w-full"
        placeholder={t('enterimageurl')}
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onClose}>
          {t('cancel')}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            onClose();
            onSave(url);
            setUrl('');
          }}
        >
          {t('save')}
        </button>
      </div>
    </BaseModal>
  );
}

function EditImageModal({ open, image, onClose, onSave }) {
  const t = useTranslations('Manage');
  const [url, setUrl] = useState(image?.path ?? '');

  return (
    <BaseModal open={open} title={t('edit')} onClose={onClose} key={image?.id}>
      <input
        className="input mb-4 w-full"
        placeholder={t('enternewimageurl')}
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onClose}>
          {t('cancel')}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            onClose();
            if (image) onSave(image.id, url);
          }}
        >
          {t('save')}
        </button>
      </div>
    </BaseModal>
  );
}

function DeleteImageModal({ open, imageId, onClose, onConfirm }) {
  const t = useTranslations('Manage');

  return (
    <BaseModal open={open} title={`${t('areyousure')}?`} onClose={onClose}>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onClose}>
          {t('cancel')}
        </button>
        <button
          className="btn btn-error"
          disabled={!imageId}
          onClick={() => {
            onClose();
            if (imageId) onConfirm(imageId);
          }}
        >
          {t('delete')}
        </button>
      </div>
    </BaseModal>
  );
}

const ImageCard = memo(function ImageCard({
  id,
  path,
  preview_url,
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
        src={preview_url}
        alt={`Image ${id}`}
        width={width}
        height={height}
        className="aspect-square w-full object-cover transition-[filter] hover:brightness-75"
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

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

      <AddImageModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={addImage}
      />

      <EditImageModal
        open={editOpen}
        image={selectedImage}
        onClose={() => setEditOpen(false)}
        onSave={editImage}
      />

      <DeleteImageModal
        open={deleteOpen}
        imageId={selectedImage?.id}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteImage}
      />

      <div className="px-8 py-4">
        <div className="mb-4 text-end">
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="h-4 w-4" /> {t('add')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-1">
            <span className="loading loading-spinner loading-xs" />
            {t('loadingimages')}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center">
            <div className="bg-error rounded-default text-error-content inline-flex items-center gap-1 px-3 py-2 shadow-lg">
              <XCircleIcon className="h-4 w-4" />
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
                  onEdit={(id, path) => {
                    setSelectedImage({ id, path });
                    setEditOpen(true);
                  }}
                  onDelete={id => {
                    setSelectedImage({ id });
                    setDeleteOpen(true);
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
