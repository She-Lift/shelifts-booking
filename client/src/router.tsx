import HomeRedirect from '@src/components/routing/HomeRedirect';
import { userContext } from '@src/context/router-context';
import { authMiddleware, requireAuth, requireRole } from '@src/middleware/auth-middleware';
import { createBrowserRouter } from 'react-router';
import App from './App';
import ErrorBoundary from './components/routing/ErrorBoundary';
import HydrateFallback from './components/routing/HydrateFallback';
import ProtectedRoute from './components/routing/ProtectedRoute';
import adminLoader from './loaders/admin-loader';
import Admin from './pages/Admin';
import Customer from './pages/Customer';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  {
    id: 'root',
    Component: App,
    loader: ({ context }) => ({ user: context.get(userContext) }),
    shouldRevalidate: ({ formMethod, defaultShouldRevalidate }) => Boolean(formMethod) || defaultShouldRevalidate,
    HydrateFallback: HydrateFallback,
    ErrorBoundary: ErrorBoundary,
    children: [
      { path: ROUTES.login, Component: Login },
      {
        middleware: [authMiddleware],
        children: [
          { path: ROUTES.home, Component: HomeRedirect },
          {
            Component: ProtectedRoute,
            middleware: [requireAuth],
            children: [
              {
                middleware: [requireRole('admin')],
                children: [{ path: ROUTES.admin, Component: Admin, loader: adminLoader }],
              },
              {
                middleware: [requireRole('customer')],
                children: [{ path: ROUTES.customer, Component: Customer }],
              },
              {
                children: [{ path: '*', Component: NotFound }],
              },
            ],
          },
        ],
      },
    ],
  },
]);
