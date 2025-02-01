import type { History } from 'history';

export const delayedNavigate = (
  history: History,
  path: string,
  delay: number = 1000,
): void => {
  setTimeout(() => {
    history.push(path);
  }, delay);
};
