'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Field,
  Flex,
  HStack,
  Image,
  Input,
  Separator,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { type Control, Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FaDiscord, FaInstagram, FaTwitch, FaXTwitter } from 'react-icons/fa6';
import { LuCheck, LuTriangleAlert } from 'react-icons/lu';
import { Tooltip } from '@/components/ui/tooltip';
import { FlagPicker } from '@/components/Profile/EditProfile/FlagPicker';
import { BackgroundPicker } from '@/components/Profile/EditProfile/BackgroundPicker';
import { PixelAvatar } from '@/components/Profile/PixelAvatar';
import { SCUDERIAS } from '@/constants/Scuderias';
import { Socials } from '@/interfaces/Socials.interface';
import { isValidSocialUrl, normalizeSocialUrl, SocialPlatform } from '@/utils/socials.utils';
import { BIO_MAX_LENGTH, bioHasLink, bioHasProfanity } from '@/utils/bio.utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDialog } from '@/contexts/DialogContext';
import { userService } from '@/services/user.service';
import { type UsernameStatus, useUsernameAvailability } from '@/hooks/useUsernameAvailability';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { useAlert } from '@/hooks/useAlert';
import useUserStore from '@/stores/User.store';
import useProfileThemeStore from '@/stores/ProfileTheme.store';
import { DEFAULT_PROFILE_THEME, themeFromTeam } from '@/utils/profileTheme.utils';

interface ProfileFields {
  username: string;
  bio: string;
  instagram: string;
  twitch: string;
  discord: string;
  twitter: string;
}

const SOCIAL_INPUTS: {
  name: SocialPlatform;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}[] = [
  {
    name: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    icon: <FaInstagram />,
  },
  {
    name: 'twitch',
    label: 'Twitch',
    placeholder: 'https://twitch.tv/username',
    icon: <FaTwitch />,
  },
  {
    name: 'discord',
    label: 'Discord',
    placeholder: 'https://discord.gg/invite',
    icon: <FaDiscord />,
  },
  {
    name: 'twitter',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/username',
    icon: <FaXTwitter />,
  },
];

const TeamGrid = React.memo(
  ({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) => (
    <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} gap={3}>
      {SCUDERIAS.map((team) => {
        const isSelected = selected === team.id;
        const sessionColor = team.colors.background.session;

        return (
          <Tooltip key={team.id} content={team.name} openDelay={100} closeDelay={100}>
            <Box
              as='button'
              onClick={() => onSelect(team.id)}
              aspectRatio={1}
              display='flex'
              alignItems='center'
              justifyContent='center'
              borderRadius='xl'
              borderWidth='3px'
              cursor={'pointer'}
              bg={isSelected ? sessionColor : 'bg.muted'}
              borderColor={isSelected ? tinycolor(sessionColor).darken(12).toString() : 'border'}
              transform={isSelected ? 'scale(1.06)' : 'scale(1)'}
              boxShadow={isSelected ? 'md' : 'none'}
              transition='all 0.15s ease'
              _hover={{
                transform: isSelected ? 'scale(1.06)' : 'scale(1.03)',
                borderColor: tinycolor(sessionColor).darken(8).toString(),
              }}
              _active={{ transform: 'scale(0.97)' }}
            >
              <Image src={team.logoURL} alt={team.name} maxH='60%' maxW='60%' objectFit='contain' />
            </Box>
          </Tooltip>
        );
      })}
    </SimpleGrid>
  )
);

TeamGrid.displayName = 'TeamGrid';

type RegistrationStatus = 'idle' | 'checking' | 'registered' | 'unclaimed' | 'takenByOther';

interface UsernameFieldProps {
  control: Control<ProfileFields>;
  uid?: string;
  initialUsername: string;
  registration: RegistrationStatus;
  claiming: boolean;
  onTake: () => void;
  onStatusChange: (status: UsernameStatus, changed: boolean) => void;
}

