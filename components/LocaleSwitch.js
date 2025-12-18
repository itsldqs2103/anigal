'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import { Link } from '@/i18n/navigation';

export default function LocaleSwitch({ customClass }) {
  const pathname = usePathname();
  const locale = useLocale();

  const segments = pathname?.split('/').filter(Boolean) || [];

  const segmentsWithoutLocale =
    segments[0] === locale ? segments.slice(1) : segments;

  const parentPath =
    segmentsWithoutLocale.length > 1
      ? `/${segmentsWithoutLocale[0]}`
      : segmentsWithoutLocale.length === 1
        ? `/${segmentsWithoutLocale[0]}`
        : '/';

  return (
    <>
      {locale === 'en' ? (

        <Link href={parentPath} locale="vi" className={customClass}>
          <span className="fi fi-us"></span>
        </Link>
      ) : (
        <Link href={parentPath} locale="en" className={customClass}>
          <span className="fi fi-vn"></span>
        </Link>
      )}
    </>
  );
}
