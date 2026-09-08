'use client';

import React, { useState } from 'react';
import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LuCheck, LuLock } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import tinycolor from 'tinycolor2';
import { BADGES } from '@/constants/Badges';
import { BadgeDefinition, BadgeId } from '@/interfaces/Badge.interface';
import { isBadgeOwned } from '@/utils/badges.utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDialog } from '@/contexts/DialogContext';
import { useAlert } from '@/hooks/useAlert';
import { userService } from '@/services/user.service';
import useUserStore from '@/stores/User.store';
import { BadgeDialog } from '@/components/Profile/Badges/BadgeDialog';
import { BadgeFlat } from '@/components/Profile/Badges/BadgeFlat';

export const BadgePicker = () => {
  const t = useTranslations('badges');
  const { user } = useAuth();
  const { toastSuccess } = useAlert();
  const { openDialog } = useDialog();
  const profile = useUserStore((state) => state.profile);
  const updateLocalProfile = useUserStore((state) => state.updateProfile);

  const [saving, setSaving] = useState<BadgeId | null>(null);

  const featured = profile?.featuredBadge ?? null;

  const openPicker = () => {
    openDialog({ title: t('pickerTitle'), component: <BadgePicker />, size: 'md' });
  };

  const previewLocked = (badge: BadgeDefinition) => {
    openDialog({
      title: t('dialogTitle'),
      component: <BadgeDialog badge={badge} locked onBack={openPicker} />,
      size: 'sm',
    });
  };

  const equip = async (badge: BadgeDefinition) => {
    if (saving) return;

    const next = featured === badge.id ? null : badge.id;

    setSaving(badge.id);
    updateLocalProfile({ featuredBadge: next });

    try {
      if (user) await userService.updateProfile(user.uid, { featuredBadge: next });
      toastSuccess(next ? t('equipped', { name: t(`${badge.id}.name`) }) : t('unequipped'));
    } catch {
      updateLocalProfile({ featuredBadge: featured });
    } finally {
      setSaving(null);
    }
  };

  return (
    <VStack data-pw-id='badge-picker' align='stretch' gap={4} pb={2}>
      <Text fontSize='sm' color='fg.muted'>
        {t('pickerHint')}
      </Text>

      <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
        {BADGES.map((badge) => {
          const owned = isBadgeOwned(profile?.badges, badge.id);
          const isFeatured = featured === badge.id;

          return (
            <VStack
              key={badge.id}
              as='button'
              data-pw-id={`badge-picker-${badge.id}`}
              data-owned={owned}
              data-featured={isFeatured}
              aria-disabled={owned && saving !== null}
              onClick={() => (owned ? equip(badge) : previewLocked(badge))}
              gap={2}
              paddingY={4}
              paddingX={2}
              borderRadius='xl'
              borderWidth='2px'
              position='relative'
              cursor='pointer'
              bg={
                isFeatured
                  ? tinycolor(badge.color).setAlpha(0.14).toRgbString()
                  : owned
                    ? 'bg.muted'
                    : 'transparent'
              }
              borderColor={
                isFeatured ? tinycolor(badge.color).setAlpha(0.55).toRgbString() : 'transparent'
              }
              opacity={owned ? 1 : 0.55}
              transition='transform 0.15s ease, background 0.15s ease, opacity 0.15s ease'
              _hover={{ transform: 'translateY(-2px)', opacity: 1 }}
            >
              {isFeatured && (
                <Flex
                  position='absolute'
                  top={2}
                  right={2}
                  align='center'
                  justify='center'
                  boxSize='18px'
                  borderRadius='full'
                  bg={badge.color}
                  color='white'
                >
                  <LuCheck size={12} />
                </Flex>
              )}

              {!owned && (
                <Box position='absolute' top={2} right={2} color='fg.muted'>
                  <LuLock size={12} />
                </Box>
              )}

              <BadgeFlat size={46} color={badge.color} glyph={badge.glyph} muted={!owned} />

              <Text fontSize='sm' fontWeight='semibold' lineHeight='1.1'>
                {t(`${badge.id}.name`)}
              </Text>
              <Text fontSize='2xs' color='fg.muted' lineHeight='1.1'>
                {isFeatured ? t('unequipLabel') : owned ? t('equipLabel') : t('lockedPreviewLabel')}
              </Text>
            </VStack>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
};
