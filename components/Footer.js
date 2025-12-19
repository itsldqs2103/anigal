'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-base-100 rounded-default mx-4 mb-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          © {new Date().getFullYear()} AniGal. {t('allrightsreserved')}
        </div>

        <nav className="md:flex md:flex-wrap md:gap-4 md:justify-end">
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
