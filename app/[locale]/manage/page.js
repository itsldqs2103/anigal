'use client';

import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { toast, ToastContainer } from 'react-toastify';

import Pagination from '@/components/Pagination';
import { usePageTitle } from '@/hooks/usePageTitle';

const PAGE_LIMIT = 24;

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

  const handleSave = () => {
    onClose();
    onSave(url);
    setUrl('');
  };

  return (
    <BaseModal open={open} title={t('add')} onClose={onClose}>
      <input
        className="input mb-4 w-full"
        placeholder={t('enterimageurl')}
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        confirmLabel={t('save')}
      />
    </BaseModal>
  );
}

function EditImageModal({ open, image, onClose, onSave }) {
  const t = useTranslations('Manage');
  const [url, setUrl] = useState(image?.path ?? '');

  const handleSave = () => {
    if (!image) return;
    onClose();
    onSave(image.id, url);
  };

  return (
    <BaseModal
      key={image?.id}
      open={open}
      title={t('edit')}
      onClose={onClose}
    >
      <input
        className="input mb-4 w-full"
        placeholder={t('enternewimageurl')}
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        confirmLabel={t('save')}
      />
    </BaseModal>
  );
}

function DeleteImageModal({ open, imageId, onClose, onConfirm }) {
  const t = useTranslations('Manage');

  const handleDelete = () => {
    if (!imageId) return;
    onClose();
    onConfirm(imageId);
  };

  return (
    <BaseModal
      open={open}
      title={`${t('areyousure')}?`}
      onClose={onClose}
    >
      <ModalActions
        danger
        disabled={!imageId}
        onCancel={onClose}
        onConfirm={handleDelete}
        confirmLabel={t('delete')}
      />
    </BaseModal>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  danger = false,
  disabled = false,
}) {
  return (
    <div className="flex justify-end gap-2">
      <button className="btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        className={`btn ${danger ? 'btn-error' : 'btn-primary'}`}
        disabled={disabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
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
        src={preview_url}
        alt={`Image ${id}`}
        width={width}
        height={height}
        wrapperProps={{ style: { display: 'block', color: 'transparent' } }}
        className="aspect-square w-full object-cover transition hover:brightness-75"
      />
      <div className="flex flex-col gap-2 p-4">
        <button
          className="btn btn-warning"
          onClick={() => onEdit(id, path)}
        >
          <PencilIcon className="h-4 w-4" /> {t('edit')}
        </button>
        <button
          className="btn btn-error"
          onClick={() => onDelete(id)}
        >
          <Trash2Icon className="h-4 w-4" /> {t('delete')}
        </button>
      </div>
    </div>
  );
});

export default function Manage() {
  const t = useTranslations('Manage');
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get('page') ?? 1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedImage, setSelectedImage] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  usePageTitle(t('manage'));

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/images?page=${page}&limit=${PAGE_LIMIT}`
      );
      const data = await res.json();
      setImages(data.data);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    router.replace(`?page=${page}`, { scroll: false });
  }, [page, router]);

  const withToast = async (loadingMsg, successMsg, errorMsg, action) => {
    const id = toast.loading(loadingMsg);
    try {
      await action();
      toast.update(id, {
        render: successMsg,
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      });
    } catch {
      toast.update(id, {
        render: errorMsg,
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    }
  };

  const addImage = url =>
    withToast(
      t('addingimage'),
      t('imageadded'),
      t('addfailed'),
      async () => {
        await fetch('/api/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        setPage(1);
        fetchImages();
      }
    );

  const editImage = (id, url) =>
    withToast(
      t('updatingimage'),
      t('imageupdated'),
      t('updatefailed'),
      async () => {
        await fetch('/api/images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, url }),
        });
        setImages(prev =>
          prev.map(img =>
            img.id === id ? { ...img, path: url } : img
          )
        );
      }
    );

  const deleteImage = id =>
    withToast(
      t('deletingimage'),
      t('imagedeleted'),
      t('deletefailed'),
      async () => {
        await fetch('/api/images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        setPage(1);
        fetchImages();
      }
    );

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
          <button
            className="btn btn-primary"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon className="h-4 w-4" /> {t('add')}
          </button>
        </div>

        {loading ? (
          <LoadingState text={t('loadingimages')} />
        ) : images.length === 0 ? (
          <EmptyState text={t('noimagesfound')} />
        ) : (
          <>
            <ImageGrid
              images={images}
              onEdit={img => {
                setSelectedImage(img);
                setEditOpen(true);
              }}
              onDelete={id => {
                setSelectedImage({ id });
                setDeleteOpen(true);
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
      </div>
    </>
  );
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
      <div className="bg-error rounded-default text-error-content inline-flex items-center gap-1 px-3 py-2 shadow-lg">
        <XCircleIcon className="h-4 w-4" />
        {text}
      </div>
    </div>
  );
}

function ImageGrid({ images, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {images.map(img => (
        <ImageCard
          key={img.id}
          {...img}
          onEdit={(id, path) => onEdit({ id, path })}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
