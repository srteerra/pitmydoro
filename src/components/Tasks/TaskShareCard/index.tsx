import { Task } from '@/interfaces/Task.interface';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import Image from 'next/image';

interface Props {
  task: Task;
  photoURL?: string;
  username?: string;
}

export const TaskShareCard = ({ task, photoURL }: Props) => {
  const stats = task.stats;

  return (
    <div
      style={{
        width: 600,
        background: '#0f0f0f',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 290,
          height: 100,
          overflow: 'hidden',
          position: 'relative',
          margin: '30px auto',
        }}
      >
        {photoURL ? (
          <Image
            src={photoURL}
            alt='cover'
            style={{ width: '100%', height: '100%', opacity: 0.85 }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1c1c1c' }} />
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 999,
          padding: '4px 12px',
          fontSize: 11,
          color: '#fff',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        ✓ Completed
      </div>

      <div style={{ padding: '10px 32px 32px' }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 24px',
            lineHeight: 1.3,
            color: '#f5f5f5',
          }}
        >
          {task.title}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          {[
            { icon: '🍅', label: 'Pomodoros', value: task?.totalPomodoros || 0 },
            {
              icon: '⏱',
              label: 'Work time',
              value: formatSeconds(stats?.totalWorkTime, 'duration'),
            },
            {
              icon: '☕',
              label: 'Break time',
              value: formatSeconds(stats?.totalBreakTime, 'duration'),
            },
            {
              icon: '⏸',
              label: 'Time paused',
              value: formatSeconds(stats?.totalPausedTime, 'duration'),
            },
            { icon: '🔁', label: 'Pauses', value: stats?.totalPauses || 0 },
            { icon: '🚧', label: 'Interruptions', value: stats?.totalInterruptions || 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#1a1a1a',
                borderRadius: 12,
                padding: '14px 16px',
                border: '1px solid #2a2a2a',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {stat.icon} {stat.label}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 600, color: '#f0f0f0' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #1f1f1f',
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: '#333' }}>pitmydoro.com</p>
        </div>
      </div>
    </div>
  );
};
