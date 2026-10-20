'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import tinycolor from 'tinycolor2';
import { LeaderboardSnapshot } from '@/interfaces/Leaderboard.interface';
import { timestampUtils } from '@/utils/timestamp.utils';
import { relativeTime } from '@/utils/relativeTime.utils';
import { HelpTip } from '@/components/ui/help-tip';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';

const nextRefreshAt = (): Date => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
};

const msUntilNextRefresh = (): number => nextRefreshAt().getTime() - Date.now();

const formatUtcSchedule = (locale: string, date: Date): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);

const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, '0')).join(':');
};

const NextRefresh = () => {
  const t = useTranslations('leaderboard');
  const locale = useLocale();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(msUntilNextRefresh());

    const interval = setInterval(() => setRemaining(msUntilNextRefresh()), 1000);

    return () => clearInterval(interval);
  }, []);

  if (remaining === null) return null;

  return (
    <HStack gap={0.5}>
      <Text data-pw-id='leaderboard-next-refresh'>
        {t('nextRefresh', { time: formatCountdown(remaining) })}
      </Text>
      <HelpTip
        placement='top'
        label={t('nextRefreshHelp')}
        content={t('nextRefreshSchedule', { time: formatUtcSchedule(locale, nextRefreshAt()) })}
      />
    </HStack>
  );
};

const usePeriodBadgeColors = () => {
  const { theme } = useTheme();
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);

  return useMemo(() => {
    const base =
      theme === 'dark'
        ? tinycolor(currentScuderia?.colors?.primary?.default)
        : tinycolor(currentScuderia?.colors?.background?.[sessionStatus]);

    return {
      bg: base
        .darken(5)
        .brighten(theme === 'dark' ? 0 : -4)
        .toString(),
      color: theme === 'dark' ? 'dark.200' : 'light',
    };
  }, [theme, sessionStatus, currentScuderia]);
};

const formatPeriod = (locale: string, snapshot: LeaderboardSnapshot): string => {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

  return `${formatter.format(new Date(`${snapshot.from}T00:00:00Z`))} – ${formatter.format(
    new Date(`${snapshot.to}T00:00:00Z`)
  )}`;
};

interface PeriodPanelProps {
  snapshot: LeaderboardSnapshot;
  children: React.ReactNode;
}

export const PeriodPanel = ({ snapshot, children }: PeriodPanelProps) => {
  const t = useTranslations('leaderboard');
  const locale = useLocale();

  const updated = relativeTime(locale, timestampUtils.toMillis(snapshot.computedAt));
  const badgeColors = usePeriodBadgeColors();

  return (
    <VStack align='stretch' gap={0}>
      <Flex
        gap={3}
        wrap='wrap'
        align='center'
        justify='space-between'
        color='fg.muted'
        fontSize='sm'
      >
        <HStack gap={3} wrap='wrap'>
          <Badge
            data-pw-id='leaderboard-period'
            bg={badgeColors.bg}
            color={badgeColors.color}
            rounded='md'
            px={2.5}
            py={1}
            fontWeight='semibold'
          >
            {formatPeriod(locale, snapshot)}
          </Badge>
          {updated && <Text>{t('updated', { time: updated })}</Text>}
          {snapshot.sealed && (
            <Badge colorPalette='green' variant='subtle'>
              {t('sealed')}
            </Badge>
          )}
        </HStack>

        {!snapshot.sealed && <NextRefresh />}
      </Flex>

      {children}
    </VStack>
  );
};
