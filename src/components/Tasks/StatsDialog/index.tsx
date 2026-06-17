import { Avatar, Box, DataList, Flex, Separator, Status } from '@chakra-ui/react';
import { InfoTip } from '@/components/ui/toggle-tip';
import { Task } from '@/interfaces/Task.interface';
import React, { JSX, useMemo } from 'react';
import { formatMs } from '@/utils/formatMs.utils';
import { toMillis } from '@/utils/timestamp.utils';
import moment from 'moment/min/moment-with-locales';
import { formatMinutes } from '@/utils/formatMinutes.utils';
import { BarSegment, useChart } from '@chakra-ui/charts';
import useSettingsStore from '@/stores/Settings.store';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import {
  CgCheckO,
  CgCloseO,
  CgCoffee,
  CgPlayPauseO,
  CgProfile,
  CgStopwatch,
  CgTime,
} from 'react-icons/cg';
import useUserStore from '@/stores/User.store';
import { useLocale, useTranslations } from 'use-intl';

interface Props {
  task: Task;
}

interface StatItem {
  label: string;
  value: number | string;
  info?: string;
  icon?: JSX.Element;
  valueIcon?: JSX.Element;
}

const formatDate = (timestamp: unknown) => {
  const ms = toMillis(timestamp);
  return ms ? moment(ms).format('DD/MM/YYYY hh:mm A') : '—';
};

export const StatsDialog = ({ task }: Props) => {
  const { theme } = useTheme();
  const locale = useLocale();
  const statsT = useTranslations('stats');
  const pomodoroT = useTranslations('pomodoro');
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const profile = useUserStore((state) => state.profile);

  moment.locale(locale);

  const hasData =
    (task?.stats?.totalWorkTime || 0) > 0 ||
    (task?.stats?.totalBreakTime || 0) > 0 ||
    (task?.stats?.totalPausedTime || 0) > 0;

  const chart = useChart({
    sort: { by: 'value', direction: 'desc' },
    data: [
      {
        name: pomodoroT('sessionLabel'),
        value: (task?.stats?.totalWorkTime || 0) * 60_000,
        color: tinycolor(currentScuderia.colors.background.session)
          .darken(theme === 'dark' ? 15 : 10)
          .toString(),
      },
      {
        name: pomodoroT('shortBreakLabel'),
        value: (task?.stats?.totalBreakTime || 0) * 60_000,
        color: tinycolor(currentScuderia.colors.background.shortBreak)
          .darken(theme === 'dark' ? 15 : 10)
          .toString(),
      },
      {
        name: pomodoroT('pausesLabel'),
        value: task?.stats?.totalPausedTime || 0,
        color: tinycolor(currentScuderia.colors.background.longBreak)
          .darken(theme === 'dark' ? 15 : 10)
          .toString(),
      },
    ],
  });

  const stats = useMemo(() => {
    if (!task) return { general: [], durations: [], other: [] };

    return {
      general: [
        {
          label: statsT('lastSession'),
          value: formatDate(task.stats?.lastSessionAt),
          icon: <CgTime />,
        },
        {
          label: statsT('createdAt'),
          value: formatDate(task.createdAt),
          icon: <CgTime />,
        },
        {
          label: statsT('isCompleted'),
          value: task?.completedAt
            ? moment(toMillis(task.completedAt)).fromNow()
            : statsT('notCompleted'),
          icon: <CgCheckO />,
          valueIcon: (
            <Status.Root>
              <Status.Indicator colorPalette={task?.completedAt ? 'green' : 'red'} />
            </Status.Root>
          ),
        },
      ],
      durations: [
        {
          label: statsT('totalWorKTime'),
          value: formatMinutes(task.stats?.totalWorkTime || 0),
          icon: <CgTime />,
        },
        {
          label: statsT('totalBreakTime'),
          value: formatMinutes(task.stats?.totalBreakTime || 0),
          icon: <CgCoffee />,
        },
        {
          label: statsT('totalPausedTime'),
          value: formatMs(task.stats?.totalPausedTime || 0, 'human'),
          icon: <CgStopwatch />,
        },
      ],
      other: [
        {
          label: statsT('totalPauses'),
          value: task.stats?.totalPauses || 0,
          icon: <CgPlayPauseO />,
        },
        {
          label: statsT('totalInterruptions'),
          value: task.stats?.totalInterruptions || 0,
          icon: <CgCloseO />,
        },
      ],
    };
  }, [task, statsT]);

  const StatsList = ({ items }: { items: StatItem[] }) => (
    <DataList.Root orientation='horizontal'>
      {items.map((item) => (
        <DataList.Item key={item.label}>
          <DataList.ItemLabel opacity={0.7} gap={2}>
            {item.icon} {item.label}
          </DataList.ItemLabel>
          <DataList.ItemValue display='flex' gap={3} alignItems='center'>
            {item.valueIcon && item.valueIcon}
            {item.value}
            {item.info && <InfoTip>{item.info}</InfoTip>}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );

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
        <StatsList items={stats.durations} />
        <Separator />
        <StatsList items={stats.other} />
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
