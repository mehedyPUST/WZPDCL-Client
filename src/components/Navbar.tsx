// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
    Home,
    LogIn,
    UserPlus,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    Phone,
    MapPin,
    ChevronDown,
    FileText,
    AlertCircle,
    Zap,
    Users,
    Info,
    Mail,
    CreditCard,
    MessageSquare,
    PlusCircle,
    Clock,
    BarChart3,
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon?: any;
    children?: NavItem[];
}

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await authClient.getSession();
                setUser(data?.user || null);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        try {
            await authClient.signOut();
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    // ✅ Role-based dashboard path
    const getDashboardPath = (role: string) => {
        const paths: Record<string, string> = {
            admin: '/dashboard/admin',
            xen: '/dashboard/xen',
            connection_wing: '/dashboard/connection_wing',
            complaint_manager: '/dashboard/complaint_manager',
            billing_wings: '/dashboard/billing_wings',
            consumer: '/dashboard/consumer',
        };
        return paths[role] || '/dashboard/consumer';
    };

    // ✅ Remove all links that don't exist - keep only home, login, register, dashboard
    const navItems: NavItem[] = [
        { id: 'home', label: 'Home', href: '/', icon: Home },
    ];

    const getRoleDisplay = (role: string) => {
        const roles: Record<string, string> = {
            admin: 'Admin',
            xen: 'XEN',
            connection_wing: 'Connection Wing',
            complaint_manager: 'Complaint Manager',
            billing_wings: 'Billing Wings',
            consumer: 'Consumer',
            applicant: 'Applicant',
        };
        return roles[role] || role;
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-500',
            xen: 'bg-blue-500',
            connection_wing: 'bg-orange-500',
            complaint_manager: 'bg-red-500',
            billing_wings: 'bg-teal-500',
            consumer: 'bg-emerald-500',
            applicant: 'bg-yellow-500',
        };
        return colors[role] || 'bg-gray-500';
    };

    return (
        <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xl font-bold">WZPDCL</span>
                        <span className="text-xs bg-yellow-400 text-emerald-900 px-2 py-0.5 rounded-full font-semibold hidden sm:inline">
                            S&D-1
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive(item.href)
                                            ? 'bg-emerald-800'
                                            : 'hover:bg-emerald-600'
                                        }`}
                                >
                                    {Icon && <Icon size={18} />}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* ✅ Auth Buttons - Role-Based Dashboard */}
                    <div className="hidden md:flex items-center space-x-3">
                        {!loading && !user ? (
                            // Not Logged In
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    <LogIn size={18} />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <UserPlus size={18} />
                                    <span>Register</span>
                                </Link>
                            </>
                        ) : user ? (
                            // Logged In - Role-Based Dashboard
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 border-r border-emerald-600 pr-3">
                                    <div className={`w-7 h-7 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-xs font-bold`}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-sm hidden xl:block">
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-emerald-300">{getRoleDisplay(user.role)}</p>
                                    </div>
                                </div>

                                {/* ✅ Role-Based Dashboard Link */}
                                <Link
                                    href={getDashboardPath(user.role)}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="w-20 h-8 bg-emerald-600/50 rounded-lg animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-emerald-600 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${isActive(item.href) ? 'bg-emerald-800' : 'hover:bg-emerald-600'
                                        }`}
                                >
                                    {Icon && <Icon size={18} />}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="border-t border-emerald-600 pt-2 space-y-2">
                            {!loading && !user ? (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-3 hover:bg-emerald-600 rounded-lg transition-colors"
                                    >
                                        <LogIn size={18} />
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                                    >
                                        <UserPlus size={18} />
                                        <span>Register</span>
                                    </Link>
                                </>
                            ) : user ? (
                                <>
                                    <div className="px-4 py-2 flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-sm font-bold`}>
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-emerald-300">{getRoleDisplay(user.role)}</p>
                                        </div>
                                    </div>

                                    {/* ✅ Role-Based Dashboard Link in Mobile Menu */}
                                    <Link
                                        href={getDashboardPath(user.role)}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-3 hover:bg-emerald-600 rounded-lg transition-colors"
                                    >
                                        <LayoutDashboard size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center space-x-2 px-4 py-3 w-full text-left hover:bg-emerald-600 rounded-lg transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="px-4 py-3 animate-pulse">
                                    <div className="h-8 bg-emerald-600/50 rounded-lg w-32" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;