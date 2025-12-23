'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitch from './LocaleSwitch';

export default function TopNav() {
  const pathname = usePathname();
  const locale = useLocale();

  const normalizedPath = pathname.replace(new RegExp(`^/${locale}(/|$)`), '/');

  const isActive = href =>
    normalizedPath === href || normalizedPath.startsWith(`${href}/`);

  const linkClass = href =>
    `btn ${isActive(href) ? 'btn-primary' : 'btn-ghost'}`;

  const t = useTranslations('Navigation');

  return (
    <div className="bg-base-100 rounded-default mx-4 mt-4 shadow-lg">
      <div className="navbar px-4">
        <div className="navbar-start">
          <Link className="text-4xl font-bold" href="/">
            A<span className="text-accent">G</span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2">
            <li>
              <Link href="/" className={linkClass('/')}>
                {t('home')}
              </Link>
            </li>
            <li>
              <Link href="/manage" className={linkClass('/manage')}>
                {t('manage')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end flex items-center gap-2">
          <div className="hidden lg:flex">
            <LocaleSwitch />
          </div>

          <label
            htmlFor="mobile-nav"
            className="btn btn-square btn-ghost flex lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </label>
        </div>
      </div>

      <div className="lg:hidden">
        <input type="checkbox" id="mobile-nav" className="peer hidden" />
        <div className="bg-base-100 peer-checked:collapse-open collapse">
          <div className="collapse-content px-4">
            <ul className="menu menu-vertical w-full gap-2">
              <li>
                <Link href="/" className={linkClass('/')}>
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/manage" className={linkClass('/manage')}>
                  {t('manage')}
                </Link>
              </li>
              <li>
                <LocaleSwitch customClass="btn btn-ghost" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
