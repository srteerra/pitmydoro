import {
  Alert,
  Avatar,
  Box,
  DataList,
  Flex,
  Grid,
  GridItem,
  Separator,
  Status,
  Text,
} from '@chakra-ui/react';
import { Task } from '@/interfaces/Task.interface';
import React, { useMemo } from 'react';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import { hasDecimalStat, statSeconds } from '@/utils/statSeconds.utils';
import { cardColors } from '@/utils/cardColors.utils';
import { timestampUtils } from '@/utils/timestamp.utils';
import moment from 'moment/min/moment-with-locales';
import { BarSegment, useChart } from '@chakra-ui/charts';
import useSettingsStore from '@/stores/Settings.store';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import { CgCheckO, CgCoffee, CgProfile, CgStopwatch, CgTime } from 'react-icons/cg';
import useUserStore from '@/stores/User.store';
import { useLocale, useTranslations } from 'use-intl';
import { StatsList } from '@/components/Tasks/StatsDialog/StatsList';

interface Props {
  task: Task;
}

export const StatsDialog = ({ task }: Props) => {
  const { theme } = useTheme();
  const locale = useLocale();
  const statsT = useTranslations('stats');
  const pomodoroT = useTranslations('pomodoro');
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const profile = useUserStore((state) => state.profile);

  moment.locale(locale);

  const taskStats = task?.stats;
  const isCorrupted = hasDecimalStat(taskStats);
  const workSeconds = statSeconds(taskStats?.totalWorkTime) ?? 0;
  const breakSeconds = statSeconds(taskStats?.totalBreakTime) ?? 0;
  const pausedSeconds = statSeconds(taskStats?.totalPausedTime) ?? 0;

  const hasData = workSeconds > 0 || breakSeconds > 0 || pausedSeconds > 0;

  const sessionColor = tinycolor(currentScuderia.colors.background.session)
    .darken(theme === 'dark' ? 15 : 10)
    .toString();

  const breakColor = tinycolor(currentScuderia.colors.background.shortBreak)
    .darken(theme === 'dark' ? 15 : 10)
    .toString();

  const pausesColor = tinycolor(currentScuderia.colors.background.longBreak)
    .darken(theme === 'dark' ? 15 : 10)
    .toString();

  const chart = useChart({
    sort: { by: 'value', direction: 'desc' },
    data: [
      {
        name: pomodoroT('sessionLabel'),
        value: workSeconds,
        color: sessionColor,
      },
      {
        name: pomodoroT('shortBreakLabel'),
        value: breakSeconds,
        color: breakColor,
      },
      {
        name: pomodoroT('pausesLabel'),
        value: pausedSeconds,
        color: pausesColor,
      },
    ],
  });

  const isDark = theme === 'dark';

  const durationCards = [
    {
      label: statsT('totalWorKTime'),
      value: formatSeconds(taskStats?.totalWorkTime, 'duration'),
      icon: <CgTime />,
      color: tinycolor(sessionColor).lighten(12).desaturate(30).toString(),
      colSpan: 2,
      testId: 'stat-work-time',
    },
    {
      label: statsT('totalBreakTime'),
      value: formatSeconds(taskStats?.totalBreakTime, 'duration'),
      icon: <CgCoffee />,
      color: tinycolor(breakColor).lighten(12).desaturate(30).toString(),
      colSpan: 1,
      testId: 'stat-break-time',
    },
    {
      label: statsT('totalPausedTime'),
      value: formatSeconds(taskStats?.totalPausedTime, 'duration'),
      icon: <CgStopwatch />,
      color: tinycolor(pausesColor).lighten(12).desaturate(30).toString(),
      colSpan: 1,
      testId: 'stat-paused-time',
    },
  ];

  const otherCards = [
    {
      label: statsT('totalPauses'),
      value: taskStats?.totalPauses || 0,
      testId: 'stat-pauses',
    },
    {
      label: statsT('totalInterruptions'),
      value: taskStats?.totalInterruptions || 0,
      testId: 'stat-interruptions',
    },
  ];

  const stats = useMemo(() => {
    if (!task) return { general: [] };

    return {
      general: [
        {
          label: statsT('lastSession'),
          value: timestampUtils.formatDate(task.stats?.lastSessionAt),
          icon: <CgTime />,
        },
        {
          label: statsT('createdAt'),
          value: timestampUtils.formatDate(task.createdAt),
          icon: <CgTime />,
        },
        {
          label: statsT('isCompleted'),
          value: task?.completedAt
            ? moment(timestampUtils.toMillis(task.completedAt)).fromNow()
            : statsT('notCompleted'),
          icon: <CgCheckO />,
          valueIcon: (
            <Status.Root>
              <Status.Indicator colorPalette={task?.completedAt ? 'green' : 'red'} />
            </Status.Root>
          ),
        },
      ],
    };
  }, [task, statsT]);

  return (
    <Flex flexDirection={'column'} h={'full'}>
      <Flex flexDirection={'column'} flex={1} gap={6}>
        <DataList.Root orientation='horizontal'>
          <DataList.Item>
            <DataList.ItemLabel opacity={0.7} gap={2}>
              <CgProfile /> {statsT('userFrom')}
            </DataList.ItemLabel>
            <DataList.ItemValue display='flex' alignItems='center'>
              <Avatar.Root borderRadius={'full'} size='sm' cursor='pointer'>
                <Avatar.Fallback name='Segun Adebayo' />
                <Avatar.Image
                  src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.username}`}
                  alt='Avatar'
                />
              </Avatar.Root>
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>

        <StatsList items={stats.general} />
        <Separator />

        {isCorrupted && (
          <Alert.Root status='warning' data-pw-id='stats-corrupted-warning'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{statsT('corruptedWarning')}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        )}

        <Grid templateColumns='repeat(2, 1fr)' gap={3}>
          {durationCards.map((card) => {
            const { bg, fg } = cardColors(card.color, isDark);

            return (
              <GridItem key={card.label} colSpan={card.colSpan}>
                <Flex direction='column' gap={2} p={4} h='full' borderRadius='xl' bg={bg}>
                  <Flex align='center' gap={2} color={fg} opacity={0.85}>
                    <Box fontSize='lg' display='flex'>
                      {card.icon}
                    </Box>
                    <Text
                      fontSize='xs'
                      fontWeight='medium'
                      textTransform='uppercase'
                      letterSpacing='wider'
                    >
                      {card.label}
                    </Text>
                  </Flex>
                  <Text fontSize='2xl' fontWeight='bold' color={fg} data-pw-id={card.testId}>
                    {card.value}
                  </Text>
                </Flex>
              </GridItem>
            );
          })}
        </Grid>
        <Separator />
        <Grid templateColumns='repeat(2, 1fr)' gap={3}>
          {otherCards.map((card) => (
            <GridItem key={card.label}>
              <Flex direction='column' gap={1} p={4} h='full' borderRadius='xl' bg={'gray/5'}>
                <Text
                  fontSize='3xl'
                  fontWeight='bold'
                  lineHeight='1'
                  color={'gray'}
                  data-pw-id={card.testId}
                >
                  {card.value}
                </Text>
                <Text
                  fontSize='xs'
                  fontWeight='medium'
                  textTransform='uppercase'
                  letterSpacing='wider'
                  opacity={0.7}
                  color={'gray'}
                >
                  {card.label}
                </Text>
              </Flex>
            </GridItem>
          ))}
        </Grid>
      </Flex>

      {hasData && (
        <Box mb={5}>
          <BarSegment.Root chart={chart} barSize='3'>
            <BarSegment.Content>
              <BarSegment.Bar gap='0.5' />
            </BarSegment.Content>
            <BarSegment.Legend gap='2' textStyle='xs' showPercent />
          </BarSegment.Root>
        </Box>
      )}
    </Flex>
  );
};
