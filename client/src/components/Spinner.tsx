import { debounce, sleep } from '@src/utils/debounce';
import { useEffect, useEffectEvent, useState, type ReactNode } from 'react';

interface SpinnerProps {
  load?: () => Promise<unknown>;
  refresh?: number;
  delay?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  children?: ReactNode;
}

const SIZES = {
  small: '1.25rem',
  medium: '2rem',
  large: '3rem',
} as const;

export default function Spinner({ load, refresh = 0, delay = 0, label, size = 'medium', children }: SpinnerProps) {
  const [completedRefresh, setCompletedRefresh] = useState<number | undefined>(undefined);
  const hasLoad = Boolean(load);

  const runLoad = useEffectEvent(() => Promise.all([load?.(), sleep(100)]));

  useEffect(() => {
    if (!hasLoad) return;

    let cancelled = false;

    const runner = debounce(async () => {
      await runLoad();
      if (!cancelled) setCompletedRefresh(refresh);
    }, delay);

    runner();

    return () => {
      cancelled = true;
      runner.cancel();
    };
  }, [hasLoad, delay, refresh]);

  if (completedRefresh === refresh) {
    return <>{children}</>;
  }

  return (
    <div className="spinner is-flex is-flex-direction-column is-justify-content-center is-align-items-center">
      <span className="loader" style={{ width: SIZES[size], height: SIZES[size], borderWidth: '3px' }} />
      {label && <p className="mt-2">{label}</p>}
    </div>
  );
}
