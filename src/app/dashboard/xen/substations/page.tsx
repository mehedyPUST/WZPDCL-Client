// app/dashboard/xen/substations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    Zap,
    Phone,
    Mail,
    Map,
    Activity,
    Gauge,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    Power,
    ArrowUpRight,
    ArrowDownRight,
    Building,
    HardDrive,
    Calendar,
    X,
    Filter,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Substation {
    id: string;
    name: string;
    location: string;
    capacity: string;
    voltage: string;
    contactNumber: string;
    address: string;
    status: 'active' | 'inactive' | 'maintenance';
    type: 'grid' | 'distribution' | 'transformer';
    installedCapacity: number;
    peakLoad: number;
    numberOfFeeders: number;
    lastMaintenance: string;
    createdAt: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, icon, bgColor, change, trend }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                {change && (
                    <p className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' :
                        trend === 'down' ? 'text-red-600' :
                            'text-gray-500'
                        }`}>
                        {trend === 'up' && <ArrowUpRight size={14} className="mr-1" />}
                        {trend === 'down' && <ArrowDownRight size={14} className="mr-1" />}
                        {change}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default function XenSubstationsPage() {
    const [substations, setSubstations] = useState<Substation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        maintenance: 0,
        totalCapacity: 0,
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        fetchSubstations();
    }, []);

    const fetchSubstations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/admin/substations`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                }
            );

            let data;
            if (response.ok) {
                data = await response.json();
                if (data.data && data.data.length > 0) {
                    setSubstations(data.data);
                    updateStats(data.data);
                    setLoading(false);
                    return;
                }
            }

            // Mock data fallback
            const mockData = getMockSubstations();
            setSubstations(mockData);
            updateStats(mockData);
        } catch (error) {
            console.error('Error fetching substations:', error);
            const mockData = getMockSubstations();
            setSubstations(mockData);
            updateStats(mockData);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data: Substation[]) => {
        const total = data.length;
        const active = data.filter(s => s.status === 'active').length;
        const maintenance = data.filter(s => s.status === 'maintenance').length;
        const totalCapacity = data.reduce((sum, s) => sum + s.installedCapacity, 0);

        setStats({ total, active, maintenance, totalCapacity });
    };

    const getMockSubstations = (): Substation[] => {
        return [
            {
                id: '1',
                name: 'Trimohoni Grid Substation',
                location: 'Trimohoni, Kushtia',
                capacity: '50 MVA',
                voltage: '132/33 kV',
                contactNumber: '+880 1712-345678',
                address: 'Trimohoni Road, Kushtia Sadar, Kushtia',
                status: 'active',
                type: 'grid',
                installedCapacity: 50,
                peakLoad: 42,
                numberOfFeeders: 6,
                lastMaintenance: '2026-06-15',
                createdAt: '2020-03-10',
                latitude: 23.901,
                longitude: 89.120,
            },
            {
                id: '2',
                name: 'Circuit-Hose Distribution Substation',
                location: 'Circuit-Hose, Kushtia',
                capacity: '25 MVA',
                voltage: '33/11 kV',
                contactNumber: '+880 1712-345679',
                address: 'Circuit-Hose Area, Kushtia',
                status: 'active',
                type: 'distribution',
                installedCapacity: 25,
                peakLoad: 20,
                numberOfFeeders: 4,
                lastMaintenance: '2026-06-20',
                createdAt: '2021-06-15',
                latitude: 23.905,
                longitude: 89.125,
            },
            {
                id: '3',
                name: 'DC-Court Transformer Station',
                location: 'DC-Court, Kushtia',
                capacity: '10 MVA',
                voltage: '11/0.4 kV',
                contactNumber: '+880 1712-345680',
                address: 'DC-Court Road, Kushtia',
                status: 'maintenance',
                type: 'transformer',
                installedCapacity: 10,
                peakLoad: 8,
                numberOfFeeders: 3,
                lastMaintenance: '2026-07-01',
                createdAt: '2022-01-20',
                latitude: 23.910,
                longitude: 89.130,
            },
            {
                id: '4',
                name: 'N.S-Road Distribution Substation',
                location: 'N.S-Road, Kushtia',
                capacity: '20 MVA',
                voltage: '33/11 kV',
                contactNumber: '+880 1712-345681',
                address: 'N.S-Road, Kushtia',
                status: 'active',
                type: 'distribution',
                installedCapacity: 20,
                peakLoad: 16,
                numberOfFeeders: 5,
                lastMaintenance: '2026-06-10',
                createdAt: '2021-09-05',
                latitude: 23.895,
                longitude: 89.115,
            },
            {
                id: '5',
                name: 'Kushtia Grid Substation',
                location: 'Kushtia Sadar, Kushtia',
                capacity: '75 MVA',
                voltage: '132/33 kV',
                contactNumber: '+880 1712-345682',
                address: 'Kushtia Sadar, Kushtia',
                status: 'active',
                type: 'grid',
                installedCapacity: 75,
                peakLoad: 60,
                numberOfFeeders: 8,
                lastMaintenance: '2026-05-28',
                createdAt: '2019-11-15',
                latitude: 23.890,
                longitude: 89.110,
            },
            {
                id: '6',
                name: 'Daulatpur Substation',
                location: 'Daulatpur, Kushtia',
                capacity: '15 MVA',
                voltage: '33/11 kV',
                contactNumber: '+880 1712-345683',
                address: 'Daulatpur, Kushtia',
                status: 'inactive',
                type: 'distribution',
                installedCapacity: 15,
                peakLoad: 10,
                numberOfFeeders: 3,
                lastMaintenance: '2026-04-15',
                createdAt: '2022-08-10',
                latitude: 23.885,
                longitude: 89.105,
            },
        ];
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            active: { color: 'bg-green-100 text-green-700', label: 'Active', icon: CheckCircle },
            inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive', icon: AlertCircle },
            maintenance: { color: 'bg-yellow-100 text-yellow-700', label: 'Maintenance', icon: Clock },
        };
        return statuses[status] || statuses.inactive;
    };

    const getTypeBadge = (type: string) => {
        const types: Record<string, { color: string; label: string; icon: any }> = {
            grid: { color: 'bg-purple-100 text-purple-700', label: 'Grid', icon: Zap },
            distribution: { color: 'bg-blue-100 text-blue-700', label: 'Distribution', icon: MapPin },
            transformer: { color: 'bg-orange-100 text-orange-700', label: 'Transformer', icon: Activity },
        };
        return types[type] || types.distribution;
    };

    const filteredSubstations = substations.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
        const matchesType = filterType === 'all' || sub.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredSubstations.length / ITEMS_PER_PAGE);
    const paginatedSubstations = filteredSubstations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const statCards = [
        { title: 'Total Substations', value: stats.total, icon: MapPin, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Active', value: stats.active, icon: CheckCircle, bgColor: 'bg-green-100', change: `${stats.active} operational`, trend: 'up' as const },
        { title: 'Maintenance', value: stats.maintenance, icon: Clock, bgColor: 'bg-yellow-100', change: `${stats.maintenance} in maintenance`, trend: 'down' as const },
        { title: 'Total Capacity', value: `${stats.totalCapacity} MVA`, icon: Gauge, bgColor: 'bg-purple-100', change: '', trend: 'neutral' as const },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <MapPin size={24} className="text-emerald-600" />
                        <span>Substations</span>
                    </h1>
                    <p className="text-gray-500 text-sm">View and manage all substations</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchSubstations}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                                }`}
                        >
                            List
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, location, or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="grid">Grid</option>
                            <option value="distribution">Distribution</option>
                            <option value="transformer">Transformer</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterType('all');
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Substations Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedSubstations.map((sub) => {
                        const StatusBadge = getStatusBadge(sub.status);
                        const TypeBadge = getTypeBadge(sub.type);
                        const StatusIcon = StatusBadge.icon;

                        return (
                            <div
                                key={sub.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group"
                            >
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <MapPin size={24} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                                                    {sub.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{sub.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center space-x-2">
                                            <Gauge size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{sub.capacity}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Zap size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{sub.voltage}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{sub.numberOfFeeders} Feeders</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Activity size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{sub.peakLoad} MW</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${StatusBadge.color}`}>
                                            <StatusIcon size={12} />
                                            <span>{StatusBadge.label}</span>
                                        </span>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${TypeBadge.color}`}>
                                            {TypeBadge.label}
                                        </span>
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                            Last: {sub.lastMaintenance}
                                        </span>
                                    </div>
                                </div>

                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Created: {sub.createdAt}</span>
                                    <button
                                        onClick={() => {
                                            setSelectedSubstation(sub);
                                            setShowDetailsModal(true);
                                        }}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                                    >
                                        <span>View Details</span>
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedSubstations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No substations found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubstations.map((sub) => {
                                        const StatusBadge = getStatusBadge(sub.status);
                                        const TypeBadge = getTypeBadge(sub.type);
                                        const StatusIcon = StatusBadge.icon;

                                        return (
                                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{sub.location}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${TypeBadge.color}`}>
                                                        {TypeBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{sub.capacity}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                        <StatusIcon size={12} />
                                                        <span>{StatusBadge.label}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSubstation(sub);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubstations.length)} of {filteredSubstations.length} substations
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === page
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedSubstation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <MapPin size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Substation Details</h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="text-sm font-medium">{selectedSubstation.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedSubstation.status).color}`}>
                                        {getStatusBadge(selectedSubstation.status).label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm font-medium">{selectedSubstation.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Type</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(selectedSubstation.type).color}`}>
                                        {getTypeBadge(selectedSubstation.type).label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Capacity</p>
                                    <p className="text-sm font-medium">{selectedSubstation.capacity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Voltage</p>
                                    <p className="text-sm font-medium">{selectedSubstation.voltage}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Installed Capacity</p>
                                    <p className="text-sm font-medium">{selectedSubstation.installedCapacity} MVA</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Peak Load</p>
                                    <p className="text-sm font-medium">{selectedSubstation.peakLoad} MW</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Feeders</p>
                                    <p className="text-sm font-medium">{selectedSubstation.numberOfFeeders}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Contact</p>
                                    <p className="text-sm font-medium">{selectedSubstation.contactNumber}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium">{selectedSubstation.address}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Maintenance</p>
                                    <p className="text-sm font-medium">{selectedSubstation.lastMaintenance}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="text-sm font-medium">{selectedSubstation.createdAt}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                                    View on Map
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}