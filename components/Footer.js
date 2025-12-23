'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CopyrightIcon } from 'lucide-react';

function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-base-100 rounded-default mx-4 mb-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1">
          <CopyrightIcon className="inline-flex h-4 w-4" />
          <span>
            {new Date().getFullYear()} AniGal. {t('allrightsreserved')}
          </span>
        </div>

        <nav className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-4">
          <Link
            href="/about"
            className="hover:text-accent transition-[color]"
          >
            {t('about')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
