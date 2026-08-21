import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, Menu, X, WifiOff, Zap, Users, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface NetworkStatus {
  internet: boolean;
  mesh: boolean;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Mock network status - in real app, this would come from a store or context
  const networkStatus: NetworkStatus = {
    internet: true,
    mesh: false
  };

  return (
    <header className="glass border-b [border-color:var(--color-border)/30%] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-[var(--color-primary)]">
              ResQLink
            </Link>
          </div>
          <div className="hidden sm:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Navigation links would go here */}
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:items-center sm:justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Menu button for mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-[var(--color-secondary)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)/30%] hover-shadow transition-all duration-200"
              aria-label="Open main menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Network status */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center">
                <WifiOff className={networkStatus.internet ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'} h-4 w-4 />
                <span className="ml-1 text-[var(--color-text)]">Internet: {networkStatus.internet ? 'Online' : 'Offline'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <select
                className="bg-[var(--color-background)/50%] border border-[var(--color-border)/50%] text-[var(--color-text)] text-sm rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block p-1.5 backdrop-blur-sm"
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language}
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </div>
            {/* User profile and notifications */}
            <div className="relative">
              <button className="p-1 rounded-md hover:bg-[var(--color-primary)/10%] focus:outline-none focus:ring-2 focus-ring-[var(--color-primary)/30%] hover-shadow transition-all duration-200">
                <Bell className="h-5 w-5 text-[var(--color-secondary)] hover:text-[var(--color-primary)]" />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 p-1 rounded-md hover:bg-[var(--color-primary)/10%] focus:outline-none focus:ring-2 focus-ring-[var(--color-primary)/30%] hover-shadow transition-all duration-200">
                <span className="hidden sm:block text-[var(--color-text)]">Admin</span>
                <Users className="h-5 w-5 text-[var(--color-secondary)] hover:text-[var(--color-primary)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile menu items */}
          </div>
        </div>
      )}
    </header>
  );
};