'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Center,
  Circle,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuBadgeCheck, LuCalendar, LuMapPin, LuPlus, LuShare2 } from 'react-icons/lu';
import { FaDiscord, FaInstagram, FaTwitch, FaXTwitter } from 'react-icons/fa6';
import moment from 'moment/min/moment-with-locales';
import { useLocale, useTranslations } from 'use-intl';
import { timestampUtils } from '@/utils/timestamp.utils';
import { UserProfile } from '@/interfaces/UserProfile.interface';
import { SCUDERIAS } from '@/constants/Scuderias';
import { useAlert } from '@/hooks/useAlert';
import { LastConnection } from '@/components/Profile/LastConnection';
import { EditProfile } from '@/components/Profile/EditProfile';
import { ProfileStats } from '@/components/Profile/Stats';
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
  const { toastSuccess } = useAlert();
  const { openDialog } = useDialog();
  const setTeam = useProfileThemeStore((state) => state.setTeam);
  const [following, setFollowing] = useState(false);
  moment.locale(locale);

  const team = profile.favoriteTeam ?? SCUDERIAS[0];

  const teamTone =
    theme === 'dark'
      ? tinycolor(team.colors.primary.default).darken(5).toString()
      : tinycolor(team.colors.background.session).brighten(1).toString();
  const teamToneText = tinycolor(teamTone).isDark() ? 'white' : 'gray.900';
  const usernameToneText = tinycolor(team.colors.background.shortBreak).darken(55).toString();

  const createdAtMs = timestampUtils.toMillis(profile.createdAt);
  const memberSince = createdAtMs ? moment(createdAtMs).format('MMM YYYY') : null;

  const avatarSrc = profile.photoURL || `https://ui-avatars.com/api/?name=${profile.username}`;

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
    setTeam(team ?? null);
  }, [team, setTeam]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username}`);
    } catch {}
    toastSuccess(t('linkCopied'));
  };

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
          backgroundImage={
            profile.coverURL
              ? `url(${profile.coverURL})`
              : 'linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)'
          }
          bgSize='cover'
          backgroundPosition='center'
        >
          <LastConnection value={profile.lastConnection} />
        </Box>

        <Box paddingX={{ base: 5, md: 8 }}>
          <Flex justify='space-between' align='flex-end' gap={4} wrap='wrap'>
            <Avatar.Root
              boxSize={{ base: '104px', sm: '128px', md: '148px' }}
              mt={{ base: '-52px', sm: '-64px', md: '-74px' }}
              borderWidth='4px'
              borderColor='bg.panel'
            >
              <Avatar.Fallback name={profile.displayName || profile.username} fontSize='3xl' />
              <Avatar.Image src={avatarSrc} alt={profile.username} />
            </Avatar.Root>

            <HStack gap={2} pb={2} ml='auto'>
              <IconButton
                aria-label={t('shareProfile')}
                onClick={handleShare}
                variant='outline'
                rounded='full'
                size='md'
              >
                <LuShare2 />
              </IconButton>

              {isOwn ? (
                <Button
                  onClick={handleEditProfile}
                  variant='outline'
                  rounded='full'
                  size='md'
                  px={6}
                >
                  {t('editProfile')}
                </Button>
              ) : (
                <Button
                  onClick={() => setFollowing((prev) => !prev)}
                  rounded='full'
                  size='md'
                  px={6}
                  variant={following ? 'outline' : 'solid'}
                  bg={following ? undefined : 'fg'}
                  color={following ? undefined : 'bg'}
                  _hover={following ? undefined : { opacity: 0.9 }}
                >
                  {!following && <LuPlus />}
                  {following ? t('followingButton') : t('follow')}
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
