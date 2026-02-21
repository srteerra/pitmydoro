import { DataList } from '@chakra-ui/react';
import { InfoTip } from '@/components/ui/toggle-tip';
import { Task } from '@/interfaces/Task.interface';
import { useMemo } from 'react';
import { formatMs } from '@/utils/formatMs.utils';
import moment from 'moment';
import { formatMinutes } from '@/utils/formatMinutes.utils';

interface Props {
  task: Task;
}

interface StatItem {
  label: string;
  value: number | string;
  info?: string;
}

export const StatsDialog = ({ task }: Props) => {
  console.log(task);

  const stats = useMemo<StatItem[]>(() => {
    if (!task) return [];

    return [
      {
        label: 'Last Session',
        value: moment((task.stats?.lastSessionAt?.seconds || 0) * 1000).format(
          'DD/MM/YYYY HH:mm a'
        ),
      },
      {
        label: 'Completed',
        value: task?.completedAt ? moment((task.completedAt?.seconds || 0) * 1000).fromNow() : 'No',
      },
      {
        label: 'Created At',
        value: moment((task.createdAt?.seconds || 0) * 1000).format('DD/MM/YYYY HH:mm a'),
      },
      { label: 'Pauses', value: task.stats?.totalPauses || 0 },
      { label: 'Break Time', value: formatMinutes(task.stats?.totalBreakTime || 0) },
      { label: 'Work Time', value: formatMinutes(task.stats?.totalWorkTime || 0) },
      { label: 'Time paused', value: formatMs(task.stats?.totalPausedTime || 0) },
      { label: 'No. interruptions', value: task.stats?.totalInterruptions || 0 },
    ];
  }, [task]);

  console.log(stats);
  return (
    <DataList.Root orientation='horizontal'>
      {stats.map((item) => (
        <DataList.Item key={item.label}>
          <DataList.ItemLabel opacity={0.7}>{item.label}</DataList.ItemLabel>
          <DataList.ItemValue display={'flex'} alignItems={'center'}>
            {item.value}
            {item.info && <InfoTip>{item.info}</InfoTip>}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
};
