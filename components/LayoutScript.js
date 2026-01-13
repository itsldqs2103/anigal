'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const DRAG_EVENTS = ['dragstart', 'dragover', 'drop'];
const NO_POINTER_CLASS = 'pointer-events-none';

function disableEvent(event) {
  event.preventDefault();
}

function lockPointerEvents() {
  document.documentElement.classList.add(NO_POINTER_CLASS);
}

function unlockPointerEvents() {
  document.documentElement.classList.remove(NO_POINTER_CLASS);
}

export default function LayoutScript() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!document) return;

    DRAG_EVENTS.forEach(eventType => {
      document.addEventListener(eventType, disableEvent, { passive: false });
    });

    return () => {
      DRAG_EVENTS.forEach(eventType => {
        document.removeEventListener(eventType, disableEvent);
      });
    };
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (!document) return;

    lockPointerEvents();

    if (document.startViewTransition) {
      const transition = document.startViewTransition(unlockPointerEvents);

      return () => {
        transition?.finished?.finally(unlockPointerEvents);
      };
    }

    queueMicrotask(unlockPointerEvents);
    return unlockPointerEvents;
  }, [pathname, searchParams]);

  return null;
}
