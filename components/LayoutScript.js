'use client';

import { useEffect } from 'react';

export default function LayoutScript() {
  useEffect(() => {
    const prevent = event => event.preventDefault();

    const events = ['dragstart', 'dragover', 'drop'];

    events.forEach(type => document.addEventListener(type, prevent));

    return () => {
      events.forEach(type => document.removeEventListener(type, prevent));
    };
  }, []);

  return null;
}
