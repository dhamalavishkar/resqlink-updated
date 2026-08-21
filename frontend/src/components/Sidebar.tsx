import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Map,
  AlertTriangle,
  Users,
  Truck,
  ClipboardList,
  Settings
} from 'lucide-react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 overflow-hidden ${
    isActive
      ? 'bg-red-50 text-red-600'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export const Sidebar = () => {
  const { t } = useTranslation();
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex flex-col h-full px-3 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white flex-shrink-0 shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">ResQLink</span>
        </div>

        <nav className="space-y-1 flex-1">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{t('Overview', 'Overview')}</span>
          </NavLink>

          <NavLink to="/live-map" className={navLinkClass}>
            <Map className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{t('Live Incident Map', 'Live Incident Map')}</span>
          </NavLink>

          <NavLink to="/rescue-mesh" className={navLinkClass}>
            <Users className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{t('Rescue Mesh Network', 'Rescue Mesh')}</span>
          </NavLink>

          <NavLink to="/incident-reports" className={navLinkClass}>
            <ClipboardList className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Incident Reports</span>
          </NavLink>

          <NavLink to="/rescue-operations" className={navLinkClass}>
            <Truck className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{t('Rescue Operations', 'Rescue Operations')}</span>
          </NavLink>

          <NavLink to="/ai-briefing" className={navLinkClass}>
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">AI Briefing</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};