// app/dashboard/connection_wing/all-consumers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    RefreshCw,
    Loader2,
    User,
    Phone,
    Mail,
    Home,
    MapPin,
    CreditCard,
    Zap,
    Building,
    Package,
    Filter,
    X,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    FileText,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    UserPlus,
    Shield,
    ClipboardCheck,
    List,
    Hash,
    Factory,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Consumer {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    meterNo: string;
    meterSerialNo?: string;
    meterType?: string;
    manufacturer?: string;
    feederName: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    isActive: boolean;
    isClaimed: boolean;
    isRegistered: boolean;
    claimedBy?: string;
    claimedAt?: string;
    registeredBy?: string;
    registeredAt?: string;
    userId?: string;
    createdAt: string;
    updatedAt: string;
    totalBills?: number;
    totalPaid?: number;
    totalDue?: number;
    status?: string;
    meters?: string[];
    meterDetails?: any[];
}

interface StatusBadge {
    label: string;
    color: string;
    icon: any;
}

export default function ConnectionWingAllConsumersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [consumers, setConsumers] = useState<Consumer[]>([]);
    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRegistration, setFilterRegistration] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        residential: 0,
        commercial: 0,
        industrial: 0,
        claimed: 0,
        unclaimed: 0,
        registered: 0,
        pending: 0,
        totalMeters: 0,
    });
    const [user, setUser] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedConsumer, setExpandedConsumer] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await authClient.getSession();
                setUser(data?.user || null);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchConsumers();
        }
    }, [user]);

    const fetchConsumers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(
                `${API_URL}/api/billing/consumers/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch consumers');
            }

            const data = await response.json();

            if (data.success && data.data) {
                const consumersData = data.data;

                if (consumersData.length === 0) {
                    setConsumers([]);
                    setStats({
                        total: 0,
                        active: 0,
                        inactive: 0,
                        residential: 0,
                        commercial: 0,
                        industrial: 0,
                        claimed: 0,
                        unclaimed: 0,
                        registered: 0,
                        pending: 0,
                        totalMeters: 0,
                    });
                    setError('No consumers found in the system.');
                    setLoading(false);
                    return;
                }

                const processedConsumers = consumersData.map((consumer: any) => ({
                    ...consumer,
                    id: consumer._id || consumer.id,
                    _id: consumer._id || consumer.id,
                    name: consumer.name || 'Unknown Consumer',
                    email: consumer.email || '',
                    mobile: consumer.mobile || '',
                    nidNo: consumer.nidNo || '',
                    address: consumer.address || '',
                    meterNo: consumer.meterNo || 'N/A',
                    meterSerialNo: consumer.meterSerialNo || '',
                    meterType: consumer.meterType || '',
                    manufacturer: consumer.manufacturer || '',
                    feederName: consumer.feederName || 'N/A',
                    consumerType: consumer.consumerType || 'residential',
                    isActive: consumer.isActive !== undefined ? consumer.isActive : true,
                    isClaimed: consumer.isClaimed || false,
                    isRegistered: consumer.isRegistered || false,
                    claimedBy: consumer.claimedBy || null,
                    claimedAt: consumer.claimedAt || null,
                    registeredBy: consumer.registeredBy || null,
                    registeredAt: consumer.registeredAt || null,
                    userId: consumer.userId || null,
                    status: consumer.isRegistered ? 'Registered' : 'Pending',
                    meters: consumer.meters || (consumer.meterNo && consumer.meterNo !== 'N/A' ? [consumer.meterNo] : []),
                    meterDetails: consumer.meterDetails || [],
                }));

                setConsumers(processedConsumers);
                updateStats(processedConsumers);
                setError(null);
            } else {
                throw new Error(data.message || 'No consumer data received');
            }

        } catch (error: any) {
            console.error('❌ Error fetching consumers:', error);
            setError(error.message || 'Failed to load consumers');
            setConsumers([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (consumersData: Consumer[]) => {
        const total = consumersData.length;
        const active = consumersData.filter(c => c.isActive).length;
        const inactive = consumersData.filter(c => !c.isActive).length;
        const residential = consumersData.filter(c => c.consumerType === 'residential').length;
        const commercial = consumersData.filter(c => c.consumerType === 'commercial').length;
        const industrial = consumersData.filter(c => c.consumerType === 'industrial').length;
        const claimed = consumersData.filter(c => c.isClaimed).length;
        const unclaimed = consumersData.filter(c => !c.isClaimed).length;
        const registered = consumersData.filter(c => c.isRegistered).length;
        const pending = consumersData.filter(c => !c.isRegistered).length;

        let totalMeters = 0;
        consumersData.forEach(c => {
            if (c.meters && c.meters.length > 0) {
                totalMeters += c.meters.length;
            } else if (c.meterNo && c.meterNo !== 'N/A') {
                totalMeters += 1;
            }
        });

        setStats({
            total,
            active,
            inactive,
            residential,
            commercial,
            industrial,
            claimed,
            unclaimed,
            registered,
            pending,
            totalMeters,
        });
    };

    const getConsumerTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const getConsumerTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            residential: 'bg-blue-100 text-blue-700',
            commercial: 'bg-purple-100 text-purple-700',
            industrial: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getConsumerStatus = (consumer: Consumer): StatusBadge => {
        if (consumer.isRegistered && consumer.isClaimed) {
            return {
                label: 'Registered',
                color: 'bg-green-100 text-green-700',
                icon: CheckCircle
            };
        } else if (consumer.isClaimed && !consumer.isRegistered) {
            return {
                label: 'Claimed (Not Reg)',
                color: 'bg-yellow-100 text-yellow-700',
                icon: Clock
            };
        } else if (consumer.isRegistered && !consumer.isClaimed) {
            return {
                label: 'Registered (Not Claimed)',
                color: 'bg-blue-100 text-blue-700',
                icon: UserCheck
            };
        } else {
            return {
                label: 'Pending',
                color: 'bg-gray-100 text-gray-700',
                icon: AlertCircle
            };
        }
    };

    const handleViewDetails = (consumer: Consumer) => {
        setSelectedConsumer(consumer);
        setShowDetailsModal(true);
    };

    const toggleExpand = (consumerId: string) => {
        if (expandedConsumer === consumerId) {
            setExpandedConsumer(null);
        } else {
            setExpandedConsumer(consumerId);
        }
    };

    const filteredConsumers = consumers.filter(consumer => {
        const matchesSearch =
            consumer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.meterNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.meterSerialNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.mobile?.includes(searchTerm) ||
            consumer.nidNo?.includes(searchTerm);
        const matchesType = filterType === 'all' || consumer.consumerType === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? consumer.isActive : !consumer.isActive);
        const matchesRegistration = filterRegistration === 'all' ||
            (filterRegistration === 'registered' ? consumer.isRegistered : !consumer.isRegistered);
        return matchesSearch && matchesType && matchesStatus && matchesRegistration;
    });

    const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);
    const paginatedConsumers = filteredConsumers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error && consumers.length === 0) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Consumers</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={fetchConsumers}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Users size={24} className="text-emerald-600" />
                        <span>All Consumers</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {consumers.length} consumers | {stats.totalMeters} total meters
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setIsRefreshing(true);
                            fetchConsumers().finally(() => setIsRefreshing(false));
                        }}
                        disabled={isRefreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/connection_wing')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Consumers</p>
                            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-100">
                            <Users size={18} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <p className="text-xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-green-100">
                            <CheckCircle size={18} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Registered</p>
                            <p className="text-xl font-bold text-emerald-600">{stats.registered}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-100">
                            <UserCheck size={18} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Claimed</p>
                            <p className="text-xl font-bold text-purple-600">{stats.claimed}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-purple-100">
                            <Shield size={18} className="text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Meters</p>
                            <p className="text-xl font-bold text-orange-600">{stats.totalMeters}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-orange-100">
                            <Package size={18} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, meter number, serial, NID, or mobile..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={filterRegistration}
                            onChange={(e) => {
                                setFilterRegistration(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All</option>
                            <option value="registered">Registered</option>
                            <option value="pending">Pending</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                                setFilterStatus('all');
                                setFilterRegistration('all');
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                    Found {filteredConsumers.length} consumers
                </div>
            </div>

            {/* Consumers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meters</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedConsumers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterRegistration !== 'all'
                                            ? 'No consumers match your filters.'
                                            : 'No consumers found in the system.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedConsumers.map((consumer) => {
                                    const status = getConsumerStatus(consumer);
                                    const StatusIcon = status.icon;
                                    const meterCount = consumer.meters?.length || 0;
                                    const hasMultipleMeters = meterCount > 1;
                                    const isExpanded = expandedConsumer === consumer._id;

                                    return (
                                        <React.Fragment key={consumer._id || consumer.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-emerald-600">
                                                                {consumer.name?.charAt(0).toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{consumer.name}</p>
                                                            <p className="text-xs text-gray-400">{consumer.mobile}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-emerald-600">{consumer.meterNo || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{consumer.meterSerialNo || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-gray-700">{meterCount}</span>
                                                        {hasMultipleMeters && (
                                                            <button
                                                                onClick={() => toggleExpand(consumer._id || consumer.id || '')}
                                                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title={isExpanded ? 'Hide meters' : 'Show all meters'}
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp size={16} className="text-gray-500" />
                                                                ) : (
                                                                    <ChevronDown size={16} className="text-gray-500" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(consumer.consumerType)}`}>
                                                        {getConsumerTypeLabel(consumer.consumerType)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${consumer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {consumer.isActive ? (
                                                            <>
                                                                <CheckCircle size={12} />
                                                                <span>Active</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle size={12} />
                                                                <span>Inactive</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${status.color}`}>
                                                        <StatusIcon size={12} />
                                                        <span>{status.label}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetails(consumer)}
                                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} className="text-gray-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* ✅ Expanded Meters Row */}
                                            {isExpanded && consumer.meters && consumer.meters.length > 0 && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={8} className="px-6 py-3">
                                                        <div className="flex items-center space-x-2">
                                                            <List size={16} className="text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-600">All Meters:</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {consumer.meters.map((meter, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${meter === consumer.meterNo
                                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {meter}
                                                                        {meter === consumer.meterNo && (
                                                                            <span className="ml-1 text-emerald-600">★</span>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-400 ml-2">
                                                                ({consumer.meters.length} total)
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredConsumers.length)} of {filteredConsumers.length} consumers
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === pageNum
                                            ? 'bg-emerald-600 text-white'
                                            : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="text-gray-400">...</span>
                            )}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors border border-gray-200 hover:bg-gray-50`}
                                >
                                    {totalPages}
                                </button>
                            )}
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
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedConsumer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <User size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Consumer Details</h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Consumer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-emerald-600">
                                    {selectedConsumer.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-gray-800">{selectedConsumer.name}</p>
                                <p className="text-sm text-gray-500">{selectedConsumer.email}</p>
                                <p className="text-sm text-gray-500">{selectedConsumer.mobile}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedConsumer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedConsumer.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedConsumer.isRegistered ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {selectedConsumer.isRegistered ? '✓ Registered' : 'Pending Registration'}
                                </span>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedConsumer.isClaimed ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {selectedConsumer.isClaimed ? '✓ Claimed' : 'Not Claimed'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">NID Number</p>
                                <p className="text-sm font-medium">{selectedConsumer.nidNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Primary Meter</p>
                                <p className="text-sm font-bold text-emerald-600">{selectedConsumer.meterNo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Meter Serial No</p>
                                <p className="text-sm font-medium">{selectedConsumer.meterSerialNo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Consumer Type</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(selectedConsumer.consumerType)}`}>
                                    {getConsumerTypeLabel(selectedConsumer.consumerType)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Feeder</p>
                                <p className="text-sm font-medium">{selectedConsumer.feederName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Meter Type</p>
                                <p className="text-sm font-medium">{selectedConsumer.meterType || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Manufacturer</p>
                                <p className="text-sm font-medium">{selectedConsumer.manufacturer || 'N/A'}</p>
                            </div>
                            {/* ✅ All Meters */}
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">All Meters</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedConsumer.meters && selectedConsumer.meters.length > 0 ? (
                                        selectedConsumer.meters.map((meter, index) => (
                                            <span
                                                key={index}
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${meter === selectedConsumer.meterNo
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {meter}
                                                {meter === selectedConsumer.meterNo && (
                                                    <span className="ml-1 text-emerald-600">★</span>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">No meters</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Total: {selectedConsumer.meters?.length || 0} meter(s)
                                </p>
                            </div>
                            {selectedConsumer.isClaimed && (
                                <>
                                    <div>
                                        <p className="text-xs text-gray-500">Claimed By</p>
                                        <p className="text-sm font-medium">{selectedConsumer.claimedBy || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Claimed At</p>
                                        <p className="text-sm font-medium">{selectedConsumer.claimedAt ? new Date(selectedConsumer.claimedAt).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </>
                            )}
                            {selectedConsumer.isRegistered && (
                                <>
                                    <div>
                                        <p className="text-xs text-gray-500">Registered By</p>
                                        <p className="text-sm font-medium">{selectedConsumer.registeredBy || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Registered At</p>
                                        <p className="text-sm font-medium">{selectedConsumer.registeredAt ? new Date(selectedConsumer.registeredAt).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </>
                            )}
                            {selectedConsumer.userId && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">User ID</p>
                                    <p className="text-sm font-medium text-blue-600">{selectedConsumer.userId}</p>
                                </div>
                            )}
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{selectedConsumer.address || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="text-sm text-gray-600">{new Date(selectedConsumer.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="text-sm text-gray-600">{new Date(selectedConsumer.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}