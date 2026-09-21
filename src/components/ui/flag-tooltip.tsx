'use client';

import { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { useLocale } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';
import { flagEmojiToCountryName } from '@/constants/CountryFlags';

interface Props {
  flag: string;
  name?: string;
  locale?: string;
  children: React.ReactNode;
}

export const FlagTooltip = ({ flag, name, locale, children }: Props) => {
  const currentLocale = useLocale();
  const resolvedLocale = locale ?? currentLocale;
  const countryName = useMemo(
    () => name ?? flagEmojiToCountryName(flag, resolvedLocale),
    [name, flag, resolvedLocale]
  );

  if (!countryName) return children;

  return (
    <Tooltip content={countryName} openDelay={200} closeDelay={50}>
      <Box
        as='span'
        tabIndex={0}
        aria-label={countryName}
        css={{ outline: 'none' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};
