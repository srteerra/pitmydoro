import { useEffect, useRef, useState } from 'react';
import { userService } from '@/services/user.service';

export type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken' | 'error';

export function useUsernameAvailability(
  username: string,
  check: (username: string) => Promise<boolean> = userService.isUsernameAvailable,
  delay = 450
): UsernameStatus {
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const requestId = useRef(0);

  useEffect(() => {
    const value = (username || '').trim();

    if (!value) {
      setStatus('idle');
      return;
    }

    if (!userService.isValidUsername(value)) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    const currentRequest = ++requestId.current;

    const handler = setTimeout(async () => {
      try {
        const available = await check(value);
        if (currentRequest !== requestId.current) return;
        setStatus(available ? 'available' : 'taken');
      } catch {
        if (currentRequest !== requestId.current) return;
        setStatus('error');
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [username, check, delay]);

  return status;
}
