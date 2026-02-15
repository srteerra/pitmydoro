'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { MdLogin } from 'react-icons/md';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { UserMenu } from './UserMenu';
import { useTranslations } from 'use-intl';
import { useAlert } from '@/hooks/useAlert';

type AuthMode = 'login' | 'register';

export const AuthModal = () => {
  const { signIn, signUp, signInWithGoogle, user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { toastSuccess, toastError } = useAlert();
  const t = useTranslations('auth');

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      await signIn(data.email, data.password);
      setShowModal(false);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: { username?: string; email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      await signUp(data.email, data.password);
      toastSuccess(t('registerComplete.title'), t('registerComplete.description'));
      setShowModal(false);
    } catch (err: any) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      setShowModal(false);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      toastError(t('googleSignInError'));
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    setAuthMode('register');
    setError('');
  };

  const switchToLogin = () => {
    setAuthMode('login');
    setError('');
  };

  const getErrorMessage = (err: any): string => {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': t('firebaseErrors.emailAlreadyInUse'),
      'auth/invalid-email': t('firebaseErrors.invalidEmail'),
      'auth/weak-password': t('firebaseErrors.weakPassword'),
      'auth/user-not-found': t('firebaseErrors.userNotFound'),
      'auth/wrong-password': t('firebaseErrors.wrongPassword'),
      'auth/invalid-credential': t('firebaseErrors.invalidCredentials'),
    };

    return errorMessages[err.code] || t('authError');
  };

  if (user) {
    return <UserMenu user={user} onLogout={logout} />;
  }

  return (
    <Dialog.Root
      key={'auth-modal'}
      size={'lg'}
      open={showModal}
      onExitComplete={() => setAuthMode('login')}
    >
      <Dialog.Trigger asChild>
        <Button borderRadius={'full'} onClick={() => setShowModal(true)}>
          <MdLogin /> {t('join')}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius={'2xl'}>
            <Dialog.Header>
              <Dialog.Title>{authMode === 'login' ? t('signIn') : t('signUp')}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {authMode === 'login' ? (
                <LoginForm
                  onSubmit={handleLogin}
                  onGoogleSignIn={handleGoogleSignIn}
                  onSwitchToRegister={switchToRegister}
                  loading={loading}
                  error={error}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleRegister}
                  onGoogleSignIn={handleGoogleSignIn}
                  onSwitchToLogin={switchToLogin}
                  loading={loading}
                  error={error}
                />
              )}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild onClick={() => setShowModal(false)}>
              <CloseButton size='sm' />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
