'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    Users,
    Calendar,
    DollarSign,
    AlertCircle,
    Clock,
    Building,
    Home,
    Package,
    Search,
    Eye,
    RefreshCw,
    CreditCard,
    X,
    Zap,
    TrendingUp,
    TrendingDown,
    User,
    Mail,
    Phone,
    MapPin,
    Hash,
    Factory,
    Info,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

// ============================================
// INTERFACES
// ============================================

interface Meter {
    _id?: string;
    meterNo: string;
    meterSerialNo?: string;
    meterType: 'single_phase' | 'three_phase';
    manufacturer?: string;
    consumerName: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    feederName: string;
    address: string;
    mobile: string;
    email: string;
    status: 'active' | 'pending_claim' | 'inactive';
    isClaimed: boolean;
    claimedBy?: string;
    userId?: string;
    initialReading: number;
    currentReading: number;
    lastBillingMonth?: string;
    userInfo?: {
        name: string;
        email: string;
        mobile: string;
        address: string;
        isRegistered: boolean;
    };
    // ✅ Bill status fields
    billStatus?: 'pending' | 'generated' | 'paid' | 'unpaid';
    billId?: string | null;
    billAmount?: number | null;
    createdAt: string;
    updatedAt: string;
}

interface BillData {
    meterNo: string;
    consumerName: string;
    consumerEmail: string;
    consumerMobile: string;
    consumerAddress: string;
    consumerType: string;
    previousReading: number;
    currentReading: number;
    unitsConsumed: number;
    ratePerUnit: number;
    totalAmount: number;
    billingMonth: string;
    dueDate: string;
    unpaidAmount: number;
    lateFee: number;
    grandTotal: number;
    isRegisteredUser: boolean;
    status: 'pending';
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    subText?: string;
}

// ============================================
// RATE CONFIGURATION
// ============================================

const ratePerUnit = {
    residential: 7.50,
    commercial: 9.75,
    industrial: 11.25,
};

const LATE_FEE_PERCENTAGE = 5;

// ============================================
// STAT CARD COMPONENT
// ============================================

