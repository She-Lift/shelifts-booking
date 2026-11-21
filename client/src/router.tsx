import { createBrowserRouter } from 'react-router';
import App from './App';

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import Customer from "./pages/Customer";
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Login,
      },
      {
        element: <ProtectedRoute allowedRole="admin" />,
        children: [
          {
            path: "admin",
            Component: Admin
          },
          {
            path: "*",
            Component: NotFound,
          },
        ]
      },
      {
        element: <ProtectedRoute allowedRole="customer" />,
        children: [
          {
            path: "customer",
            Component: Customer
          },
          {
            path: "*",
            Component: Login,
          },
        ]
      },
      {
        path: '*',
        Component: NotFound,
      },
    ],
  },
]);
