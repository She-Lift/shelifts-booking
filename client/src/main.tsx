import { StrictMode } from 'react';
import { createRoot, type ErrorInfo } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { toast } from 'sonner';
import { router } from './router';

import { HttpError, HttpStatus } from '@src/services/http-service';
import { Toaster } from 'sonner';
import './assets/index.scss';
import { GlobalProvider } from './context/GlobalProvider';

function globalErrorHandler(error: unknown, info?: ErrorInfo) {
  if (info?.componentStack) {
    console.error(error, info.componentStack);
  } else {
    console.error(error);
  }

  if (error instanceof HttpError && error.status === HttpStatus.Unauthorized) {
    toast.error('Din session har gått ut. Vänligen logga in igen.', { id: 'auth-expired' });
    window.dispatchEvent(new Event('auth:unauthorized'));
    return;
  }

  toast.error('Något gick fel, vänligen försök igen senare.', { id: 'global-error' });
}

window.addEventListener('error', (event) => {
  event.preventDefault();
  globalErrorHandler(event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  globalErrorHandler(event.reason);
});

createRoot(document.getElementById('root')!, { onUncaughtError: globalErrorHandler }).render(
  <StrictMode>
    <Toaster position="top-right" richColors />
    <GlobalProvider>
      <RouterProvider router={router} />
    </GlobalProvider>
  </StrictMode>,
);
