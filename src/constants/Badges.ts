import { BadgeDefinition } from '@/interfaces/Badge.interface';

export const BADGES: BadgeDefinition[] = [
  {
    id: 'streamer',
    flag: 'isStreamer',
    color: '#8B5CF6',
    glyph: {
      paths: [
        { d: 'M4.9 19.1C1 15.2 1 8.8 4.9 4.9' },
        { d: 'M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5' },
        { d: 'M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5' },
        { d: 'M19.1 4.9C23 8.8 23 15.1 19.1 19' },
      ],
      circles: [{ cx: 12, cy: 12, r: 2 }],
    },
  },
  {
    id: 'supporter',
    flag: 'isSupporter',
    color: '#F43F5E',
    glyph: {
      paths: [
        {
          d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
        },
      ],
    },
  },
  {
    id: 'dev',
    flag: 'isDev',
    color: '#10B981',
    glyph: {
      paths: [{ d: 'M16 18 L22 12 L16 6' }, { d: 'M8 6 L2 12 L8 18' }],
    },
  },
  {
    id: 'creator',
    flag: 'isCreator',
    color: '#F59E0B',
    glyph: {
      paths: [{ d: 'm3 11 18-5v12L3 14v-3z' }, { d: 'M11.6 16.8a3 3 0 1 1-5.8-1.6' }],
    },
  },
  {
    id: 'designer',
    flag: 'isDesigner',
    color: '#06B6D4',
    glyph: {
      paths: [
        {
          d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z',
        },
      ],
      circles: [
        { cx: 13.5, cy: 6.5, r: 0.75, fill: true },
        { cx: 17.5, cy: 10.5, r: 0.75, fill: true },
        { cx: 8.5, cy: 7.5, r: 0.75, fill: true },
        { cx: 6.5, cy: 12.5, r: 0.75, fill: true },
      ],
    },
  },
];
