import { useNow } from './useNow';

const pad = (value) => String(value).padStart(2, '0');

export const useCountdown = (expiresAt) => {
  const now = useNow(1000);
  const target = expiresAt ? new Date(expiresAt).getTime() : 0;
  const secondsLeft = target ? Math.max(0, Math.ceil((target - now) / 1000)) : 0;

  return {
    secondsLeft,
    isExpired: Boolean(target) && secondsLeft === 0,
    label: `${pad(Math.floor(secondsLeft / 60))}:${pad(secondsLeft % 60)}`,
  };
};
