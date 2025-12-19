'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CopyrightIcon } from 'lucide-react';

function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-base-100 rounded-default mx-4 mb-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className='flex items-center gap-1'>
          <CopyrightIcon className='w-4 h-4 inline-flex' />
          <span>{new Date().getFullYear()} AniGal. {t('allrightsreserved')}</span>
        </div>

        <nav className="flex md:flex-row md:gap-4 gap-2 md:justify-end flex-col">
          <Link href="/status" className="hover:text-accent transition-[color]">
            {t('status')}
          </Link>
          <Link href="/privacy" className="hover:text-accent transition-[color]">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="hover:text-accent transition-[color]">
            {t('terms')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
