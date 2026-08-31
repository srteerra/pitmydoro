'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { BiLogoGoogle } from 'react-icons/bi';
import { InputController } from '@/components/Form/InputController';
import { useTranslations } from 'next-intl';
import { DefaultSignInFields } from '@/constants/DefaultFields';

interface LoginFormInputs {
  email: string;
  password: string;
}

interface Props {
  onSubmit: (data: LoginFormInputs) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onSwitchToRegister: () => void;
  loading: boolean;
  error: string;
}

export const LoginForm = ({
  onSubmit,
  onGoogleSignIn,
  onSwitchToRegister,
  loading,
  error,
}: Props) => {
  const t = useTranslations('auth');
  const { control, handleSubmit, formState } = useForm<LoginFormInputs>({
    mode: 'onChange',
    defaultValues: DefaultSignInFields,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack width={'full'} padding={7} gap={4}>
        <InputController
          label={t('fields.email.label')}
          placeholder={t('fields.email.placeholder')}
          control={control}
          name={'email'}
          isRequired
          rounded={'full'}
        />

        <InputController
          isPassword
          label={t('fields.password.label')}
          placeholder={t('fields.password.placeholder')}
          control={control}
          name={'password'}
          rounded={'full'}
          isRequired
        />

        {error && (
          <Alert.Root status='error'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        )}

        <Button
          type='submit'
          disabled={loading || !formState.isValid}
          width={'full'}
          rounded={'full'}
        >
          {t('signIn')}
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
            {t('noAccount')}{' '}
            <Text
              as={'span'}
              onClick={onSwitchToRegister}
              cursor='pointer'
              _hover={{ textDecoration: 'underline' }}
            >
              {t('createAccount')}
            </Text>
          </Text>
        </div>
      </VStack>
    </form>
  );
};
