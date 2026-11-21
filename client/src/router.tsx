import { createBrowserRouter } from 'react-router';
import App from './App';

import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import Customer from './pages/Customer';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import { Navigate } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        Component: Login,
      },
      {
        element: <ProtectedRoute allowedRole="admin" />,
        children: [
          {
            path: 'admin',
            Component: Admin,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRole="customer" />,
        children: [
          {
            path: 'customer',
            Component: Customer,
          },
        ],
      },
      {
        path: '*',
        Component: NotFound,
      },
    ],
  },
]);
