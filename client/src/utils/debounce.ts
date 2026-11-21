export function debounce<T extends (...args: never[]) => void>(cb: T, wait = 300) {
  let timeout = 0;

  const callable = (...args: Parameters<T>) => {
    if (timeout) window.clearTimeout(timeout);
    if (!wait) {
      cb(...args);
      return;
    }
    timeout = window.setTimeout(() => cb(...args), wait);
  };

  callable.cancel = () => {
    if (timeout) window.clearTimeout(timeout);
  };

  return callable;
}

export const sleep = (wait = 300) => new Promise<void>((resolve) => window.setTimeout(resolve, wait));
