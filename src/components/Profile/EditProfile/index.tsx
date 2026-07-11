'use client';

import React, { useState } from 'react';
import { Box, Button, Image, Separator, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'use-intl';
import { Tooltip } from '@/components/ui/tooltip';
import { InputController } from '@/components/Form/InputController';
import { FlagPicker } from '@/components/Profile/EditProfile/FlagPicker';
import { SCUDERIAS } from '@/constants/Scuderias';
import { Team } from '@/interfaces/Teams.interface';
import { Socials } from '@/interfaces/Socials.interface';
import { isValidSocialUrl, normalizeSocialUrl, SocialPlatform } from '@/utils/socials.utils';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';
import { useAlert } from '@/hooks/useAlert';
import useUserStore from '@/stores/User.store';
import useProfileThemeStore from '@/stores/ProfileTheme.store';

interface SocialFields {
  instagram: string;
  twitch: string;
  discord: string;
  twitter: string;
}

const SOCIAL_INPUTS: { name: SocialPlatform; label: string; placeholder: string }[] = [
  { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { name: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/username' },
  { name: 'discord', label: 'Discord', placeholder: 'https://discord.gg/invite' },
  { name: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/username' },
];

export const EditProfile = () => {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const { toastSuccess } = useAlert();
  const profile = useUserStore((state) => state.profile);
  const updateLocalProfile = useUserStore((state) => state.updateProfile);
  const setTeam = useProfileThemeStore((state) => state.setTeam);

  const [selected, setSelected] = useState<string>(profile?.favoriteTeam?.id || SCUDERIAS[0].id);
  const [selectedFlag, setSelectedFlag] = useState<string>(profile?.favoriteFlag || '');

  const { control, handleSubmit, formState } = useForm<SocialFields>({
    mode: 'onChange',
    defaultValues: {
      instagram: profile?.socials?.instagram || '',
      twitch: profile?.socials?.twitch || '',
      discord: profile?.socials?.discord || '',
      twitter: profile?.socials?.twitter || '',
    },
  });

  const handleSelect = async (team: Team) => {
    setSelected(team.id);
    setTeam(team);
    updateLocalProfile({ favoriteTeam: team });

    if (user) await userService.updateProfile(user.uid, { favoriteTeam: team });

    toastSuccess(t('teamSaved'));
  };

  const handleChangeFlag = async (emoji: string) => {
    setSelectedFlag(emoji);
    updateLocalProfile({ favoriteFlag: emoji });

    if (user) await userService.updateProfile(user.uid, { favoriteFlag: emoji });

    toastSuccess(t('flagSaved'));
  };

  const handleSaveSocials = async (data: SocialFields) => {
    const socials: Socials = {
      instagram: normalizeSocialUrl(data.instagram),
      twitch: normalizeSocialUrl(data.twitch),
      discord: normalizeSocialUrl(data.discord),
      twitter: normalizeSocialUrl(data.twitter),
    };

    updateLocalProfile({ socials });

    if (user) await userService.updateProfile(user.uid, { socials });

    toastSuccess(t('socialsSaved'));
  };

  return (
    <VStack align='stretch' gap={6}>
      <VStack align='stretch' gap={4}>
        <Text fontWeight='bold' fontSize='lg'>
          {t('chooseTeam')}
        </Text>

        <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} gap={3}>
          {SCUDERIAS.map((team) => {
            const isSelected = selected === team.id;
            const sessionColor = team.colors.background.session;

            return (
              <Tooltip key={team.id} content={team.name} openDelay={100} closeDelay={100}>
                <Box
                  as='button'
                  onClick={() => handleSelect(team)}
                  aspectRatio={1}
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  borderRadius='xl'
                  borderWidth='3px'
                  bg={isSelected ? sessionColor : 'bg.muted'}
                  borderColor={
                    isSelected ? tinycolor(sessionColor).darken(12).toString() : 'border'
                  }
                  transition='all 0.15s ease'
                  _hover={{
                    opacity: 0.85,
                    borderColor: tinycolor(sessionColor).darken(8).toString(),
                  }}
                >
                  <Image
                    src={team.logoURL}
                    alt={team.name}
                    maxH='60%'
                    maxW='60%'
                    objectFit='contain'
                  />
                </Box>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </VStack>

      <Separator />

      <FlagPicker value={selectedFlag} onChange={handleChangeFlag} />

      <Separator />

      <form onSubmit={handleSubmit(handleSaveSocials)}>
        <VStack align='stretch' gap={4}>
          <Text fontWeight='bold' fontSize='lg'>
            {t('socialLinks')}
          </Text>

          {SOCIAL_INPUTS.map((social) => (
            <InputController
              key={social.name}
              control={control}
              name={social.name}
              label={social.label}
              placeholder={social.placeholder}
              rounded='full'
              rules={{
                validate: (value: string) =>
                  isValidSocialUrl(social.name, value) ||
                  t('invalidSocial', { platform: social.label }),
              }}
            />
          ))}

          <Button
            type='submit'
            rounded='full'
            px={8}
            alignSelf='flex-end'
            loading={formState.isSubmitting}
          >
            {t('save')}
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};
