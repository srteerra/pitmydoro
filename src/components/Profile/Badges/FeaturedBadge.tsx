'use client';

import React from 'react';
import { LuPlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { BadgeId, UserBadges } from '@/interfaces/Badge.interface';
import { resolveFeaturedBadge } from '@/utils/badges.utils';
import { Tooltip } from '@/components/ui/tooltip';
import { useDialog } from '@/contexts/DialogContext';
import { BadgeDialog } from '@/components/Profile/Badges/BadgeDialog';
import { BadgePicker } from '@/components/Profile/Badges/BadgePicker';
import { BadgeFlat } from '@/components/Profile/Badges/BadgeFlat';
import { BadgeHex } from '@/components/Profile/Badges/BadgeHex';

interface Props {
  badges?: UserBadges | null;
  featuredBadge?: BadgeId | null;
  isOwn?: boolean;
}

const HEX_SIZE = 26;

export const FeaturedBadge = ({ badges, featuredBadge, isOwn = false }: Props) => {
  const t = useTranslations('badges');
  const { openDialog } = useDialog();

  const badge = resolveFeaturedBadge(badges, featuredBadge);

  const openPicker = () => {
    openDialog({ title: t('pickerTitle'), component: <BadgePicker />, size: 'md' });
  };

  const openBadge = () => {
    if (!badge) return;
    openDialog({ title: t('dialogTitle'), component: <BadgeDialog badge={badge} />, size: 'sm' });
  };

  if (badge) {
    return (
      <Tooltip
        content={isOwn ? t('changeBadge') : t(`${badge.id}.name`)}
        openDelay={120}
        closeDelay={80}
      >
        <BadgeFlat
          as='button'
          data-pw-id={`profile-featured-badge-${badge.id}`}
          size={HEX_SIZE}
          color={badge.color}
          glyph={badge.glyph}
          onClick={isOwn ? openPicker : openBadge}
          cursor='pointer'
          transition='transform 0.15s ease'
          _hover={{ transform: 'translateY(-1px) scale(1.06)' }}
        />
      </Tooltip>
    );
  }

  if (!isOwn) return null;

  return (
    <Tooltip content={t('pickerTitle')} openDelay={120} closeDelay={80}>
      <BadgeHex
        as='button'
        data-pw-id='profile-badge-picker-trigger'
        aria-label={t('pickerTitle')}
        size={HEX_SIZE}
        onClick={openPicker}
        cursor='pointer'
        transition='transform 0.15s ease, background 0.15s ease'
        _hover={{ transform: 'translateY(-1px) scale(1.06)', bg: 'bg.subtle', color: 'fg' }}
      >
        <LuPlus size={14} />
      </BadgeHex>
    </Tooltip>
  );
};
