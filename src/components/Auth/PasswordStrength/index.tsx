'use client';

import React from 'react';
import { Box, HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { calculatePasswordStrength } from '@/utils/passwordStrength.utils';
import { useTranslations } from 'next-intl';

interface Props {
  password: string;
}

export const PasswordStrength = ({ password }: Props) => {
  const t = useTranslations('auth');

  if (!password) return null;

  const strength = calculatePasswordStrength(password);
  const progressValue = (strength.score / 10) * 100;

  const requirements = [
    { label: t('passwordStrength.minLength'), met: strength.checks.minLength },
    { label: t('passwordStrength.hasUpperCase'), met: strength.checks.hasUpperCase },
    { label: t('passwordStrength.hasNumber'), met: strength.checks.hasNumber },
    { label: t('passwordStrength.hasSpecialChar'), met: strength.checks.hasSpecialChar },
  ];

  return (
    <VStack width='full' align='start'>
      <Text fontSize='sm' fontWeight='bold' color={strength.color}>
        {t(`passwordStrength.level.${strength.level}`)}
      </Text>

      <Progress.Root
        width='full'
        animated
        value={progressValue}
        colorScheme={
          strength.level === 'weak'
            ? 'red'
            : strength.level === 'fair'
              ? 'orange'
              : strength.level === 'good'
                ? 'yellow'
                : 'green'
        }
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>

      <VStack width='full' align='start' gap={1}>
        {requirements.map((req, index) => (
          <HStack key={index} gap={2}>
            <Box color={req.met ? 'green.500' : 'gray.400'}>
              {req.met ? <FaCheck size={12} /> : <FaTimes size={12} />}
            </Box>
            <Text
              fontSize='xs'
              color={req.met ? 'green.600' : 'gray.500'}
              fontWeight={req.met ? 'medium' : 'normal'}
            >
              {req.label}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};
