// components/DashboardSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  User,
  FileText,
  AlertCircle,
  Zap,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  BarChart3,
  MapPin,
  ClipboardList,
  Home,
  DollarSign,
} from 'lucide-react';

interface SidebarProps {
  user: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pathname: string;
}

export default function DashboardSidebar({ user, isOpen, setIsOpen, pathname }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✅ Navigation items based on role
  const getNavItems = () => {
    const roleItems: Record<string, any[]> = {
      admin: [
        { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/admin/users', label: 'Users', icon: Users },
        { href: '/dashboard/admin/substations', label: 'Substations', icon: MapPin },
        { href: '/dashboard/admin/reports', label: 'Reports', icon: BarChart3 },
        { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
      ],
      xen: [
        { href: '/dashboard/xen', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/xen/substations', label: 'Substations', icon: MapPin },
        { href: '/dashboard/xen/new-connection-applications', label: 'New Connections', icon: FileText },
        { href: '/dashboard/xen/all-transactions', label: 'All Transactions', icon: AlertCircle },
        { href: '/dashboard/xen/profile', label: 'Profile', icon: User },
      ],
      connection_wing: [
        { href: '/dashboard/connection_wing', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/connection_wing/new-connections', label: 'New Connections', icon: Zap },
        { href: '/dashboard/connection_wing/completed', label: 'Completed Connections', icon: CheckCircle },
        { href: '/dashboard/connection_wing/add-meter', label: 'Add Meter', icon: PlusCircle },
        { href: '/dashboard/connection_wing/profile', label: 'Profile', icon: User },
      ],
      complaint_manager: [
        { href: '/dashboard/complaint_manager', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/complaint_manager/complaints/pending', label: 'Pending Complaints', icon: AlertCircle },
        { href: '/dashboard/complaint_manager/complaints/all', label: 'All Complaints', icon: FileText },
        { href: '/dashboard/complaint_manager/profile', label: 'Profile', icon: User },
      ],
      billing_wings: [
        { href: '/dashboard/billing_wings', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/billing_wings/all-bills', label: 'All Bills', icon: ClipboardList },
        { href: '/dashboard/billing_wings/generate-bills', label: 'Generate Bills', icon: FileText },
        { href: '/dashboard/billing_wings/profile', label: 'Profile', icon: User },
      ],
      // ✅ Consumer role - only one entry
      consumer: [
        { href: '/dashboard/consumer', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/consumer/my-bills', label: 'My Bills', icon: FileText },
        { href: '/dashboard/consumer/my-complaints', label: 'Complaints', icon: AlertCircle },
        { href: '/dashboard/consumer/new-connection', label: 'New Connection', icon: PlusCircle },
        { href: '/dashboard/consumer/my-connections', label: 'My Connections', icon: PlusCircle },
        { href: '/dashboard/consumer/profile', label: 'Profile', icon: User },
      ],
    };

    return roleItems[user?.role] || roleItems.consumer || [];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    // ✅ Check for dashboard home pages
    if (href === '/dashboard/admin' || href === '/dashboard/xen' ||
      href === '/dashboard/connection_wing' || href === '/dashboard/complaint_manager' ||
      href === '/dashboard/billing_wings' || href === '/dashboard/consumer') {
      return pathname === href;
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-emerald-800 text-white z-50 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-emerald-700">
          <Link href="/" className="flex items-center space-x-2 overflow-hidden">
            <span className="text-2xl font-bold whitespace-nowrap">WZPDCL</span>
            {isOpen && (
              <span className="text-xs bg-yellow-400 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                S&D-1
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-emerald-700 transition-colors hidden lg:block"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-emerald-700 ${!isOpen && 'text-center'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-emerald-300 truncate">{user?.email}</p>
                <p className="text-xs text-emerald-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${active
                  ? 'bg-emerald-700 text-white'
                  : 'hover:bg-emerald-700/50 text-emerald-100'
                  }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-emerald-700/50 text-emerald-100 transition-colors w-full ${!isOpen && 'justify-center'
              }`}
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}