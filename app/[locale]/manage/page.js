"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback, memo } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Pagination from "@/components/Pagination";
import LocaleSwitch from "@/components/LocaleSwitch";

const ImageCard = memo(function ImageCard({ id, path, width, height, onEdit, onDelete }) {
  const t = useTranslations('Manage');

  return (
    <div className="card bg-base-100 rounded-default shadow-lg overflow-hidden flex flex-col">
      <Image
        src={path} loading="eager"
        alt={`Image ${id}`} width={width} height={height}
        className="h-48 w-full object-cover hover:brightness-75 transition-[filter]" quality={70}
      />
      <div className="p-4 flex justify-between items-center gap-2 flex-wrap">
        <button className="btn btn-warning w-full" onClick={() => onEdit(id)} type="button">
          <PencilIcon className="w-4 h-4" /> {t('edit')}
        </button>
        <button className="btn btn-error w-full" onClick={() => onDelete(id)} type="button">
          <Trash2Icon className="w-4 h-4" /> {t('delete')}
        </button>
      </div>
    </div>
  );
});

const limit = 18;

export default function Manage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") ?? 1);

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
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error();

      setPage(1);
      fetchImages();

      toast.update(toastId, {
        render: t('imageadded'),
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch {
      toast.update(toastId, {
        render: t('addfailed'),
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    }
  }, [fetchImages, t]);

  const editImage = useCallback(async (id) => {
    const url = prompt(`${t('enternewimageurl')}:`);
    if (!url) return;

    const toastId = toast.loading(t('updatingimage'));

    try {
      const res = await fetch("/api/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, url }),
      });

      if (!res.ok) throw new Error();

      setImages(prev =>
        prev.map(img => (img.id === id ? { ...img, path: url } : img))
      );

      toast.update(toastId, {
        render: t('imageupdated'),
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch {
      toast.update(toastId, {
        render: t('updatefailed'),
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    }
  }, [t]);

  const deleteImage = useCallback(async (id) => {
    if (!confirm(`${t('areyousure')}?`)) return;

    const toastId = toast.loading(t('deletingimage'));

    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error();

      setPage(1);
      fetchImages();

      toast.update(toastId, {
        render: t('imagedeleted'),
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch {
      toast.update(toastId, {
        render: t('deletefailed'),
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    }
  }, [fetchImages, t]);

  usePageTitle(t('manage'));

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" newestOnTop={true} />

      <div className="p-4">
        <div className="mb-4 md:flex md:justify-between md:items-center space-y-2 md:space-y-0">
          <h1 className="text-2xl font-bold">{t('manage')}</h1>
          <div className="gap-2 flex">
            <button className="btn btn-primary" onClick={addImage} type="button">
              <PlusIcon className="w-4 h-4" /> {t('add')}
            </button>
            <Link href="/" className="btn btn-accent">
              <CheckIcon className="w-4 h-4" /> {t('done')}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {images.map(img => (
                <ImageCard
                  key={img.id}
                  id={img.id}
                  path={img.path} width={img.width} height={img.height}
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
