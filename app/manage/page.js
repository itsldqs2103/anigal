"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ToastContainer, toast } from "react-toastify";

export default function Manage() {
  usePageTitle("Manage");

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = () => {
    setLoading(true);
    fetch("/api/images")
      .then(res => res.json())
      .then(setImages)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const addImage = async () => {
    const url = prompt("Enter image URL:");
    if (!url) return;

    const toastId = toast.loading("Adding image…");

    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error();

      toast.update(toastId, {
        render: "Image added!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      fetchImages();
    } catch {
      toast.update(toastId, {
        render: "Failed!",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const editImage = async (id) => {
    const url = prompt("Enter NEW image URL:");
    if (!url) return;

    const toastId = toast.loading("Updating image…");

    try {
      const res = await fetch("/api/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, url }),
      });

      if (!res.ok) throw new Error();

      toast.update(toastId, {
        render: "Image updated!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      fetchImages();
    } catch {
      toast.update(toastId, {
        render: "Update failed!",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const deleteImage = async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    const toastId = toast.loading("Deleting image…");

    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error();

      toast.update(toastId, {
        render: "Image deleted!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      fetchImages();
    } catch {
      toast.update(toastId, {
        render: "Delete failed!",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="p-4">
        <div className="mb-4">
          <button className="btn btn-primary" onClick={addImage}>
            Add Image
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center">
                    Loading images…
                  </td>
                </tr>
              ) : images.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center">
                    No images found!
                  </td>
                </tr>
              ) : (
                images.map(({ id, path }) => (
                  <tr
                    key={id}
                    className="hover:bg-base-100 transition-[background-color]"
                  >
                    <td className="align-middle">
                      <LazyLoadImage
                        src={path}
                        alt={`Image ${id}`}
                        effect="opacity"
                        wrapperProps={{ style: { display: "block" } }}
                        className="h-32 rounded-default shadow-lg"
                      />
                    </td>

                    <td className="align-middle">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="btn btn-warning"
                          onClick={() => editImage(id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-error"
                          onClick={() => deleteImage(id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
