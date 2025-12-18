'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-base-100 rounded-default mx-4 mb-4 p-4 text-end">
      <Link href="/status" className="hover:text-accent transition-[color]">
        {t('status')}
      </Link>
    </footer>
  );
}

export default Footer;
