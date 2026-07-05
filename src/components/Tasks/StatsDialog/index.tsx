import {
  Alert,
  Avatar,
  Badge,
  Box,
  DataList,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Separator,
  Status,
  Text,
} from '@chakra-ui/react';
import { Task } from '@/interfaces/Task.interface';
import React, { useMemo } from 'react';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import { hasDecimalStat, statSeconds } from '@/utils/statSeconds.utils';
import { cardColors, chartShade } from '@/utils/cardColors.utils';
import { timestampUtils } from '@/utils/timestamp.utils';
import moment from 'moment/min/moment-with-locales';
import { BarSegment, Chart, useChart } from '@chakra-ui/charts';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import useSettingsStore from '@/stores/Settings.store';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import { CgCheckO, CgCoffee, CgProfile, CgStopwatch, CgTime } from 'react-icons/cg';
import { LuHash } from 'react-icons/lu';
import useUserStore from '@/stores/User.store';
import { useLocale, useTranslations } from 'use-intl';
import { StatsList } from '@/components/Tasks/StatsDialog/StatsList';
import { ExpandableText } from '@/components/Tasks/StatsDialog/ExpandableText';
import { HelpTip } from '@/components/ui/help-tip';
import { ToggleTip } from '@/components/ui/toggle-tip';

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

  const isDark = theme === 'dark';

  const sessionColor = chartShade(currentScuderia.colors.background.session, isDark);
  const breakColor = chartShade(currentScuderia.colors.background.shortBreak, isDark);
  const pausesColor = chartShade(currentScuderia.colors.background.longBreak, isDark);

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

  const pomodoros = taskStats?.pomodoros ?? [];

  const areaChart = useChart({
    data: pomodoros.map((p) => ({
      label: `#${p.index}`,
      work: p.workTime,
      paused: p.pausedTime,
    })),
    series: [
      { name: 'work', label: pomodoroT('sessionLabel'), color: sessionColor },
      { name: 'paused', label: pomodoroT('pausesLabel'), color: pausesColor },
    ],
  });

  const durationCards = [
    {
      label: statsT('totalWorKTime'),
      value: formatSeconds(taskStats?.totalWorkTime, 'duration'),
      icon: <CgTime />,
      color: tinycolor(sessionColor).lighten(12).desaturate(30).toString(),
      colSpan: 2,
      testId: 'stat-work-time',
      info: statsT('workTimeInfo'),
    },
    {
      label: statsT('totalBreakTime'),
      value: formatSeconds(taskStats?.totalBreakTime, 'duration'),
      icon: <CgCoffee />,
      color: tinycolor(breakColor).lighten(12).desaturate(30).toString(),
      colSpan: 1,
      testId: 'stat-break-time',
      info: undefined as string | undefined,
    },
    {
      label: statsT('totalPausedTime'),
      value: formatSeconds(taskStats?.totalPausedTime, 'duration'),
      icon: <CgStopwatch />,
      color: tinycolor(pausesColor).lighten(12).desaturate(30).toString(),
      colSpan: 1,
      testId: 'stat-paused-time',
      info: statsT('pausedTimeInfo'),
    },
  ];

  const otherCards = [
    {
      label: statsT('totalPauses'),
      value: taskStats?.totalPauses || 0,
      testId: 'stat-pauses',
      info: undefined as string | undefined,
    },
    {
      label: statsT('totalInterruptions'),
      value: taskStats?.totalInterruptions || 0,
      info: statsT('interruptionsInfo'),
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
              <Status.Indicator bg={task?.completedAt ? 'success.fg' : 'danger.fg'} />
            </Status.Root>
          ),
        },
        {
          label: statsT('totalPomodoros'),
          value: (
            <Badge variant='surface' colorPalette='gray'>
              {task?.totalPomodoros ?? 0} / {task?.estimatedPomodoros ?? 0}
            </Badge>
          ),
          icon: <CgStopwatch />,
        },
      ],
    };
  }, [task, statsT]);

  return (
    <Flex flexDirection={'column'} minH={'full'} w={'full'} maxW={'full'} overflowX={'hidden'}>
      <Flex flexDirection={'column'} flex={1} gap={{ base: 4, md: 6 }}>
        <Box>
          <HStack align='center' gap={2} mb={4}>
            <Text
              textTransform={'capitalize'}
              fontSize='lg'
              fontWeight='bold'
              wordBreak='break-word'
            >
              {task?.title}
            </Text>

            <ToggleTip
              content={
                <Text fontFamily='mono' fontSize='xs'>
                  {task?.id}
                </Text>
              }
            >
              <IconButton
                variant='ghost'
                size='2xs'
                color={'gray.500'}
                aria-label='Task ID'
                flexShrink={0}
              >
                <LuHash />
              </IconButton>
            </ToggleTip>
          </HStack>

          {task?.description && <ExpandableText text={task.description} />}
        </Box>

        <DataList.Root orientation='horizontal'>
          <DataList.Item>
            <DataList.ItemLabel opacity={0.7} gap={2}>
              <CgProfile /> {statsT('userFrom')}
            </DataList.ItemLabel>
            <DataList.ItemValue display='flex' alignItems='center'>
              <Avatar.Root borderRadius={'full'} size='sm' cursor='pointer'>
                <Avatar.Fallback name={profile?.username} />
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

        <Grid templateColumns='repeat(2, 1fr)' gap={{ base: 2, md: 3 }}>
          {durationCards.map((card) => {
            const { bg, fg } = cardColors(card.color, isDark);

            return (
              <GridItem key={card.label} colSpan={card.colSpan} minW={0}>
                <Flex
                  direction='column'
                  gap={2}
                  p={{ base: 3, md: 4 }}
                  h='full'
                  borderRadius='xl'
                  bg={bg}
                >
                  <Flex align='center' gap={2} color={fg} opacity={0.85} justify='space-between'>
                    <Flex align='center' gap={2} minW={0}>
                      <Box fontSize='lg' display='flex'>
                        {card.icon}
                      </Box>
                      <Text
                        fontSize='2xs'
                        fontWeight='medium'
                        textTransform='uppercase'
                        letterSpacing='wider'
                        lineClamp={1}
                      >
                        {card.label}
                      </Text>
                    </Flex>
                    {card.info && <HelpTip content={card.info} placement='left' />}
                  </Flex>
                  <Text
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight='bold'
                    lineHeight='1.2'
                    color={fg}
                    data-pw-id={card.testId}
                  >
                    {card.value}
                  </Text>
                </Flex>
              </GridItem>
            );
          })}
        </Grid>

        {hasData && (
          <BarSegment.Root chart={chart} barSize='3'>
            <BarSegment.Content>
              <BarSegment.Bar gap='0.5' />
            </BarSegment.Content>
            <BarSegment.Legend gap='2' textStyle='xs' showPercent />
          </BarSegment.Root>
        )}

        <Separator />
        <Grid templateColumns='repeat(2, 1fr)' gap={{ base: 2, md: 3 }}>
          {otherCards.map((card) => (
            <GridItem key={card.label} minW={0}>
              <Flex
                direction='column'
                gap={1}
                p={{ base: 3, md: 4 }}
                h='full'
                borderRadius='xl'
                bg={'gray/5'}
                position='relative'
              >
                {card.info && (
                  <Box position='absolute' top={4} right={4} color='gray'>
                    <HelpTip content={card.info} placement='left' />
                  </Box>
                )}
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight='bold'
                  lineHeight='1'
                  color={'gray'}
                  data-pw-id={card.testId}
                >
                  {card.value}
                </Text>
                <Text
                  fontSize='2xs'
                  fontWeight='medium'
                  textTransform='uppercase'
                  letterSpacing='wider'
                  opacity={0.7}
                  color={'gray'}
                  lineClamp={1}
                >
                  {card.label}
                </Text>
              </Flex>
            </GridItem>
          ))}
        </Grid>

        {isCorrupted && (
          <Alert.Root status='warning' data-pw-id='stats-corrupted-warning'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{statsT('corruptedWarning')}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        )}
      </Flex>

      {pomodoros.length > 0 && (
        <HStack gap={3} my={4} color='gray' opacity={0.7}>
          <Separator flex='1' />
          <Text
            fontSize='2xs'
            fontWeight='medium'
            textTransform='uppercase'
            letterSpacing='wider'
            whiteSpace='nowrap'
          >
            {statsT('pomodorosActivity')}
          </Text>
          <Separator flex='1' />
        </HStack>
      )}

      {pomodoros.length > 0 && (
        <Box mb={5} w='full' overflow='hidden' borderBottomRadius='3xl'>
          <Chart.Root maxH={{ base: '7rem', md: '10rem' }} chart={areaChart}>
            <AreaChart data={areaChart.data}>
              <CartesianGrid stroke={areaChart.color('border.muted')} vertical={false} />
              <XAxis dataKey={areaChart.key('label')} hide />
              <Tooltip
                animationDuration={100}
                cursor={false}
                content={
                  <Chart.Tooltip
                    formatter={(value, name) => [
                      formatSeconds(Math.floor(Number(value)), 'duration'),
                      name,
                    ]}
                  />
                }
              />
              {areaChart.series.map((item) => (
                <Area
                  key={item.name}
                  type='monotone'
                  name={String(item.label)}
                  isAnimationActive={false}
                  dataKey={areaChart.key(item.name)}
                  fill={item.color}
                  fillOpacity={0.2}
                  stroke={item.color}
                  stackId='a'
                />
              ))}
              <Legend verticalAlign='bottom' content={<Chart.Legend />} />
            </AreaChart>
          </Chart.Root>
        </Box>
      )}
    </Flex>
  );
};
