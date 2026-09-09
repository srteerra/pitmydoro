import { BADGES } from '@/constants/Badges';
import { BadgeDefinition, BadgeId, UserBadges } from '@/interfaces/Badge.interface';

const isEnabled = (value: unknown): boolean => value === true || value === 1 || value === 'true';

export const resolveBadges = (badges?: UserBadges | null): BadgeDefinition[] => {
  if (!badges) return [];
  return BADGES.filter((badge) => isEnabled(badges[badge.flag]));
};

export const findBadge = (id: BadgeId): BadgeDefinition | undefined =>
  BADGES.find((badge) => badge.id === id);

export const isBadgeOwned = (badges: UserBadges | null | undefined, id: BadgeId): boolean => {
  const badge = findBadge(id);
  return !!badge && isEnabled(badges?.[badge.flag]);
};

export const resolveFeaturedBadge = (
  badges: UserBadges | null | undefined,
  featured: BadgeId | null | undefined
): BadgeDefinition | null => {
  if (!featured) return null;
  return isBadgeOwned(badges, featured) ? (findBadge(featured) ?? null) : null;
};
