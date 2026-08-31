'use client';

import { useEffect, useState } from 'react';
import { IconButton } from '@chakra-ui/react';
import { LuCheck, LuLink, LuShare2 } from 'react-icons/lu';
import { FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';
import { MenuContent, MenuItem, MenuRoot, MenuSeparator, MenuTrigger } from '@/components/ui/menu';
import { useAlert } from '@/hooks/useAlert';
import { copyToClipboard } from '@/utils/clipboard.utils';

interface Props {
  username: string;
  displayName?: string;
}

export const ShareProfile = ({ username, displayName }: Props) => {
  const t = useTranslations('profile');
  const { toastSuccess, toastError } = useAlert();
  const [profileUrl, setProfileUrl] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setProfileUrl(`${window.location.origin}/profile/${username}`);
    setCanNativeShare(!!navigator.share);
  }, [username]);

  useEffect(() => {
    if (!copied) return;

    const timeout = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timeout);
  }, [copied]);

  const shareText = t('shareText', { name: displayName || `@${username}` });

  const handleCopy = async () => {
    const success = await copyToClipboard(profileUrl);

    if (!success) {
      toastError(t('linkCopyError'));

      return;
    }

    setCopied(true);
    toastSuccess(t('linkCopied'));
  };

  const openShareWindow = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const handleNativeShare = () =>
    navigator.share({ title: shareText, text: shareText, url: profileUrl }).catch(() => undefined);

  const shareTargets = [
    {
      value: 'x',
      label: t('shareOnX'),
      icon: <FaXTwitter />,
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
    },
    {
      value: 'whatsapp',
      label: t('shareOnWhatsapp'),
      icon: <FaWhatsapp />,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`,
    },
    {
      value: 'telegram',
      label: t('shareOnTelegram'),
      icon: <FaTelegram />,
      url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
      <MenuTrigger asChild>
        <IconButton
          aria-label={t('shareProfile')}
          data-pw-id='profile-share-trigger'
          variant='outline'
          rounded='full'
          size='md'
        >
          {copied ? <LuCheck /> : <LuShare2 />}
        </IconButton>
      </MenuTrigger>

      <MenuContent minWidth='220px'>
        <MenuItem
          value='copy'
          cursor='pointer'
          data-pw-id='profile-share-copy'
          onClick={() => void handleCopy()}
        >
          <LuLink /> {t('copyLink')}
        </MenuItem>

        <MenuSeparator />

        {shareTargets.map((target) => (
          <MenuItem
            key={target.value}
            value={target.value}
            cursor='pointer'
            data-pw-id={`profile-share-${target.value}`}
            onClick={() => openShareWindow(target.url)}
          >
            {target.icon} {target.label}
          </MenuItem>
        ))}

        {canNativeShare && (
          <MenuItem
            value='native'
            cursor='pointer'
            data-pw-id='profile-share-native'
            onClick={() => void handleNativeShare()}
          >
            <LuShare2 /> {t('shareMore')}
          </MenuItem>
        )}
      </MenuContent>
    </MenuRoot>
  );
};
