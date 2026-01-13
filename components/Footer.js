'use client';

import { useTranslations } from 'next-intl';
import { CopyrightIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('Footer');
  const year = getCurrentYear();

  const links = [
    { href: '/about', label: t('about') },
  ];

  return (
    <footer className="bg-base-100 rounded-default mx-4 mb-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Copyright
          year={year}
          text={t('allrightsreserved')}
        />

        <FooterLinks links={links} />
      </div>
    </footer>
  );
}

function Copyright({ year, text }) {
  return (
    <div className="flex items-center gap-1">
      <CopyrightIcon className="h-4 w-4" />
      <span>
        {year} AniGal. {text}
      </span>
    </div>
  );
}

function FooterLinks({ links }) {
  return (
    <nav className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-4">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className="transition hover:text-accent"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function getCurrentYear() {
  return new Date().getFullYear();
}