const StatCard = ({ title, value, icon, bgColor, subText }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
        </div>
    </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function BillingWingsGenerateBillsPage() {
    const router = useRouter();

    // States
    const [loading, setLoading] = useState(true);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [filteredMeters, setFilteredMeters] = useState<Meter[]>([]);
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        return new Date().toLocaleString('default', { month: 'long' });
    });
    const [selectedYear, setSelectedYear] = useState(() => {
        return new Date().getFullYear().toString();
    });
    const [dueDate, setDueDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(15);
        return date.toISOString().split('T')[0];
    });
    const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        claimed: 0,
        unclaimed: 0,
        residential: 0,
        commercial: 0,
        industrial: 0,
        registered: 0,
        unregistered: 0,
        billsGenerated: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 10;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = ['2024', '2025', '2026', '2027'];

    // ============================================
    // FETCH METERS
    // ============================================

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
            fetchMeters();
        }
    }, [user]);

    const fetchMeters = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            console.log('📡 Fetching all meters from API...');

            const response = await fetch(
                `${API_URL}/api/meters/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch meters');
            }

            const data = await response.json();
            console.log('📦 API Response:', data);

            if (data.success && data.data) {
                const metersData = data.data;
                console.log(`📦 Found ${metersData.length} meters`);

                if (metersData.length === 0) {
                    setMeters([]);
                    setFilteredMeters([]);
                    setStats({
                        total: 0,
                        claimed: 0,
                        unclaimed: 0,
                        residential: 0,
                        commercial: 0,
                        industrial: 0,
                        registered: 0,
                        unregistered: 0,
                        billsGenerated: 0,
                    });
                    setError('No meters found in the system. Add meters first.');
                    setLoading(false);
                    return;
                }

                setMeters(metersData);
                setFilteredMeters(metersData);

                // Update stats
                const total = metersData.length;
                const claimed = metersData.filter((m: Meter) => m.isClaimed).length;
                const unclaimed = metersData.filter((m: Meter) => !m.isClaimed).length;
                const residential = metersData.filter((m: Meter) => m.consumerType === 'residential').length;
                const commercial = metersData.filter((m: Meter) => m.consumerType === 'commercial').length;
                const industrial = metersData.filter((m: Meter) => m.consumerType === 'industrial').length;
                const registered = metersData.filter((m: Meter) => m.userInfo?.isRegistered).length;
                const unregistered = metersData.filter((m: Meter) => !m.userInfo?.isRegistered && m.isClaimed).length;
                const billsGenerated = metersData.filter((m: Meter) => m.billStatus && m.billStatus !== 'pending').length;

                setStats({
                    total,
                    claimed,
                    unclaimed,
                    residential,
                    commercial,
                    industrial,
                    registered,
                    unregistered,
                    billsGenerated,
                });

                setError(null);
            } else {
                throw new Error(data.message || 'No meter data received');
            }

        } catch (error: any) {
            console.error('❌ Error fetching meters:', error);
            setError(error.message || 'Failed to load meters');
            setMeters([]);
            setFilteredMeters([]);
            setStats({
                total: 0,
                claimed: 0,
                unclaimed: 0,
                residential: 0,
                commercial: 0,
                industrial: 0,
                registered: 0,
                unregistered: 0,
                billsGenerated: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // HELPERS
    // ============================================

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

    const getStatusBadge = (meter: Meter) => {
        if (meter.isClaimed && meter.userInfo?.isRegistered) {
            return {
                color: 'bg-green-100 text-green-700',
                label: '✅ Registered',
                icon: CheckCircle,
                isRegistered: true,
            };
        } else if (meter.isClaimed && !meter.userInfo?.isRegistered) {
            return {
                color: 'bg-yellow-100 text-yellow-700',
                label: '⚠️ Unregistered',
                icon: AlertCircle,
                isRegistered: false,
            };
        } else {
            return {
                color: 'bg-gray-100 text-gray-700',
                label: '⚪ Available',
                icon: Package,
                isRegistered: false,
            };
        }
    };

    // ✅ Get bill status badge
    const getBillStatusBadge = (status?: string, billId?: string | null) => {
        if (!status || status === 'pending') {
            return {
                color: 'bg-gray-100 text-gray-500',
                label: 'Not Generated',
                icon: Clock,
            };
        }

        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            generated: { color: 'bg-blue-100 text-blue-700', label: 'Generated', icon: FileText },
            paid: { color: 'bg-green-100 text-green-700', label: 'Paid', icon: CheckCircle },
            unpaid: { color: 'bg-red-100 text-red-700', label: 'Unpaid', icon: AlertCircle },
        };

        return statuses[status] || statuses.generated;
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString()}`;
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // ============================================
    // OPEN BILL MODAL
    // ============================================

    const openBillModal = (meter: Meter) => {
        setSelectedMeter(meter);

        // ✅ Use state values with fallback
        const currentMonth = selectedMonth || new Date().toLocaleString('default', { month: 'long' });
        const currentYear = selectedYear || new Date().getFullYear().toString();
        const currentDueDate = dueDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString().split('T')[0];

        // Get consumer info
        let consumerName = 'N/A';
        let consumerEmail = 'N/A';
        let consumerMobile = 'N/A';
        let consumerAddress = 'N/A';
        let isRegisteredUser = false;

        if (meter.isClaimed) {
            if (meter.userInfo?.isRegistered) {
                consumerName = meter.userInfo.name;
                consumerEmail = meter.userInfo.email;
                consumerMobile = meter.userInfo.mobile;
                consumerAddress = meter.userInfo.address;
                isRegisteredUser = true;
            } else {
                consumerName = meter.consumerName || 'N/A';
                consumerEmail = meter.email || 'N/A';
                consumerMobile = meter.mobile || 'N/A';
                consumerAddress = meter.address || 'N/A';
            }
        }

        const prevReading = meter.currentReading || meter.initialReading || 0;

        setBillData({
            meterNo: meter.meterNo,
            consumerName: consumerName,
            consumerEmail: consumerEmail,
            consumerMobile: consumerMobile,
            consumerAddress: consumerAddress,
            consumerType: meter.consumerType || 'residential',
            previousReading: prevReading,
            currentReading: 0,
            unitsConsumed: 0,
            ratePerUnit: ratePerUnit[meter.consumerType as keyof typeof ratePerUnit] || 7.50,
            totalAmount: 0,
            billingMonth: `${currentMonth} ${currentYear}`,
            dueDate: currentDueDate,
            unpaidAmount: 0,
            lateFee: 0,
            grandTotal: 0,
            isRegisteredUser: isRegisteredUser,
            status: 'pending',
        });

        setShowBillModal(true);
    };

    // ============================================
    // CALCULATE BILL
    // ============================================

    const calculateBill = () => {
        if (!billData || !selectedMeter) return;

        const currentReading = Number(billData.currentReading);
        const prevReading = billData.previousReading;

        if (!currentReading || currentReading <= prevReading) {
            setError('Current reading must be greater than previous reading');
            return;
        }

        const units = currentReading - prevReading;
        const amount = units * billData.ratePerUnit;
        const grandTotal = amount + billData.unpaidAmount + billData.lateFee;

        setBillData({
            ...billData,
            currentReading: currentReading,
            unitsConsumed: units,
            totalAmount: amount,
            grandTotal: grandTotal,
        });

        setError(null);
    };

    // ============================================
    // GENERATE BILL
    // ============================================

    const generateBill = async () => {
        if (!billData || !selectedMeter) return;

        // ✅ Validate before sending
        if (!billData.meterNo || !billData.billingMonth || !billData.dueDate) {
            setError('Missing required fields: meterNo, billingMonth, or dueDate');
            setIsGenerating(false);
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');

            console.log('📦 Sending bill data:', {
                meterNo: billData.meterNo,
                previousReading: billData.previousReading,
                currentReading: billData.currentReading,
                unitsConsumed: billData.unitsConsumed,
                ratePerUnit: billData.ratePerUnit,
                totalAmount: billData.totalAmount,
                billingMonth: billData.billingMonth,
                dueDate: billData.dueDate,
                unpaidAmount: billData.unpaidAmount || 0,
                lateFee: billData.lateFee || 0,
                grandTotal: billData.grandTotal || billData.totalAmount,
            });

            const response = await fetch(`${API_URL}/api/billing/generate-bill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    meterNo: billData.meterNo,
                    previousReading: billData.previousReading,
                    currentReading: billData.currentReading,
                    unitsConsumed: billData.unitsConsumed,
                    ratePerUnit: billData.ratePerUnit,
                    totalAmount: billData.totalAmount,
                    billingMonth: billData.billingMonth,
                    dueDate: billData.dueDate,
                    unpaidAmount: billData.unpaidAmount || 0,
                    lateFee: billData.lateFee || 0,
                    grandTotal: billData.grandTotal || billData.totalAmount,
                }),
            });

            const data = await response.json();
            console.log('📦 Response from backend:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate bill');
            }

            console.log('✅ Bill generated:', data);

            setShowBillModal(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            await fetchMeters();

        } catch (error: any) {
            console.error('❌ Generate bill error:', error);
            setError(error.message || 'Failed to generate bill');
        } finally {
            setIsGenerating(false);
        }
    };

    // ============================================
    // FILTER METERS
    // ============================================

    useEffect(() => {
        let filtered = meters;

        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.meterNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.feederName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.meterSerialNo?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(m => {
                if (filterStatus === 'claimed') return m.isClaimed;
                if (filterStatus === 'unclaimed') return !m.isClaimed;
                if (filterStatus === 'registered') return m.userInfo?.isRegistered;
                if (filterStatus === 'unregistered') return m.isClaimed && !m.userInfo?.isRegistered;
                return true;
            });
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(m => m.consumerType === filterType);
        }

        setFilteredMeters(filtered);
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType, meters]);

    // ============================================
    // PAGINATION
    // ============================================

    const totalPages = Math.ceil(filteredMeters.length / ITEMS_PER_PAGE);
    const paginatedMeters = filteredMeters.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ============================================
    // RENDER
    // ============================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Bill Generated Successfully! 🎉</h2>
                    <p className="text-gray-500 mb-4">
                        Bill has been generated and is ready for consumer payment.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/billing_wings/all-bills')}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        View All Bills
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <FileText size={24} className="text-emerald-600" />
                        <span>Generate Bills</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {filteredMeters.length} meters available for billing
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/billing_wings')}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
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
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard
                    title="Total Meters"
                    value={stats.total}
                    icon={<Package size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                    subText={`${stats.claimed} claimed, ${stats.unclaimed} available`}
                />
                <StatCard
                    title="Registered Users"
                    value={stats.registered}
                    icon={<User size={20} className="text-white" />}
                    bgColor="bg-green-100"
                    subText="With registered users"
                />
                <StatCard
                    title="Unregistered Users"
                    value={stats.unregistered}
                    icon={<AlertCircle size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
                    subText="Claimed but unregistered"
                />
                <StatCard
                    title="Residential"
                    value={stats.residential}
                    icon={<Home size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                    subText={`${stats.total > 0 ? Math.round((stats.residential / stats.total) * 100) : 0}%`}
                />
                <StatCard
                    title="Commercial"
                    value={stats.commercial}
                    icon={<Building size={20} className="text-white" />}
                    bgColor="bg-purple-100"
                    subText={`${stats.total > 0 ? Math.round((stats.commercial / stats.total) * 100) : 0}%`}
                />
                <StatCard
                    title="Industrial"
                    value={stats.industrial}
                    icon={<Zap size={20} className="text-white" />}
                    bgColor="bg-orange-100"
                    subText={`${stats.total > 0 ? Math.round((stats.industrial / stats.total) * 100) : 0}%`}
                />
                <StatCard
                    title="Bills Generated"
                    value={stats.billsGenerated}
                    icon={<FileText size={20} className="text-white" />}
                    bgColor="bg-emerald-100"
                    subText={`${stats.total > 0 ? Math.round((stats.billsGenerated / stats.total) * 100) : 0}% completed`}
                />
            </div>

            {/* Month/Year Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Billing Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            {months.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Billing Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
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
                            placeholder="Search by meter number, consumer name, serial, or feeder..."
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
                            <option value="claimed">Claimed</option>
                            <option value="unclaimed">Available</option>
                            <option value="registered">Registered User</option>
                            <option value="unregistered">Unregistered User</option>
                        </select>
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
                <div className="mt-2 text-xs text-gray-400">
                    Found {filteredMeters.length} meter(s)
                </div>
            </div>

            {/* Meters Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Reading</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedMeters.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                                            ? 'No meters match your filters.'
                                            : 'No meters found in the system. Add meters first.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedMeters.map((meter) => {
                                    const statusBadge = getStatusBadge(meter);
                                    const StatusIcon = statusBadge.icon;
                                    const BillStatusBadge = getBillStatusBadge(meter.billStatus, meter.billId);
                                    const BillStatusIcon = BillStatusBadge.icon;
                                    const isBillGenerated = meter.billStatus && meter.billStatus !== 'pending';

                                    return (
                                        <tr key={meter._id || meter.meterNo} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{meter.meterNo}</p>
                                                    {meter.meterSerialNo && (
                                                        <p className="text-xs text-gray-400">Serial: {meter.meterSerialNo}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400">Feeder: {meter.feederName}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {meter.userInfo?.isRegistered ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{meter.userInfo.name}</p>
                                                        <p className="text-xs text-emerald-600">✅ Registered User</p>
                                                    </div>
                                                ) : meter.isClaimed ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{meter.consumerName || 'N/A'}</p>
                                                        <p className="text-xs text-yellow-600">⚠️ Unregistered</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400">N/A</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {meter.userInfo?.isRegistered ? (
                                                    <div>
                                                        <p className="text-sm text-gray-600">{meter.userInfo.mobile}</p>
                                                        <p className="text-xs text-gray-400">{meter.userInfo.email}</p>
                                                    </div>
                                                ) : meter.isClaimed ? (
                                                    <div>
                                                        <p className="text-sm text-gray-600">{meter.mobile || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400">{meter.email || 'N/A'}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400">N/A</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(meter.consumerType)}`}>
                                                    {getConsumerTypeLabel(meter.consumerType)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${statusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{statusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isBillGenerated ? (
                                                    <div>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${BillStatusBadge.color}`}>
                                                            <BillStatusIcon size={12} />
                                                            <span>{BillStatusBadge.label}</span>
                                                        </span>
                                                        {meter.billId && (
                                                            <p className="text-xs text-gray-400 mt-1">{meter.billId}</p>
                                                        )}
                                                        {meter.billAmount && (
                                                            <p className="text-xs font-medium text-gray-600 mt-1">{formatCurrency(meter.billAmount)}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not Generated</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {meter.currentReading || meter.initialReading || 0} kWh
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openBillModal(meter)}
                                                    disabled={isBillGenerated}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${isBillGenerated
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        }`}
                                                    title={isBillGenerated ? 'Bill already generated for this month' : 'Generate bill for this meter'}
                                                >
                                                    <FileText size={14} />
                                                    <span>{isBillGenerated ? 'Generated' : 'Generate Bill'}</span>
                                                </button>
                                                {isBillGenerated && (
                                                    <p className="text-xs text-blue-600 mt-1">✅ Generated</p>
                                                )}
                                                {!meter.isClaimed && !isBillGenerated && (
                                                    <p className="text-xs text-gray-400 mt-1">⚠️ Unclaimed meter</p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredMeters.length)} of {filteredMeters.length} meters
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <>
                                    <span className="text-gray-400">...</span>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="px-3 py-1 rounded-lg text-sm transition-colors border border-gray-200 hover:bg-gray-50"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bill Modal */}
            {showBillModal && billData && selectedMeter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Generate Bill</h3>
                            </div>
                            <button
                                onClick={() => setShowBillModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center space-x-2">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Meter & Consumer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Meter Number</p>
                                    <p className="text-sm font-bold text-emerald-600">{billData.meterNo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${billData.isRegisteredUser ? 'bg-green-100 text-green-700' :
                                        billData.consumerName !== 'N/A' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {billData.isRegisteredUser ? '✅ Registered User' :
                                            billData.consumerName !== 'N/A' ? '⚠️ Unregistered' : '⚪ Unclaimed Meter'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Consumer Name</p>
                                    <p className="text-sm font-medium">{billData.consumerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Consumer Type</p>
                                    <p className="text-sm font-medium">{getConsumerTypeLabel(billData.consumerType)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mobile</p>
                                    <p className="text-sm font-medium">{billData.consumerMobile}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium">{billData.consumerEmail}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium">{billData.consumerAddress}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Billing Month</p>
                                    <p className="text-sm font-medium">{billData.billingMonth}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Due Date</p>
                                    <p className="text-sm font-medium">{formatDate(billData.dueDate)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Reading Input */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Meter Readings</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Previous Reading</label>
                                    <p className="text-lg font-medium bg-white px-3 py-2 rounded-lg border border-gray-200">
                                        {billData.previousReading} kWh
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Current Reading *</label>
                                    <input
                                        type="number"
                                        value={billData.currentReading || ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setBillData(prev => prev ? { ...prev, currentReading: val } : null);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Enter current reading"
                                        min={billData.previousReading + 1}
                                    />
                                    {billData.currentReading <= billData.previousReading && billData.currentReading > 0 && (
                                        <p className="text-red-500 text-xs mt-1">Must be greater than previous reading</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bill Calculation */}
                        {billData.unitsConsumed > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bill Calculation</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Units Consumed</p>
                                        <p className="text-lg font-bold text-emerald-600">{billData.unitsConsumed} kWh</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Rate per Unit</p>
                                        <p className="text-lg font-medium">৳{billData.ratePerUnit}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Bill Amount</span>
                                        <span className="text-lg font-semibold">৳{billData.totalAmount.toFixed(2)}</span>
                                    </div>
                                    {(billData.unpaidAmount > 0 || billData.lateFee > 0) && (
                                        <>
                                            <div className="flex items-center justify-between mt-1 text-red-600">
                                                <span>Unpaid + Late Fee</span>
                                                <span>+ ৳{(billData.unpaidAmount + billData.lateFee).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                                <span className="text-lg font-bold text-gray-800">Grand Total</span>
                                                <span className="text-2xl font-bold text-emerald-700">৳{billData.grandTotal.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Due Date: {formatDate(billData.dueDate)}</p>
                            </div>
                        )}

                        {/* Status Messages */}
                        {!billData.isRegisteredUser && billData.consumerName !== 'N/A' && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700 flex items-center space-x-2">
                                    <AlertCircle size={16} />
                                    <span>⚠️ This meter is claimed but the user is not registered. Bill generated with consumer info from meter.</span>
                                </p>
                            </div>
                        )}

                        {billData.consumerName === 'N/A' && (
                            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-600 flex items-center space-x-2">
                                    <Info size={16} />
                                    <span>ℹ️ This meter is not claimed. Bill generated with N/A for consumer info.</span>
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowBillModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={calculateBill}
                                disabled={!billData.currentReading || billData.currentReading <= billData.previousReading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <Zap size={16} />
                                <span>Calculate</span>
                            </button>
                            <button
                                onClick={generateBill}
                                disabled={isGenerating || billData.unitsConsumed === 0}
                                className={`px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2 ${isGenerating || billData.unitsConsumed === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-emerald-700'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>Generate Bill</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}