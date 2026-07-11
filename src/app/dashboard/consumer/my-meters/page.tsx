// app/dashboard/consumer/my-meters/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    Loader2,
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Home,
    Building,
    Zap,
    FileText,
    Eye,
    Clock,
    Search,
    Info,
    Plus,
    X,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Star,
    StarOff,
    Crown,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Meter {
    _id?: string;
    meterNo: string;
    meterType: 'single_phase' | 'three_phase';
    manufacturer: string;
    feederName: string;
    consumerName: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    status: string;
    isClaimed: boolean;
    claimedBy?: string;
    claimedAt?: string;
    initialReading: number;
    currentReading: number;
    specialNote?: string;
    address?: string;
    mobile?: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
}

interface ClaimedMeter {
    meterNo: string;
    claimedAt: string;
    consumerId: string;
    consumerName: string;
    isPrimary?: boolean;
    status?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    meterNo: string;
    meters: string[];
    claimedMeters?: ClaimedMeter[];
}

interface AvailableMeter {
    _id: string;
    meterNo: string;
    consumerName: string;
    feederName: string;
    consumerType: string;
    address: string;
    isClaimed: boolean;
}

export default function MyMetersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [claimedMeters, setClaimedMeters] = useState<ClaimedMeter[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [totalMeters, setTotalMeters] = useState(0);
    const [primaryMeter, setPrimaryMeter] = useState<string>('');

    // ✅ Claim Meter Modal States
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [searchMeterNo, setSearchMeterNo] = useState('');
    const [meterSearching, setMeterSearching] = useState(false);
    const [meterFound, setMeterFound] = useState<AvailableMeter | null>(null);
    const [meterError, setMeterError] = useState<string | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState(false);

    // ✅ Set Primary Meter States
    const [settingPrimary, setSettingPrimary] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data, error: authError } = await authClient.getSession();
                if (authError || !data) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);
                setPrimaryMeter(data.user.meterNo || '');

                await fetchMeters(data.user.id);
            } catch (error: any) {
                console.error('Error fetching meters:', error);
                setError(error.message || 'Failed to load meters');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router, API_URL]);

    const fetchMeters = async (userId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/user/meters/${userId}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch meters');
            }

            const result = await response.json();
            if (result.success) {
                setMeters(result.data.meters || []);
                setClaimedMeters(result.data.claimedMeters || []);
                setTotalMeters(result.data.totalMeters || 0);
                setPrimaryMeter(result.data.primaryMeter || user?.meterNo || '');
            } else {
                throw new Error(result.message || 'Failed to load meters');
            }
        } catch (error: any) {
            throw error;
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const { data } = await authClient.getSession();
            if (data?.user) {
                await fetchMeters(data.user.id);
                setError(null);
            }
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // ✅ Set Primary Meter
    const handleSetPrimary = async (meterNo: string) => {
        if (!user) return;

        setSettingPrimary(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/user/primary-meter`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    userId: user.id,
                    meterNo: meterNo,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to set primary meter');
            }

            const data = await response.json();
            if (data.success) {
                setPrimaryMeter(meterNo);
                // Update user object
                setUser(prev => prev ? { ...prev, meterNo: meterNo } : prev);
                // Refresh meters
                await fetchMeters(user.id);
                alert('Primary meter updated successfully!');
            }
        } catch (error: any) {
            console.error('Set primary error:', error);
            alert(error.message || 'Failed to set primary meter');
        } finally {
            setSettingPrimary(false);
        }
    };

    // ✅ Search for meter to claim
    const searchMeter = async () => {
        if (!searchMeterNo.trim()) {
            setMeterError('Please enter a meter number');
            return;
        }

        setMeterSearching(true);
        setMeterError(null);
        setMeterFound(null);

        try {
            const token = localStorage.getItem('auth_token');
            const userId = user?.id;

            // ✅ First check if meter exists and is available
            const checkResponse = await fetch(
                `${API_URL}/api/meters/check-availability/${encodeURIComponent(searchMeterNo.trim())}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const checkData = await checkResponse.json();

            if (!checkResponse.ok) {
                throw new Error(checkData.message || 'Failed to check meter');
            }

            if (checkData.success && checkData.data) {
                if (!checkData.data.exists) {
                    setMeterError('Meter not found in the system');
                    setMeterFound(null);
                    return;
                }

                if (checkData.data.claimedBy && checkData.data.claimedBy !== 'Not claimed yet') {
                    if (checkData.data.claimedBy === userId) {
                        setMeterError('You have already claimed this meter');
                    } else {
                        setMeterError(`This meter is already claimed by ${checkData.data.claimedBy}`);
                    }
                    setMeterFound(null);
                    return;
                }

                // ✅ Meter exists and is available - get full details
                const searchResponse = await fetch(
                    `${API_URL}/api/meters/search/${encodeURIComponent(searchMeterNo.trim())}`,
                    {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!searchResponse.ok) {
                    const errorData = await searchResponse.json();
                    throw new Error(errorData.message || 'Failed to get meter details');
                }

                const searchData = await searchResponse.json();

                if (searchData.success && searchData.data) {
                    setMeterFound(searchData.data);
                    setMeterError(null);
                } else {
                    throw new Error(searchData.message || 'Failed to get meter details');
                }
            } else {
                throw new Error(checkData.message || 'Failed to check meter');
            }

        } catch (error: any) {
            console.error('Search error:', error);
            setMeterError(error.message || 'Meter not found or already claimed');
            setMeterFound(null);
        } finally {
            setMeterSearching(false);
        }
    };

    // ✅ Claim Meter
    const claimMeter = async () => {
        if (!meterFound || !user) return;

        setIsClaiming(true);
        setMeterError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/meters/claim-for-consumer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    meterNo: meterFound.meterNo,
                    userId: user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to claim meter');
            }

            setClaimSuccess(true);

            // ✅ Refresh meters after successful claim
            await fetchMeters(user.id);

            setTimeout(() => {
                setShowClaimModal(false);
                setClaimSuccess(false);
                setMeterFound(null);
                setSearchMeterNo('');
            }, 2000);

        } catch (error: any) {
            console.error('Claim meter error:', error);
            setMeterError(error.message || 'Failed to claim meter');
        } finally {
            setIsClaiming(false);
        }
    };

    // ✅ Clear meter selection
    const clearMeterSelection = () => {
        setMeterFound(null);
        setSearchMeterNo('');
        setMeterError(null);
    };

    const getMeterTypeLabel = (type: string) => {
        return type === 'single_phase' ? 'Single Phase' : 'Three Phase';
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

    const handleViewBills = (meterNo: string) => {
        router.push(`/dashboard/consumer/my-bills?meter=${meterNo}`);
    };

    const handleViewDetails = (meterNo: string) => {
        router.push(`/dashboard/consumer/meter-details?meter=${meterNo}`);
    };

    const filteredMeters = meters.filter(meter => {
        const matchesSearch = meter.meterNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meter.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meter.feederName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || meter.consumerType === filterType;
        return matchesSearch && matchesType;
    });

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
                        <Package size={24} className="text-emerald-600" />
                        <span>My Meters</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {totalMeters} meter(s) connected to your account
                        {primaryMeter && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Primary: {primaryMeter}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowClaimModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Claim Meter</span>
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/consumer')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            {meters.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Meters</p>
                                <p className="text-2xl font-bold text-gray-800">{totalMeters}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-100">
                                <Package size={20} className="text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Residential</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {meters.filter(m => m.consumerType === 'residential').length}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Home size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Commercial</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {meters.filter(m => m.consumerType === 'commercial').length}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Building size={20} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Industrial</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {meters.filter(m => m.consumerType === 'industrial').length}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-100">
                                <Zap size={20} className="text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            {meters.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by meter number, consumer name, or feeder..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                            </select>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('all');
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <RefreshCw size={16} />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                        Found {filteredMeters.length} meter(s)
                    </div>
                </div>
            )}

            {/* Meters Grid */}
            {filteredMeters.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">
                        {meters.length === 0 ? 'No Meters Found' : 'No Meters Match Your Search'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {meters.length === 0
                            ? "You haven't claimed any meters yet. Click 'Claim Meter' to add one."
                            : 'Try adjusting your search or filter.'}
                    </p>
                    {meters.length === 0 && (
                        <button
                            onClick={() => setShowClaimModal(true)}
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 mx-auto"
                        >
                            <Plus size={16} />
                            <span>Claim Meter</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMeters.map((meter) => {
                        const isPrimary = meter.meterNo === primaryMeter;
                        return (
                            <div
                                key={meter.meterNo}
                                className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden ${isPrimary ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-gray-100'
                                    }`}
                            >
                                {/* Meter Header */}
                                <div className={`px-4 py-3 text-white ${isPrimary
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {isPrimary ? (
                                                <Crown size={18} className="text-yellow-200" />
                                            ) : (
                                                <Package size={18} />
                                            )}
                                            <span className="font-semibold">{meter.meterNo}</span>
                                            {isPrimary && (
                                                <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                                    PRIMARY
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                            {getMeterTypeLabel(meter.meterType)}
                                        </span>
                                    </div>
                                </div>

                                {/* Meter Body */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Consumer</span>
                                        <span className="font-medium text-gray-800">{meter.consumerName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Type</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getConsumerTypeColor(meter.consumerType)}`}>
                                            {getConsumerTypeLabel(meter.consumerType)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Feeder</span>
                                        <span className="font-medium">{meter.feederName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Manufacturer</span>
                                        <span className="font-medium">{meter.manufacturer || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`text-xs font-medium flex items-center space-x-1 ${meter.isClaimed ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {meter.isClaimed ? (
                                                <>
                                                    <CheckCircle size={12} />
                                                    <span>Claimed</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle size={12} />
                                                    <span>Pending</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    {meter.claimedAt && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Claimed</span>
                                            <span className="text-xs text-gray-500">{new Date(meter.claimedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {meter.currentReading !== undefined && (
                                        <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-2">
                                            <span className="text-gray-500">Current Reading</span>
                                            <span className="font-medium text-emerald-600">{meter.currentReading} kWh</span>
                                        </div>
                                    )}
                                    {meter.specialNote && (
                                        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                                            📌 {meter.specialNote}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => handleViewBills(meter.meterNo)}
                                            className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                                        >
                                            <FileText size={14} />
                                            <span>View Bills</span>
                                        </button>
                                        <button
                                            onClick={() => handleViewDetails(meter.meterNo)}
                                            className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                                        >
                                            <Eye size={14} />
                                            <span>Details</span>
                                        </button>
                                    </div>

                                    {/* ✅ Set as Primary Button */}
                                    {!isPrimary && (
                                        <button
                                            onClick={() => handleSetPrimary(meter.meterNo)}
                                            disabled={settingPrimary}
                                            className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 text-sm disabled:opacity-50"
                                        >
                                            {settingPrimary ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    <span>Setting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Star size={14} />
                                                    <span>Set as Primary</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Primary Badge */}
                                    {isPrimary && (
                                        <div className="w-full px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg flex items-center justify-center space-x-1 text-sm border border-yellow-200">
                                            <Crown size={14} />
                                            <span>Primary Meter</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Claim History */}
            {claimedMeters.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Clock size={18} className="text-emerald-600" />
                        <span>Claim History</span>
                    </h3>
                    <div className="space-y-2">
                        {claimedMeters.map((claim, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between py-2 border-b border-gray-50 last:border-0 ${claim.isPrimary ? 'bg-yellow-50/50 -mx-6 px-6 rounded-lg' : ''
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-800">{claim.meterNo}</p>
                                    {claim.isPrimary && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                                            PRIMARY
                                        </span>
                                    )}
                                    <p className="text-xs text-gray-400 ml-2">{claim.consumerName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Claimed</p>
                                    <p className="text-xs text-gray-400">{new Date(claim.claimedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Info Card */}
            {user && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100 p-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">
                                Primary Meter: <span className="font-medium text-emerald-600">{user.meterNo || 'N/A'}</span>
                            </p>
                            <p className="text-xs text-gray-400">Total Meters: {totalMeters}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Claim Meter Modal */}
            {showClaimModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <Plus size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Claim Meter</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowClaimModal(false);
                                    setMeterFound(null);
                                    setSearchMeterNo('');
                                    setMeterError(null);
                                    setClaimSuccess(false);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Success Message */}
                        {claimSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                                <CheckCircle size={18} className="text-green-600" />
                                <p className="text-sm text-green-700">Meter claimed successfully! 🎉</p>
                            </div>
                        )}

                        {/* Meter Search */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Meter Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter meter number..."
                                            value={searchMeterNo}
                                            onChange={(e) => setSearchMeterNo(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            disabled={meterFound !== null || isClaiming}
                                        />
                                    </div>
                                    <button
                                        onClick={searchMeter}
                                        disabled={meterSearching || meterFound !== null || isClaiming}
                                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        {meterSearching ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Search...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search size={16} />
                                                <span>Search</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                {meterError && (
                                    <p className="text-red-500 text-sm mt-1">{meterError}</p>
                                )}
                            </div>

                            {/* Meter Found */}
                            {meterFound && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-800 mb-2">✅ Meter Found!</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Meter:</span>
                                            <span className="font-medium text-emerald-700">{meterFound.meterNo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Consumer:</span>
                                            <span>{meterFound.consumerName || 'Pending'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Feeder:</span>
                                            <span>{meterFound.feederName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="capitalize">{meterFound.consumerType || 'residential'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <span className="text-emerald-600 font-medium">Available</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setShowClaimModal(false);
                                        setMeterFound(null);
                                        setSearchMeterNo('');
                                        setMeterError(null);
                                        setClaimSuccess(false);
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isClaiming}
                                >
                                    Cancel
                                </button>
                                {meterFound && (
                                    <button
                                        onClick={claimMeter}
                                        disabled={isClaiming}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        {isClaiming ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Claiming...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} />
                                                <span>Claim Meter</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}