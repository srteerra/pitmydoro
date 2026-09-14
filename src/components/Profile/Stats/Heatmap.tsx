'use client';

import React, { useMemo } from 'react';
import { Box, Flex, Grid, HStack, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import moment from 'moment/min/moment-with-locales';
import tinycolor from 'tinycolor2';
import { Tooltip } from '@/components/ui/tooltip';
import { DailyStats } from '@/interfaces/Stats.interface';
import { buildHeatmap } from '@/utils/statsHeatmap.utils';
import { formatSeconds } from '@/utils/formatSeconds.utils';

interface Props {
  stats: DailyStats[];
  from: string;
  to: string;
  accent: string;
}

const MIN_CELL = { base: '8px', md: '11px' };
const GAP = '3px';
const MONTHS_ROW = '16px';
const WEEKDAY_LABELS = [0, 2, 4];
const LEVEL_RATIOS = { light: [28, 50, 74, 100], dark: [40, 60, 80, 100] };

export const StatsHeatmap = ({ stats, from, to, accent }: Props) => {
  const t = useTranslations('profile');
  const locale = useLocale();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  moment.locale(locale);

  const { weeks, months, total } = useMemo(() => buildHeatmap(stats, from, to), [stats, from, to]);

  const templateColumns = useMemo(
    () => ({
      base: `repeat(${weeks.length}, minmax(${MIN_CELL.base}, 1fr))`,
      md: `repeat(${weeks.length}, minmax(${MIN_CELL.md}, 1fr))`,
    }),
    [weeks.length]
  );

  const monthSpans = useMemo(
    () =>
      months.map((month, index) => ({
        ...month,
        span: (months[index + 1]?.weekIndex ?? weeks.length) - month.weekIndex,
      })),
    [months, weeks.length]
  );

  const scale = useMemo(() => {
    const empty = isDark ? '#2B2B31' : '#E4E7EC';
    const base = tinycolor(accent).isValid() ? tinycolor(accent) : tinycolor('#8A94A6');
    const strong = isDark ? base.clone().brighten(6).saturate(12) : base.clone().darken(6);
    const mixBase = isDark ? empty : '#FFFFFF';

    return [
      empty,
      ...LEVEL_RATIOS[isDark ? 'dark' : 'light'].map((ratio) =>
        tinycolor.mix(mixBase, strong, ratio).toHexString()
      ),
    ];
  }, [accent, isDark]);

  const weekdayNames = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        moment()
          .locale(locale)
          .isoWeekday(index + 1)
          .format('ddd')
      ),
    [locale]
  );

  return (
    <Box data-pw-id='profile-heatmap' mt={8}>
      <Flex justify='space-between' align='baseline' gap={3} mb={4} wrap='wrap'>
        <Text fontSize='xs' color='fg.muted'>
          {t('heatmapSummary', { count: total })}
        </Text>
      </Flex>

      <Box overflowX='auto' pb={2}>
        <Flex gap={GAP} align='stretch'>
          <Flex direction='column' flexShrink={0} pr={1}>
            <Box h={MONTHS_ROW} />
            <Grid flex='1' templateRows='repeat(7, 1fr)' gap={GAP}>
              {weekdayNames.map((name, index) => (
                <Flex key={name} align='center'>
                  <Text fontSize='2xs' color='fg.muted' lineHeight='1'>
                    {WEEKDAY_LABELS.includes(index) ? name : ''}
                  </Text>
                </Flex>
              ))}
            </Grid>
          </Flex>

          <Box flex='1'>
            <Grid templateColumns={templateColumns} gap={GAP} h={MONTHS_ROW}>
              {monthSpans.map((month) => (
                <Text
                  key={month.key}
                  gridColumn={`${month.weekIndex + 1} / span ${month.span}`}
                  fontSize='2xs'
                  color='fg.muted'
                  lineHeight='1'
                  truncate
                >
                  {month.label}
                </Text>
              ))}
            </Grid>

            <Grid templateColumns={templateColumns} gap={GAP}>
              {weeks.map((week) => (
                <Flex key={week.key} direction='column' gap={GAP}>
                  {week.days.map((day) => {
                    if (day.isFuture) {
                      return <Box key={day.date} w='full' aspectRatio='1' />;
                    }

                    return (
                      <Tooltip
                        key={day.date}
                        openDelay={60}
                        closeDelay={60}
                        content={t('heatmapTooltip', {
                          count: day.pomodoros,
                          time: formatSeconds(day.pomodoroTime, 'duration'),
                          date: moment(day.date, 'YYYY-MM-DD').format('LL'),
                        })}
                      >
                        <Box
                          data-pw-id='profile-heatmap-day'
                          data-date={day.date}
                          data-level={day.level}
                          w='full'
                          aspectRatio='1'
                          borderRadius='2px'
                          bg={scale[day.level]}
                          cursor='default'
                          transition='transform 0.1s ease'
                          _hover={{ transform: 'scale(1.25)' }}
                        />
                      </Tooltip>
                    );
                  })}
                </Flex>
              ))}
            </Grid>
          </Box>
        </Flex>
      </Box>

      <HStack gap={1.5} justify='flex-end' mt={1}>
        <Text fontSize='2xs' color='fg.muted'>
          {t('heatmapLess')}
        </Text>
        {scale.map((color, level) => (
          <Box key={level} boxSize='11px' borderRadius='2px' bg={color} />
        ))}
        <Text fontSize='2xs' color='fg.muted'>
          {t('heatmapMore')}
        </Text>
      </HStack>
    </Box>
  );
};
