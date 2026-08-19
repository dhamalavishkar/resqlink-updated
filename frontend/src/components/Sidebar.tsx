import { NavLink } from 'react-router-dom';
import {
  Home,
  Map,
  Camera,
  AlertTriangle,
  Users,
  Truck,
  ClipboardList,
  Settings
} from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full px-3 pt-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white flex-shrink-0">
            <Home className="h-5 w-5" />
          </div>
          <span className="font-semibold text-gray-900">ResQLink</span>
        </div>
        <nav className="mt-6 space-y-2 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            Overview
          </NavLink>
          <NavLink
            to="/live-map"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Map className="h-5 w-5 flex-shrink-0" />
            Live Map
          </NavLink>
          <NavLink
            to="/ai-vision"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Camera className="h-5 w-5 flex-shrink-0" />
            AI Vision
          </NavLink>
          <NavLink
            to="/risk-analysis"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            Risk Analysis
          </NavLink>
          <NavLink
            to="/rescue-mesh"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            Rescue Mesh
          </NavLink>
          <NavLink
            to="/incident-reports"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <ClipboardList className="h-5 w-5 flex-shrink-0" />
            Incident Reports
          </NavLink>
          <NavLink
            to="/rescue-operations"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Truck className="h-5 w-5 flex-shrink-0" />
            Rescue Operations
          </NavLink>
          <NavLink
            to="/ai-briefing"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            AI Briefing
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};