import HomeRedirect from '@src/components/routing/HomeRedirect';
import { createBrowserRouter } from 'react-router';
import App from './App';
import ErrorBoundary from './components/routing/ErrorBoundary';
import HydrateFallback from './components/routing/HydrateFallback';
import ProtectedRoute from './components/routing/ProtectedRoute';
import adminLoader from './loaders/admin-loader';
import rootLoader from './loaders/root-loader';
import Admin from './pages/Admin';
import Customer from './pages/Customer';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    id: 'root',
    Component: App,
    loader: rootLoader,
    shouldRevalidate: ({ formMethod }) => Boolean(formMethod),
    HydrateFallback: HydrateFallback,
    ErrorBoundary: ErrorBoundary,
    children: [
      { path: '/', Component: HomeRedirect },
      { path: '/login', Component: Login },
      {
        element: <ProtectedRoute allowedRole="admin" />,
        children: [{ path: 'admin', Component: Admin, loader: adminLoader }],
      },
      {
        element: <ProtectedRoute allowedRole="customer" />,
        children: [{ path: 'customer', Component: Customer }],
      },
      { path: '*', Component: NotFound },
    ],
  },
]);
