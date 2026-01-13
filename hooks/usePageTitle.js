'use client';

import { useEffect } from 'react';

const APP_NAME = 'AniGal';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = buildTitle(title);
  }, [title]);
}

function buildTitle(title) {
  return title ? `${title} | ${APP_NAME}` : APP_NAME;
}
