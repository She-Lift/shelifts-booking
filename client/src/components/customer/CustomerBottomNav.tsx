import Icon from '@src/components/generic/Icon';

export type CustomerTab = 'overview' | 'workouts' | 'bookings' | 'cards';

interface CustomerBottomNavProps {
  activeTab: CustomerTab;
  onNavigate: (tab: CustomerTab) => void;
}

const items: { tab: CustomerTab; label: string; icon: string }[] = [
  { tab: 'overview', label: 'Översikt', icon: 'home' },
  { tab: 'workouts', label: 'Boka pass', icon: 'calendar_month' },
  { tab: 'bookings', label: 'Bokningar', icon: 'event_available' },
  { tab: 'cards', label: 'Klippkort', icon: 'sell' },
];

export default function CustomerBottomNav({ activeTab, onNavigate }: CustomerBottomNavProps) {
  return (
    <nav className="customer-bottom-nav" aria-label="Kundmeny">
      {items.map(({ tab, label, icon }) => (
        <button
          key={tab}
          type="button"
          className={`customer-bottom-nav__item ${activeTab === tab ? 'is-active' : ''}`}
          aria-current={activeTab === tab ? 'page' : undefined}
          onClick={() => onNavigate(tab)}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
