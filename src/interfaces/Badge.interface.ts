export type BadgeId = 'streamer' | 'supporter' | 'dev' | 'creator' | 'designer';

export type BadgeFlag = 'isStreamer' | 'isSupporter' | 'isDev' | 'isCreator' | 'isDesigner';

export type UserBadges = Partial<Record<BadgeFlag, boolean>>;

export interface BadgeGlyphPath {
  d: string;
  fill?: boolean;
}

export interface BadgeGlyphCircle {
  cx: number;
  cy: number;
  r: number;
  fill?: boolean;
}

export interface BadgeGlyph {
  paths?: BadgeGlyphPath[];
  circles?: BadgeGlyphCircle[];
}

export interface BadgeDefinition {
  id: BadgeId;
  flag: BadgeFlag;
  color: string;
  glyph: BadgeGlyph;
}
