"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import Link from "next/link";
import { useEffect, useState, useCallback, memo } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";

const ImageCard = memo(function ImageCard({ id, path, onEdit, onDelete }) {
  return (
    <div className="card bg-base-100 rounded-default shadow-lg overflow-hidden flex flex-col">
      <Image
        src={path} loading="eager"
        alt={`Image ${id}`} width={256} height={256}
        className="h-48 w-full object-cover"
      />
      <div className="p-4 flex justify-between items-center gap-2 flex-wrap">
        <button className="btn btn-warning flex-1" onClick={() => onEdit(id)}>
          <PencilIcon className="w-4 h-4" /> Edit
        </button>
        <button className="btn btn-error flex-1" onClick={() => onDelete(id)}>
          <Trash2Icon className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
});

export default function Manage() {
  usePageTitle("Manage");

  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") ?? 1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 24;

  const fetchImages = useCallback(() => {
    setLoading(true);
    fetch(`/api/images?page=${page}&limit=${LIMIT}`)
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
    const url = prompt("Enter image URL:");
    if (!url) return;

    const toastId = toast.loading("Adding image");

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
        render: "Image added",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch {
      toast.update(toastId, {
        render: "Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  }, [fetchImages]);

  const editImage = useCallback(async (id) => {
    const url = prompt("Enter NEW image URL:");
    if (!url) return;

    const toastId = toast.loading("Updating image");

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
        render: "Image updated",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch {
      toast.update(toastId, {
        render: "Update failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  }, []);

  const deleteImage = useCallback(async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    const toastId = toast.loading("Deleting image");

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
        render: "Image deleted",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch {
      toast.update(toastId, {
        render: "Delete failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  }, [fetchImages]);

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage</h1>
          <div className="gap-2 flex">
            <button className="btn btn-primary" onClick={addImage}>
              <PlusIcon className="w-4 h-4" /> Add
            </button>
            <Link href="/" className="btn btn-accent">
              <CheckIcon className="w-4 h-4" /> Done
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading images</div>
        ) : images.length === 0 ? (
          <div className="text-center">No images found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {images.map(img => (
                <ImageCard
                  key={img.id}
                  id={img.id}
                  path={img.path}
                  onEdit={editImage}
                  onDelete={deleteImage}
                />
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

                <div className="hidden sm:flex join">
                  {(() => {
                    const pages = [];

                    if (page > 2) {
                      pages.push(1);
                    }

                    if (page > 3) {
                      pages.push("start-ellipsis");
                    }

                    for (
                      let p = Math.max(1, page - 1);
                      p <= Math.min(totalPages, page + 1);
                      p++
                    ) {
                      pages.push(p);
                    }

                    if (page < totalPages - 2) {
                      pages.push("end-ellipsis");
                    }

                    if (page < totalPages - 1) {
                      pages.push(totalPages);
                    }

                    return pages.map((p, i) =>
                      typeof p === "number" ? (
                        <button
                          key={p}
                          className={`join-item btn ${p === page ? "btn-active" : ""}`}
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
      </div>
    </>
  );
}
