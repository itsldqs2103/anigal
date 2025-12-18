'use client';
import axios from 'axios';
import moment from 'moment';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function Footer() {
  const [commitId, setCommitId] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [updatedAgo, setUpdatedAgo] = useState('');
  const t = useTranslations('Footer');
  const locale = useLocale();

  useEffect(() => {
    const fetchLatestCommit = async () => {
      try {
        const response = await axios.get(
          'https://api.github.com/repos/itsldqs2103/anigal/commits'
        );

        const latestCommit = response.data?.[0];
        if (latestCommit) {
          setCommitId(latestCommit.sha.substring(0, 7));
          setCommitUrl(latestCommit.html_url);
          setUpdatedAgo(
            moment(latestCommit.commit.author.date).locale(locale).fromNow()
          );
        }
      } catch {
        toast.error('Error fetching latest commit', {
          autoClose: 2500,
        });
      }
    };

    fetchLatestCommit();
  }, [locale]);

  return (
    <footer className="px-4 pb-4 text-end">
      {t('version')}:{' '}
      <a
        href={commitUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-[color]"
      >
        {commitId || t('unknown')}
      </a>{' '}
      {updatedAgo && `(${t('updated')} ${updatedAgo})`}
    </footer>
  );
}

export default Footer;
