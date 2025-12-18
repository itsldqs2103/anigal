'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { useLocale, useTranslations } from 'next-intl';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Bowser from 'bowser';

export default function Status() {
  const t = useTranslations('Status');
  const locale = useLocale();

  const [commit, setCommit] = useState(null);

  usePageTitle(t('status'));

  useEffect(() => {
    const fetchLatestCommit = async () => {
      try {
        const { data } = await axios.get(
          'https://api.github.com/repos/itsldqs2103/anigal/commits',
          { params: { per_page: 1 } }
        );

        const latest = data?.[0];
        if (!latest) return;

        setCommit({
          sha: latest.sha,
          url: latest.html_url,
          date: latest.commit.author.date,
        });
      } catch (error) {
        toast.error('Error fetching latest commit', { autoClose: 2500 });
      }
    };

    fetchLatestCommit();
  }, []);

  const updatedAgo = useMemo(() => {
    if (!commit) return '';
    return moment(commit.date).locale(locale).fromNow();
  }, [commit, locale]);

  const browserInfo = useMemo(() => {
    const parser = Bowser.getParser(window.navigator.userAgent);
    const result = parser.getResult();

    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      platform: result.platform.type || 'unknown',
    };
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">{t('status')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-base-100 rounded-default p-4 shadow-lg">
          <p className="text-accent text-lg font-bold">{t('version')}</p>

          {commit ? (
            <>
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-[color]"
              >
                {commit.sha.substring(0, 7)}
              </a>

              {updatedAgo && (
                <p>
                  {t('updated')} {updatedAgo}
                </p>
              )}
            </>
          ) : (
            <span>{t('unknown')}</span>
          )}
        </div>

        <div className="bg-base-100 rounded-default p-4 shadow-lg">
          <p className="text-accent text-lg font-bold">{t('system')}</p>
          <div>
            <div>
              <strong>{t('browser')}:</strong> {browserInfo.browser}
            </div>
            <div>
              <strong>OS:</strong> {browserInfo.os}
            </div>
            <div>
              <strong>{t('platform')}:</strong> {browserInfo.platform}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
