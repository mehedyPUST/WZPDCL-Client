// components/DashboardNavbar.tsx
'use client';

import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';

interface NavbarProps {
  user: any;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function DashboardNavbar({ user, toggleSidebar, sidebarOpen }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-48"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center space-x-3 border-l pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}