const UsernameField = ({
  control,
  uid,
  initialUsername,
  registration,
  claiming,
  onTake,
  onStatusChange,
}: UsernameFieldProps) => {
  const t = useTranslations('profile');
  const value = useWatch({ control, name: 'username' }) ?? '';
  const debounced = useDebouncedValue(value.trim().toLowerCase(), 400);
  const changed = debounced !== initialUsername;
  const check = useCallback(
    (name: string) =>
      uid
        ? userService.isUsernameAvailableFor(name, uid)
        : userService.isUsernameAvailableInRegistry(name),
    [uid]
  );
  const status = useUsernameAvailability(changed ? debounced : '', check);

  useEffect(() => {
    onStatusChange(status, changed);
  }, [status, changed, onStatusChange]);

  const onInitialName = value.trim().toLowerCase() === initialUsername;
  const showTakeButton = registration === 'unclaimed' && onInitialName;
  const showWarning = registration === 'unclaimed' || registration === 'takenByOther';

  return (
    <Controller
      control={control}
      name='username'
      rules={{
        required: t('usernameRequired'),
        validate: (v: string) => userService.isValidUsername(v) || t('usernameInvalid'),
      }}
      render={({ field, fieldState }) => {
        const showTaken = changed && status === 'taken';

        return (
          <Field.Root invalid={!!fieldState.error || showTaken}>
            <Field.Label>{t('usernameLabel')}</Field.Label>
            <HStack gap={2} w='full' align='center'>
              <Input
                {...field}
                placeholder={t('usernamePlaceholder')}
                rounded='full'
                autoComplete='off'
                flex='1'
              />
              {showTakeButton && (
                <Button
                  type='button'
                  onClick={onTake}
                  loading={claiming}
                  rounded='full'
                  flexShrink={0}
                  px={5}
                >
                  {t('takeUsername')}
                </Button>
              )}
            </HStack>
            {changed && status === 'checking' && (
              <HStack gap={2} paddingX={2} paddingTop={1} color='fg.muted' fontSize='sm'>
                <Spinner size='xs' />
                <Text>{t('usernameChecking')}</Text>
              </HStack>
            )}
            {changed && status === 'available' && (
              <HStack gap={2} paddingX={2} paddingTop={1} color='green.500' fontSize='sm'>
                <LuCheck />
                <Text>{t('usernameAvailable')}</Text>
              </HStack>
            )}
            <Field.ErrorText>
              {fieldState.error?.message ?? (showTaken ? t('usernameTaken') : undefined)}
            </Field.ErrorText>
            {showWarning && (
              <HStack
                mt={2}
                gap={2.5}
                align='flex-start'
                padding={3}
                borderRadius='lg'
                borderWidth='1px'
                colorPalette='orange'
                bg='colorPalette.subtle'
                color='colorPalette.fg'
                borderColor='colorPalette.muted'
              >
                <Box mt='2px' flexShrink={0} fontSize='md'>
                  <LuTriangleAlert />
                </Box>
                <Text fontSize='sm'>
                  {registration === 'unclaimed'
                    ? t('usernameUnclaimedWarning')
                    : t('usernameConflictWarning')}
                </Text>
              </HStack>
            )}
          </Field.Root>
        );
      }}
    />
  );
};

