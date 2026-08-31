'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  Circle,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuBadgeCheck, LuCalendar, LuMapPin } from 'react-icons/lu';
import { FaDiscord, FaInstagram, FaTwitch, FaXTwitter } from 'react-icons/fa6';
import moment from 'moment/min/moment-with-locales';
import { useLocale, useTranslations } from 'next-intl';
import { timestampUtils } from '@/utils/timestamp.utils';
import { UserProfile } from '@/interfaces/UserProfile.interface';
import { bannerFromColor, DEFAULT_PROFILE_THEME, resolveTeam } from '@/utils/profileTheme.utils';
import { LastConnection } from '@/components/Profile/LastConnection';
import { EditProfile } from '@/components/Profile/EditProfile';
import { ShareProfile } from '@/components/Profile/ShareProfile';
import { ProfileStats } from '@/components/Profile/Stats';
import { PixelAvatar } from '@/components/Profile/PixelAvatar';
import { jersey15 } from '@/assets/fonts/Jersey';
import { useDialog } from '@/contexts/DialogContext';
import useProfileThemeStore from '@/stores/ProfileTheme.store';
import { useTheme } from 'next-themes';
import tinycolor from 'tinycolor2';

interface Props {
  profile: Partial<UserProfile> & { username: string };
  isOwn?: boolean;
}

const InfoPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <HStack
    gap={1.5}
    paddingX={3}
    paddingY={1.5}
    borderRadius='full'
    bg='bg.muted'
    fontSize='sm'
    flexShrink={0}
  >
    <Box color='fg.muted' display='inline-flex'>
      {icon}
    </Box>
    <Text truncate>{label}</Text>
  </HStack>
);

export const Profile = ({ profile, isOwn = false }: Props) => {
  const t = useTranslations('profile');
  const locale = useLocale();
  const { theme } = useTheme();
  const { openDialog } = useDialog();
  const setTheme = useProfileThemeStore((state) => state.setTheme);
  moment.locale(locale);

  const team = resolveTeam(profile.favoriteTeam);
  const profileTheme = profile.profileTheme ?? DEFAULT_PROFILE_THEME;

  const teamTone = team
    ? theme === 'dark'
      ? tinycolor(team.colors.primary.default).darken(5).toString()
      : tinycolor(team.colors.background.session).brighten(1).toString()
    : undefined;
  const teamToneText = teamTone && tinycolor(teamTone).isDark() ? 'white' : 'gray.900';
  const usernameToneText = tinycolor(profileTheme.accent).darken(55).toString();

  const createdAtMs = timestampUtils.toMillis(profile.createdAt);
  const memberSince = createdAtMs ? moment(createdAtMs).format('MMM YYYY') : null;

  const socialItems = [
    {
      key: 'instagram',
      label: 'Instagram',
      icon: <FaInstagram />,
      url: profile.socials?.instagram,
    },
    { key: 'twitch', label: 'Twitch', icon: <FaTwitch />, url: profile.socials?.twitch },
    { key: 'discord', label: 'Discord', icon: <FaDiscord />, url: profile.socials?.discord },
    { key: 'twitter', label: 'X', icon: <FaXTwitter />, url: profile.socials?.twitter },
  ].filter((social) => !!social.url);

  useEffect(() => {
    setTheme(profileTheme);
  }, [profileTheme, setTheme]);

  const handleEditProfile = () => {
    openDialog({ title: t('editProfile'), component: EditProfile, size: 'lg' });
  };

  return (
    <Center w='full' paddingX={{ base: 3, md: 6 }} paddingY={{ base: 4, md: 8 }}>
      <Box
        w='full'
        maxW='5xl'
        bg='bg.panel'
        borderRadius='2xl'
        boxShadow='sm'
        overflow='hidden'
        pb={{ base: 8, md: 10 }}
        backgroundColor={{
          base: 'white',
          _dark: { base: 'white', md: 'dark.200' },
        }}
      >
        <Box
          position='relative'
          w='full'
          h={{ base: '150px', sm: '200px', md: '240px' }}
          backgroundColor={bannerFromColor(profile.profileBackground)}
        >
          <LastConnection value={profile.lastConnection} />
        </Box>

        <Box paddingX={{ base: 5, md: 8 }}>
          <Flex justify='space-between' align='flex-end' gap={4} wrap='wrap'>
            <Box position='relative' zIndex={1} mt={{ base: '-60px', sm: '-74px', md: '-88px' }}>
              <PixelAvatar
                name={profile.displayName || profile.username}
                color={profileTheme.primary}
                size={{ base: 124, sm: 156, md: 184 }}
              />
            </Box>

            <HStack gap={2} pb={2} ml='auto'>
              <ShareProfile username={profile.username} displayName={profile.displayName} />

              {isOwn && (
                <Button
                  onClick={handleEditProfile}
                  variant='outline'
                  rounded='full'
                  size='md'
                  px={6}
                >
                  {t('editProfile')}
                </Button>
              )}
            </HStack>
          </Flex>

          <VStack align='stretch' gap={4} mt={4}>
            <Box>
              <Flex alignItems={'center'} gap={2}>
                <Heading size={{ base: '2xl', md: '3xl' }} truncate>
                  {profile.displayName || profile.username}
                </Heading>

                <Circle
                  size='24px'
                  bg='blue.500'
                  color='white'
                  outline='3px solid'
                  outlineColor='bg.panel'
                >
                  <LuBadgeCheck size={16} />
                </Circle>
              </Flex>

              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight='medium'
                color={usernameToneText}
                className={jersey15.className}
              >
                @{profile.username}
              </Text>
            </Box>

            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color={profile.bio ? 'fg' : 'fg.muted'}
              maxW='640px'
              whiteSpace='pre-line'
              paddingBottom={2}
            >
              {profile.bio || t('bioPlaceholder')}
            </Text>

            {socialItems.length > 0 && (
              <Flex gap={2} wrap='wrap'>
                {socialItems.map((social) => (
                  <Button
                    key={social.key}
                    asChild
                    variant='ghost'
                    rounded='full'
                    size='sm'
                    bg='bg.muted'
                    _hover={{ bg: 'bg.emphasized' }}
                  >
                    <a href={social.url} target='_blank' rel='noopener noreferrer'>
                      {social.icon}
                      {social.label}
                    </a>
                  </Button>
                ))}
              </Flex>
            )}

            <Flex gap={2} wrap='wrap' align='center'>
              {profile.location && (
                <InfoPill icon={<LuMapPin size={14} />} label={profile.location} />
              )}
              {team && (
                <HStack
                  gap={1.5}
                  paddingX={3}
                  paddingY={1.5}
                  borderRadius='full'
                  bg={teamTone}
                  color={teamToneText}
                  fontSize='sm'
                  flexShrink={0}
                >
                  <Image src={team.logoURL} alt={team.name} h='16px' w='auto' objectFit='contain' />
                  <Text truncate>{team.name}</Text>
                </HStack>
              )}
              {profile.favoriteFlag && (
                <HStack
                  paddingX={3}
                  paddingY={1.5}
                  borderRadius='full'
                  bg='bg.muted'
                  fontSize='md'
                  flexShrink={0}
                >
                  <Text>{profile.favoriteFlag}</Text>
                </HStack>
              )}
              {memberSince && (
                <InfoPill
                  icon={<LuCalendar size={14} />}
                  label={`${t('memberSince')} ${memberSince}`}
                />
              )}
            </Flex>
          </VStack>

          <ProfileStats />
        </Box>
      </Box>
    </Center>
  );
};
