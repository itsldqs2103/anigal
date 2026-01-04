'use client';
import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | AniGal`;
    } else {
      document.title = 'AniGal';
    }
  }, [title]);
}
