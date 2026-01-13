'use client';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('About');
  usePageTitle(t('about'));

  return (
    <div className="px-8 py-4">
      <h1 className="mb-4 text-2xl font-bold">{t('about')}</h1>

      <div className='p-4 bg-base-100 rounded-default shadow-lg'>
        <p>{t('aboutParagraph1')}</p>

        <p>{t('aboutParagraph2')}</p>
      </div>
    </div>
  );
}
