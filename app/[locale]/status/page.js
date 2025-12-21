'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { useLocale, useTranslations } from 'next-intl';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const STATUS = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  OUTAGE: 'outage',
};

const getStatusStyles = t => ({
  operational: {
    label: t('statusLabels.operational'),
    color: 'text-success',
    dot: 'status-success',
  },
  degraded: {
    label: t('statusLabels.degraded'),
    color: 'text-warning',
    dot: 'status-warning',
  },
  outage: {
    label: t('statusLabels.outage'),
    color: 'text-error',
    dot: 'status-error',
  },
});

export default function Status() {
  const t = useTranslations('Status');
  const locale = useLocale();

  const [commit, setCommit] = useState(null);
  const [systemStatus, setSystemStatus] = useState(STATUS.OPERATIONAL);
  const [latency, setLatency] = useState(null);

  usePageTitle(t('status'));

  const statusStyles = useMemo(() => getStatusStyles(t), [t]);
  const status = statusStyles[systemStatus];

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
      } catch {
        toast.error(t('errors.fetchCommit'), { autoClose: 2500 });
      }
    };

    fetchLatestCommit();
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const getStatusFromLatency = latency => {
      if (latency < 800) return STATUS.OPERATIONAL;
      if (latency < 2000) return STATUS.DEGRADED;
      return STATUS.OUTAGE;
    };

    const checkHealth = async () => {
      const start = performance.now();

      try {
        await axios.get('/api/health', { timeout: 5000 });

        const duration = Math.round(performance.now() - start);
        const nextStatus = getStatusFromLatency(duration);

        if (!isMounted) return;

        setLatency(duration);
        setSystemStatus(nextStatus);
      } catch {
        if (!isMounted) return;

        setLatency(null);
        setSystemStatus(STATUS.OUTAGE);
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const updatedAgo = useMemo(() => {
    if (!commit) return '';
    return moment(commit.date).locale(locale).fromNow();
  }, [commit, locale]);

  return (
    <div className="p-4">
      <div className="space-y-4">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{t('publicTitle')}</h1>
            <p>{t('publicSubtitle')}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatusCard
            title={t('application')}
            status={status}
            description={t('appDescription')}
          />

          <StatusCard
            title={t('apiStatus')}
            status={status}
            description={
              latency ? t('latencyValue', { ms: latency }) : t('latencyUnknown')
            }
          />
        </div>

        <div className="bg-base-100 rounded-default p-4 shadow-lg">
          <p className="text-lg font-bold">{t('version')}</p>

          {commit ? (
            <>
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent font-mono transition-[color]"
              >
                {commit.sha.substring(0, 7)}
              </a>

              <p>
                {t('updated')} {updatedAgo}
              </p>
            </>
          ) : (
            <span>{t('unknown')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, status, description }) {
  return (
    <div className="bg-base-100 rounded-default p-4 shadow-lg md:items-center lg:flex lg:justify-between">
      <div>
        <p className="text-lg font-bold">{title}</p>
        <p>{description}</p>
      </div>

      <div className="flex items-center gap-1">
        <span className={`status ${status.dot} animate-pulse`} />
        <span className={status.color}>{status.label}</span>
      </div>
    </div>
  );
}
