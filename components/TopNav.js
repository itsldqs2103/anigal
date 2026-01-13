'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import LocaleSwitch from './LocaleSwitch';

export default function TopNav() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const locale = useLocale();

  const normalizedPath = removeLocalePrefix(pathname, locale);

  const isActive = href =>
    normalizedPath === href || normalizedPath.startsWith(`${href}/`);

  const linkClass = href =>
    `btn ${isActive(href) ? 'btn-primary' : 'btn-ghost'}`;

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/manage', label: t('manage') },
  ];

  return (
    <div className="bg-base-100 rounded-default mx-4 mt-4 shadow-lg">
      <Navbar
        links={navLinks}
        linkClass={linkClass}
      />

      <MobileMenu
        links={navLinks}
        linkClass={linkClass}
      />
    </div>
  );
}

function Navbar({ links, linkClass }) {
  return (
    <div className="navbar px-4">
      <Brand />

      <DesktopNav links={links} linkClass={linkClass} />

      <NavbarActions />
    </div>
  );
}

function Brand() {
  return (
    <div className="navbar-start">
      <Link className="text-3xl font-black" href="/">
        A<span className="text-accent">G</span>
      </Link>
    </div>
  );
}

function DesktopNav({ links, linkClass }) {
  return (
    <div className="navbar-center hidden lg:flex">
      <ul className="menu menu-horizontal gap-2">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavbarActions() {
  return (
    <div className="navbar-end flex items-center gap-2">
      <div className="hidden lg:flex">
        <LocaleSwitch />
      </div>

      <MobileToggle />
    </div>
  );
}

function MobileToggle() {
  return (
    <label
      htmlFor="mobile-nav"
      className="btn btn-square btn-ghost flex lg:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-4 w-4" />
    </label>
  );
}

function MobileMenu({ links, linkClass }) {
  return (
    <div className="lg:hidden">
      <input
        type="checkbox"
        id="mobile-nav"
        className="peer hidden"
      />

      <div className="bg-base-100 peer-checked:collapse-open collapse">
        <div className="collapse-content px-4">
          <ul className="menu menu-vertical w-full gap-2">
            {links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <LocaleSwitch customClass="btn btn-ghost" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function removeLocalePrefix(pathname, locale) {
  return pathname.replace(
    new RegExp(`^/${locale}(/|$)`),
    '/'
  );
}
