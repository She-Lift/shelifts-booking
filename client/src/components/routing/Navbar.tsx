import Icon from '@src/components/generic/Icon';
import { useGlobalContext } from '@src/context/global-context';
import { NavLink } from 'react-router';

export type UserRole = 'customer' | 'admin';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  to: string;
  end?: boolean;
}

const ROLE_ITEMS: Record<UserRole, NavItem[]> = {
  customer: [
    { id: 'home', label: 'Home', icon: 'home', to: '/', end: true },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month', to: '/bookings' },
    { id: 'passes', label: 'Passes', icon: 'confirmation_number', to: '/passes' },
    { id: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/admin', end: true },
    { id: 'schedule', label: 'Schedule', icon: 'event_note', to: '/admin/schedule' },
    { id: 'members', label: 'Members', icon: 'group', to: '/admin/members' },
    { id: 'settings', label: 'Settings', icon: 'settings', to: '/admin/settings' },
  ],
};

export default function Navbar() {
  const { user } = useGlobalContext();

  if (!user) return undefined;

  const items = ROLE_ITEMS[user.role];

  return (
    <nav className="navbar is-fixed-bottom app-navbar" role="navigation">
      <div className="container is-max-desktop is-flex">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `navbar-item is-flex is-justify-content-center is-align-items-center is-flex-grow-1 ${
                isActive ? 'is-active' : ''
              }`
            }
          >
            <span className="nav-content is-flex is-flex-direction-column is-align-items-center">
              <Icon name={item.icon} />
              <span className="is-size-7">{item.label}</span>
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