export const EditProfile = () => {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const { toastSuccess, toastWarning, confirmAlert } = useAlert();
  const { setCloseGuard, closeDialog } = useDialog();
  const profile = useUserStore((state) => state.profile);
  const updateLocalProfile = useUserStore((state) => state.updateProfile);
  const setTheme = useProfileThemeStore((state) => state.setTheme);

  const initialTeam = profile?.favoriteTeam ?? null;
  const initialFlag = profile?.favoriteFlag || '';
  const initialUsername = (profile?.username || '').toLowerCase();
  const initialBackground = profile?.profileBackground ?? null;

  const [selected, setSelected] = useState<string | null>(initialTeam);
  const [selectedFlag, setSelectedFlag] = useState<string>(initialFlag);
  const [background, setBackground] = useState<string | null>(initialBackground);

  const { control, handleSubmit, reset, setValue, setError, formState } = useForm<ProfileFields>({
    mode: 'onChange',
    defaultValues: {
      username: profile?.username || '',
      bio: profile?.bio || '',
      instagram: profile?.socials?.instagram || '',
      twitch: profile?.socials?.twitch || '',
      discord: profile?.socials?.discord || '',
      twitter: profile?.socials?.twitter || '',
    },
  });

  const [username, setUsername] = useState<{ status: UsernameStatus; changed: boolean }>({
    status: 'idle',
    changed: false,
  });
  const [registration, setRegistration] = useState<RegistrationStatus>('idle');
  const [claiming, setClaiming] = useState(false);

  const handleUsernameStatus = useCallback((status: UsernameStatus, changed: boolean) => {
    setUsername({ status, changed });
  }, []);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid || !initialUsername) {
      setRegistration('registered');
      return;
    }

    let active = true;
    setRegistration('checking');

    userService
      .getUsernameOwner(initialUsername)
      .then((owner) => {
        if (!active) return;
        if (owner === uid) {
          setRegistration('registered');
        } else if (owner) {
          setRegistration('takenByOther');
          setValue('username', '', { shouldDirty: false, shouldValidate: false });
        } else {
          setRegistration('unclaimed');
        }
      })
      .catch(() => {
        if (active) setRegistration('registered');
      });

    return () => {
      active = false;
    };
  }, [uid, initialUsername, setValue]);

  const handleTakeUsername = async () => {
    if (!user || !initialUsername) return;

    setClaiming(true);
    try {
      await userService.changeUsername(user.uid, initialUsername);
      updateLocalProfile({ username: initialUsername });
      setRegistration('registered');
      toastSuccess(t('usernameClaimed'));
    } catch {
      setRegistration('takenByOther');
      setValue('username', '', { shouldDirty: false, shouldValidate: false });
      toastWarning(t('usernameClaimConflict'));
    } finally {
      setClaiming(false);
    }
  };

  const selectedTeam = selected ? (SCUDERIAS.find((team) => team.id === selected) ?? null) : null;
  const profileTheme = selectedTeam ? themeFromTeam(selectedTeam) : DEFAULT_PROFILE_THEME;

  const handleSelectTeam = useCallback(
    (id: string) => setSelected((prev) => (prev === id ? null : id)),
    []
  );

  const isDirty =
    selected !== initialTeam ||
    selectedFlag !== initialFlag ||
    background !== initialBackground ||
    formState.isDirty;

  const usernameBlocked = username.changed && username.status !== 'available';

  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;
  const confirmRef = useRef(confirmAlert);
  confirmRef.current = confirmAlert;
  const warnRef = useRef(toastWarning);
  warnRef.current = toastWarning;

  useEffect(() => {
    setCloseGuard(async () => {
      if (!dirtyRef.current) return true;

      const confirmed = (await confirmRef.current(t('discardTitle'), {
        text: t('discardText'),
        type: 'warning',
        confirmButtonText: t('discard'),
        denyButtonText: t('keepEditing'),
      })) as boolean;

      if (confirmed) warnRef.current(t('changesDiscarded'));

      return confirmed;
    });

    return () => setCloseGuard(null);
  }, [setCloseGuard, t]);

  const handleSave = handleSubmit(async (data) => {
    const socials: Socials = {
      instagram: normalizeSocialUrl(data.instagram),
      twitch: normalizeSocialUrl(data.twitch),
      discord: normalizeSocialUrl(data.discord),
      twitter: normalizeSocialUrl(data.twitter),
    };

    const nextUsername = data.username.trim().toLowerCase();
    const bio = data.bio.trim();

    const needsClaim = registration === 'unclaimed';

    if (user && (nextUsername !== initialUsername || needsClaim)) {
      if (!userService.isValidUsername(nextUsername)) {
        setError('username', { type: 'validate', message: t('usernameInvalid') });
        return;
      }
      try {
        await userService.changeUsername(user.uid, nextUsername);
      } catch (err) {
        const message =
          (err as Error)?.message === 'USERNAME_INVALID'
            ? t('usernameInvalid')
            : t('usernameTaken');
        setError('username', { type: 'validate', message });
        return;
      }
    }

    updateLocalProfile({
      username: nextUsername,
      bio,
      favoriteTeam: selected,
      profileTheme,
      profileBackground: background,
      favoriteFlag: selectedFlag,
      socials,
    });
    setTheme(profileTheme);

    if (user) {
      await userService.updateProfile(user.uid, {
        bio,
        favoriteTeam: selected,
        profileTheme,
        profileBackground: background,
        favoriteFlag: selectedFlag,
        socials,
      });
    }

    reset({ ...data, username: nextUsername, bio });
    toastSuccess(t('profileSaved'));

    dirtyRef.current = false;
    closeDialog();
  });

  return (
    <VStack align='stretch' gap={6}>
      <VStack align='stretch' gap={4}>
        <Text
          fontSize='xs'
          fontWeight='bold'
          textTransform='uppercase'
          letterSpacing='wider'
          color='fg.muted'
        >
          {t('aboutSection')}
        </Text>

        <Flex gap={5} align='flex-start' direction={{ base: 'column', sm: 'row' }}>
          <Box flexShrink={0} alignSelf={{ base: 'center', sm: 'flex-start' }}>
            <PixelAvatar
              name={profile?.username}
              color={profileTheme.primary}
              size={{ base: 112 }}
              ring={false}
            />
          </Box>

          <VStack align='stretch' gap={4} flex='1' w='full'>
            <UsernameField
              control={control}
              uid={uid}
              initialUsername={initialUsername}
              registration={registration}
              claiming={claiming}
              onTake={handleTakeUsername}
              onStatusChange={handleUsernameStatus}
            />

            <Controller
              control={control}
              name='bio'
              rules={{
                validate: (value: string) => {
                  const text = value || '';
                  if (text.length > BIO_MAX_LENGTH) return t('bioTooLong', { max: BIO_MAX_LENGTH });
                  if (bioHasLink(text)) return t('bioNoLinks');
                  if (bioHasProfanity(text)) return t('bioNoProfanity');
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <Field.Root invalid={!!fieldState.error}>
                  <Field.Label>{t('bioLabel')}</Field.Label>
                  <Textarea
                    {...field}
                    placeholder={t('bioInputPlaceholder')}
                    rounded='2xl'
                    rows={4}
                    resize='none'
                  />
                  <Flex justify='space-between' w='full' paddingX={2} paddingTop={1}>
                    <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
                    <Text
                      fontSize='xs'
                      color={(field.value?.length ?? 0) > BIO_MAX_LENGTH ? 'red.500' : 'fg.muted'}
                      ml='auto'
                    >
                      {field.value?.length ?? 0}/{BIO_MAX_LENGTH}
                    </Text>
                  </Flex>
                </Field.Root>
              )}
            />
          </VStack>
        </Flex>
      </VStack>

      <Separator />

      <FlagPicker value={selectedFlag} onChange={setSelectedFlag} />

      <Separator />

      <BackgroundPicker value={background} onChange={setBackground} />

      <Separator />

      <VStack align='stretch' gap={3}>
        <Flex align='baseline' justify='space-between' gap={2}>
          <Text
            fontSize='xs'
            fontWeight='bold'
            textTransform='uppercase'
            letterSpacing='wider'
            color='fg.muted'
          >
            {t('chooseTeam')}
          </Text>
          <Text fontSize='sm' fontWeight='semibold' color='fg' truncate>
            {selectedTeam?.name ?? t('noTeam')}
          </Text>
        </Flex>

        <TeamGrid selected={selected} onSelect={handleSelectTeam} />
      </VStack>

      <Separator />

      <VStack align='stretch' gap={4}>
        <Text
          fontSize='xs'
          fontWeight='bold'
          textTransform='uppercase'
          letterSpacing='wider'
          color='fg.muted'
        >
          {t('socialLinks')}
        </Text>

        {SOCIAL_INPUTS.map((social) => (
          <Controller
            key={social.name}
            control={control}
            name={social.name}
            rules={{
              validate: (value: string) =>
                isValidSocialUrl(social.name, value) ||
                t('invalidSocial', { platform: social.label }),
            }}
            render={({ field, fieldState }) => (
              <Field.Root invalid={!!fieldState.error}>
                <HStack gap={3} align='center' w='full'>
                  <Box fontSize='xl' color='fg.muted' flexShrink={0}>
                    {social.icon}
                  </Box>
                  <Input {...field} placeholder={social.placeholder} rounded='full' flex='1' />
                </HStack>
                <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
              </Field.Root>
            )}
          />
        ))}
      </VStack>

      <HStack justify='flex-end' gap={3} pt={2}>
        <Button type='button' onClick={() => closeDialog()} variant='outline' rounded='full' px={8}>
          {t('cancel')}
        </Button>
        <Button
          type='button'
          onClick={handleSave}
          rounded='full'
          px={8}
          loading={formState.isSubmitting}
          disabled={!isDirty || usernameBlocked || Object.keys(formState.errors).length > 0}
        >
          {t('saveChanges')}
        </Button>
      </HStack>
    </VStack>
  );
};
