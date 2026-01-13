'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const DRAG_EVENTS = ['dragstart', 'dragover', 'drop'];
const NO_POINTER_CLASS = 'pointer-events-none';

function preventDefault(event) {
  event.preventDefault();
}

function toggleGlobalDragPrevention(enable) {
  const method = enable ? 'addEventListener' : 'removeEventListener';

  DRAG_EVENTS.forEach(event => {
    document[method](event, preventDefault, { passive: false });
  });
}

export default function LayoutScript() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  const searchKey = useMemo(
    () => searchParams?.toString() ?? '',
    [searchParams]
  );

  useEffect(() => {
    toggleGlobalDragPrevention(true);
    return () => toggleGlobalDragPrevention(false);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (document.visibilityState !== 'visible') return;

    const root = document.documentElement;
    root.classList.add(NO_POINTER_CLASS);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove(NO_POINTER_CLASS);
      });
    });
  }, [pathname, searchKey]);

  return null;
}
