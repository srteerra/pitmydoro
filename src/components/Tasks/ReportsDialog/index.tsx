import { Box, Flex, Grid, GridItem, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { CgCoffee, CgStopwatch, CgTime } from 'react-icons/cg';
import { useAuth } from '@/contexts/AuthContext';
import useSettingsStore from '@/stores/Settings.store';
import { statsService } from '@/services/stats.service';
import { DailyStats } from '@/interfaces/Stats.interface';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import { cardColors, chartShade } from '@/utils/cardColors.utils';
import { fetchRange, periodRange, ReportPeriod, sumTotals } from '@/utils/statsReport.utils';
import { SegmentedControl } from '@/components/ui/segmented-control';

const PERIODS: ReportPeriod[] = ['day', 'week', 'month', 'year'];

export const ReportsDialog = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const reportsT = useTranslations('reports');
  const statsT = useTranslations('stats');
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);

  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [data, setData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';
  const sessionColor = chartShade(currentScuderia.colors.background.session, isDark);
  const breakColor = chartShade(currentScuderia.colors.background.shortBreak, isDark);
  const pausesColor = chartShade(currentScuderia.colors.background.longBreak, isDark);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { from, to } = fetchRange();
      const stats = await statsService.getDailyStatsRange(user.uid, from, to);
      setData(stats);
      setLoading(false);
    };

    void load();
  }, [user]);

  const totals = useMemo(() => {
    const { from, to } = periodRange(period);
    return sumTotals(data, from, to);
  }, [data, period]);

  const cards = [
    {
      label: statsT('totalWorKTime'),
      value: formatSeconds(totals.workTime, 'duration'),
      icon: <CgTime />,
      color: tinycolor(sessionColor).lighten(12).desaturate(30).toString(),
      colSpan: 2,
    },
    {
      label: statsT('totalBreakTime'),
      value: formatSeconds(totals.breakTime, 'duration'),
      icon: <CgCoffee />,
      color: tinycolor(breakColor).lighten(12).desaturate(30).toString(),
      colSpan: 1,
    },
    {
      label: statsT('totalPausedTime'),
      value: formatSeconds(totals.pausedTime, 'duration'),
      icon: <CgStopwatch />,
      color: tinycolor(pausesColor).lighten(12).desaturate(30).toString(),
      colSpan: 1,
    },
  ];

  if (loading) {
    return (
      <Flex justify='center' align='center' minH='12rem'>
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex direction='column' gap={{ base: 4, md: 6 }} w='full' maxW='full' overflowX='hidden'>
      <Text fontSize='sm' color='gray' opacity={0.8}>
        {reportsT('description')}
      </Text>

      <SegmentedControl
        size='sm'
        value={period}
        onValueChange={(e) => setPeriod(e.value as ReportPeriod)}
        activeBgColor={tinycolor(sessionColor).darken(42).desaturate(30).toString()}
        isActive={period}
        alignSelf='center'
        bg='transparent'
        border='none'
        shadow='none'
        p={0}
        items={PERIODS.map((value) => ({ value, label: reportsT(value) }))}
      />

      <Grid templateColumns='repeat(2, 1fr)' gap={{ base: 2, md: 3 }}>
        <GridItem colSpan={2} minW={0}>
          <Flex
            direction='column'
            gap={1}
            p={{ base: 3, md: 4 }}
            borderRadius='xl'
            bg='gray/5'
            align='center'
          >
            <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight='bold' lineHeight='1'>
              {totals.pomodoros}
            </Text>
            <Text
              fontSize='2xs'
              fontWeight='medium'
              textTransform='uppercase'
              letterSpacing='wider'
              opacity={0.7}
            >
              {statsT('totalPomodoros')}
            </Text>
          </Flex>
        </GridItem>

        {cards.map((card) => {
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
                <Flex align='center' gap={2} color={fg} opacity={0.85}>
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
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='bold' color={fg}>
                  {card.value}
                </Text>
              </Flex>
            </GridItem>
          );
        })}
      </Grid>

      <Flex
        align='center'
        justify='center'
        p={{ base: 4, md: 6 }}
        borderRadius='xl'
        borderWidth='1px'
        borderStyle='dashed'
        borderColor='gray/30'
        color='gray'
        opacity={0.6}
      >
        <Text fontSize='sm' fontWeight='medium' letterSpacing='wider'>
          {reportsT('comingSoon')}
        </Text>
      </Flex>
    </Flex>
  );
};
