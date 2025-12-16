"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import Link from "next/link";
import { useEffect, useState, useCallback, memo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ToastContainer, toast } from "react-toastify";

const ImageCard = memo(function ImageCard({ id, path, onEdit, onDelete }) {
  return (
    <div className="card bg-base-100 rounded-default shadow-lg overflow-hidden flex flex-col">
      <LazyLoadImage
        src={path}
        alt={`Image ${id}`}
        effect="opacity"
        className="h-48 w-full object-cover"
        wrapperProps={{ style: { display: "block" } }}
      />
      <div className="p-4 flex justify-between items-center gap-2 flex-wrap">
        <button
          className="btn btn-warning flex-1"
          onClick={() => onEdit(id)}
        >
          Edit
        </button>
        <button
          className="btn btn-error flex-1"
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
});

export default function Manage() {
  usePageTitle("Manage");

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(() => {
    setLoading(true);
    fetch("/api/images")
      .then(res => res.json())
      .then(setImages)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

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

      const newImage = await res.json();

      setImages(prev => [...prev, newImage]);

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
  }, []);

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
        prev.map(img =>
          img.id === id ? { ...img, path: url } : img
        )
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

      setImages(prev => prev.filter(img => img.id !== id));

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
  }, []);

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage</h1>
          <div className="gap-2 flex">
            <button className="btn btn-primary" onClick={addImage}>
              Add Image
            </button>
            <Link href="/" className="btn btn-accent">
              Done
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading images</div>
        ) : images.length === 0 ? (
          <div className="text-center">No images found</div>
        ) : (
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
        )}
      </div>
    </>
  );
}
