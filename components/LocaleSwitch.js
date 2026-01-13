'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import { Link } from '@/i18n/navigation';

const LOCALES = {
  en: { next: 'vi', flag: 'fi-us' },
  vi: { next: 'en', flag: 'fi-vn' },
};

export default function LocaleSwitch({ customClass }) {
  const pathname = usePathname();
  const locale = useLocale();

  const targetPath = getParentPath(pathname, locale);
  const { next, flag } = LOCALES[locale];

  return (
    <Link
      href={targetPath}
      locale={next}
      className={customClass}
    >
      <span className={`fi ${flag}`} />
    </Link>
  );
}

function getParentPath(pathname = '/', locale) {
  const segments = pathname.split('/').filter(Boolean);

  const withoutLocale =
    segments[0] === locale ? segments.slice(1) : segments;

  if (withoutLocale.length === 0) return '/';

  return `/${withoutLocale[0]}`;
}
