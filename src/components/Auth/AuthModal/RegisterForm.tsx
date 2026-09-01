'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, HStack, IconButton, Spinner, Text, VStack } from '@chakra-ui/react';
import { BiLogoGoogle } from 'react-icons/bi';
import { LuCheck } from 'react-icons/lu';
import { InputController } from '@/components/Form/InputController';
import { PasswordStrength } from '../PasswordStrength';
import { calculatePasswordStrength } from '@/utils/passwordStrength.utils';
import { useTranslations } from 'next-intl';
import { DefaultSignUpFields } from '@/constants/DefaultFields';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';

interface RegisterFormInputs {
  username?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  onSubmit: (data: RegisterFormInputs) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onSwitchToLogin: () => void;
  loading: boolean;
  error: string;
}

export const RegisterForm = ({
  onSubmit,
  onGoogleSignIn,
  onSwitchToLogin,
  loading,
  error,
}: Props) => {
  const t = useTranslations('auth');
  const { control, handleSubmit, watch, formState, setError, clearErrors } =
    useForm<RegisterFormInputs>({
      mode: 'onChange',
      defaultValues: DefaultSignUpFields,
    });

  const password = watch('password');
  const username = watch('username') ?? '';
  const usernameStatus = useUsernameAvailability(username);

  useEffect(() => {
    if (usernameStatus === 'taken') {
      setError('username', { type: 'validate', message: t('fields.username.taken') });
    } else if (usernameStatus === 'invalid') {
      setError('username', { type: 'validate', message: t('fields.username.invalid') });
    } else if (usernameStatus === 'error') {
      setError('username', { type: 'validate', message: t('fields.username.checkError') });
    } else if (usernameStatus === 'available') {
      clearErrors('username');
    }
  }, [usernameStatus, setError, clearErrors, t]);

  const validatePasswordMatch = (value: string) => {
    return value === password || t('passwordsDontMatch');
  };

  const validatePasswordStrength = (value: string) => {
    const strength = calculatePasswordStrength(value);
    const { checks } = strength;

    if (!checks.minLength) return t('passwordStrength.minLength');

    return true;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack width={'full'} padding={7} gap={4}>
        <VStack width={'full'} align={'stretch'} gap={1}>
          <InputController
            label={t('fields.username.label')}
            placeholder={t('fields.username.placeholder')}
            control={control}
            name={'username'}
            rounded={'full'}
            isRequired={t('fields.username.required')}
          />

          {usernameStatus === 'checking' && (
            <HStack gap={2} paddingX={4} color={'fg.muted'} fontSize={'sm'}>
              <Spinner size={'xs'} />
              <Text>{t('fields.username.checking')}</Text>
            </HStack>
          )}

          {usernameStatus === 'available' && (
            <HStack gap={2} paddingX={4} color={'green.500'} fontSize={'sm'}>
              <LuCheck />
              <Text>{t('fields.username.available')}</Text>
            </HStack>
          )}
        </VStack>

        <InputController
          label={t('fields.email.label')}
          placeholder={t('fields.email.placeholder')}
          control={control}
          name={'email'}
          rounded={'full'}
          isRequired={t('fields.email.required')}
        />

        <InputController
          label={t('fields.password.label')}
          placeholder={t('fields.password.placeholder')}
          control={control}
          name={'password'}
          type={'password'}
          rounded={'full'}
          isPassword
          isRequired={t('fields.password.required')}
          rules={{
            validate: validatePasswordStrength,
          }}
        />

        <PasswordStrength password={password} />

        <InputController
          label={t('fields.confirmPassword.label')}
          placeholder={t('fields.confirmPassword.placeholder')}
          control={control}
          name={'confirmPassword'}
          type={'password'}
          rounded={'full'}
          isPassword
          isRequired={t('fields.confirmPassword.required')}
          rules={{
            validate: validatePasswordMatch,
          }}
        />

        <Button
          type='submit'
          disabled={loading || !formState.isValid || usernameStatus !== 'available'}
          width={'full'}
          rounded={'full'}
        >
          {t('signUp')}
        </Button>

        <div className='mt-6 mb-6 w-full'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t dark:border-gray-600'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white dark:bg-gray-800 text-gray-500'>{t('orMethods')}</span>
            </div>
          </div>
        </div>

        <HStack>
          <IconButton
            aria-label='Google'
            onClick={onGoogleSignIn}
            disabled={loading}
            variant={'outline'}
            rounded='full'
          >
            <BiLogoGoogle size={50} />
          </IconButton>
        </HStack>

        <div className='mt-6 text-center text-sm'>
          <Text>
            {t('haveAccount')}{' '}
            <Text
              as={'span'}
              onClick={onSwitchToLogin}
              cursor='pointer'
              _hover={{ textDecoration: 'underline' }}
            >
              {t('signIn')}
            </Text>
          </Text>
        </div>
      </VStack>

      {error && (
        <div className='p-3 mx-7 mb-4 bg-red-100 text-red-700 rounded-lg text-sm'>{error}</div>
      )}
    </form>
  );
};
