"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Link from "next/link";
import Image from "next/image";

const LIMIT = 24;

export default function Home() {
  usePageTitle("Home");

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const observerRef = useRef(null);
  const didInit = useRef(false);

  const fetchImages = useCallback(async () => {
    if (fetching || page > totalPages) return;

    setFetching(true);

    try {
      const res = await fetch(`/api/images?page=${page}&limit=${LIMIT}`);
      const { data, totalPages: newTotalPages } = await res.json();

      setImages(prev => {
        const map = new Map(prev.map(img => [img.id, img]));
        data.forEach(img => map.set(img.id, img));
        return Array.from(map.values());
      });

      setTotalPages(newTotalPages);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error("Failed to fetch images", err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [fetching, page, totalPages]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchImages();
      },
      { rootMargin: "300px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchImages]);

  const slides = useMemo(
    () => images.map(img => ({ src: img.path })),
    [images]
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <Link href="/manage" className="btn btn-primary">
          Manage
        </Link>
      </div>

      {loading ? (
        <div className="text-center">Loading images</div>
      ) : images.length === 0 ? (
        <div className="text-center">No images found</div>
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

          {page <= totalPages && (
            <div ref={observerRef} className="text-center">
              {fetching && <span>Loading images</span>}
            </div>
          )}
        </>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={currentIndex}
        slides={slides}
        plugins={[Fullscreen, Download, Zoom]}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
