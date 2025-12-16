"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Home() {
  usePageTitle("Home");

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/images")
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="text-center">Loading images</div>
      ) : images.length === 0 ? (
        <div className="text-center">No images found!</div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
          {images.map(({ id, path }) => (
            <div key={id} className="not-last:mb-4 break-inside-avoid">
              <LazyLoadImage
                src={path}
                alt={`Image ${id}`}
                effect="opacity"
                wrapperProps={{ style: { display: "block" } }}
                className="w-full rounded-default shadow-lg hover:brightness-75 transition-[filter]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}