// app/dashboard/billing_wings/generate-bills/page.tsx
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
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

// ============================================
// INTERFACES
// ============================================

interface Consumer {
    id: string;
    name: string;
    email: string;
    mobile: string;
    meterNo: string;
    feederName: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    isActive: boolean;
    previousReading?: number;
    currentReading?: string;
    lastBillingMonth?: string;
    billStatus?: 'generated' | 'pending' | 'paid';
    billId?: string;
    hasUnpaid?: boolean;
    unpaidAmount?: number;
    lateFee?: number;
}

interface BillData {
    meterNo: string;
    consumerName: string;
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
    status: 'pending';
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
}

// ============================================
// RATE CONFIGURATION
// ============================================

const ratePerUnit = {
    residential: 7.50,
    commercial: 9.75,
    industrial: 11.25,
};

const LATE_FEE_PERCENTAGE = 5; // 5% late fee on unpaid amount

// ============================================
// STAT CARD COMPONENT
// ============================================

const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
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
    const [consumers, setConsumers] = useState<Consumer[]>([]);
    const [filteredConsumers, setFilteredConsumers] = useState<Consumer[]>([]);
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = ['2024', '2025', '2026', '2027'];

    // ============================================
    // FETCH CONSUMERS
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
            fetchConsumers();
        }
    }, [user]);

    useEffect(() => {
        const now = new Date();
        setSelectedMonth(now.toLocaleString('default', { month: 'long' }));
        setSelectedYear(now.getFullYear().toString());
        setDueDate(new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().split('T')[0]);
    }, []);

    const fetchConsumers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/billing/consumers/all`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });

            let data;
            if (response.ok) {
                data = await response.json();
                if (data.data && data.data.length > 0) {
                    const consumersWithData = data.data.map((c: any) => ({
                        ...c,
                        previousReading: Math.floor(Math.random() * 400) + 100,
                        currentReading: '',
                        lastBillingMonth: 'May 2026',
                        billStatus: ['pending', 'pending', 'generated', 'paid'][Math.floor(Math.random() * 4)] as any,
                        billId: `B-2026-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
                        hasUnpaid: Math.random() > 0.7,
                        unpaidAmount: Math.floor(Math.random() * 5000) + 1000,
                        lateFee: Math.floor(Math.random() * 500) + 100,
                    }));
                    setConsumers(consumersWithData);
                    setFilteredConsumers(consumersWithData);
                    setLoading(false);
                    return;
                }
            }

            const mockConsumers = getMockConsumers();
            setConsumers(mockConsumers);
            setFilteredConsumers(mockConsumers);

        } catch (error) {
            console.error('Error fetching consumers:', error);
            const mockConsumers = getMockConsumers();
            setConsumers(mockConsumers);
            setFilteredConsumers(mockConsumers);
        } finally {
            setLoading(false);
        }
    };

    const getMockConsumers = (): Consumer[] => {
        const names = [
            { name: 'John Doe', type: 'residential', meter: 'MTR-2026-001', feeder: 'Trimohoni' },
            { name: 'Jane Smith', type: 'commercial', meter: 'MTR-2026-002', feeder: 'Circuit-Hose' },
            { name: 'Robert Johnson', type: 'industrial', meter: 'MTR-2026-003', feeder: 'DC-Court' },
            { name: 'Emily Davis', type: 'residential', meter: 'MTR-2026-004', feeder: 'N.S-Road' },
            { name: 'Michael Brown', type: 'commercial', meter: 'MTR-2026-005', feeder: 'Trimohoni' },
            { name: 'Sarah Wilson', type: 'residential', meter: 'MTR-2026-006', feeder: 'Circuit-Hose' },
            { name: 'David Lee', type: 'commercial', meter: 'MTR-2026-007', feeder: 'DC-Court' },
            { name: 'Lisa Kim', type: 'industrial', meter: 'MTR-2026-008', feeder: 'N.S-Road' },
            { name: 'James Taylor', type: 'residential', meter: 'MTR-2026-009', feeder: 'Trimohoni' },
            { name: 'Maria Garcia', type: 'commercial', meter: 'MTR-2026-010', feeder: 'Circuit-Hose' },
        ];

        const statuses: ('generated' | 'pending' | 'paid')[] = ['pending', 'pending', 'generated', 'paid'];

        return names.map((item, index) => ({
            id: `user-${String(index + 1).padStart(3, '0')}`,
            name: item.name,
            email: `${item.name.toLowerCase().replace(' ', '.')}@example.com`,
            mobile: `017${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
            meterNo: item.meter,
            feederName: item.feeder,
            consumerType: item.type as 'residential' | 'commercial' | 'industrial',
            isActive: true,
            previousReading: Math.floor(Math.random() * 400) + 100,
            currentReading: '',
            lastBillingMonth: 'May 2026',
            billStatus: statuses[Math.floor(Math.random() * 4)],
            billId: `B-2026-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            hasUnpaid: Math.random() > 0.7,
            unpaidAmount: Math.floor(Math.random() * 5000) + 1000,
            lateFee: Math.floor(Math.random() * 500) + 100,
        }));
    };

    // ============================================
    // HELPERS
    // ============================================

    const getConsumerTypeLabel = (type: string) => {
        const types: Record<string, string> = { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial' };
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

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            generated: { color: 'bg-green-100 text-green-700', label: 'Bill Ready', icon: CheckCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: FileText },
            paid: { color: 'bg-blue-100 text-blue-700', label: 'Paid', icon: CreditCard },
        };
        return statuses[status] || statuses.pending;
    };

    // ============================================
    // OPEN BILL MODAL
    // ============================================

    const openBillModal = (consumer: Consumer) => {
        setSelectedConsumer(consumer);

        const prevReading = consumer.previousReading || 0;
        const currentReadingInput = consumer.currentReading || '';

        // Check if consumer has unpaid bills
        const hasUnpaid = consumer.hasUnpaid || false;
        const unpaidAmount = consumer.unpaidAmount || 0;
        const lateFee = consumer.lateFee || 0;

        setBillData({
            meterNo: consumer.meterNo,
            consumerName: consumer.name,
            consumerType: consumer.consumerType,
            previousReading: prevReading,
            currentReading: 0,
            unitsConsumed: 0,
            ratePerUnit: ratePerUnit[consumer.consumerType as keyof typeof ratePerUnit],
            totalAmount: 0,
            billingMonth: `${selectedMonth} ${selectedYear}`,
            dueDate: dueDate,
            unpaidAmount: hasUnpaid ? unpaidAmount : 0,
            lateFee: hasUnpaid ? lateFee : 0,
            grandTotal: 0,
            status: 'pending',
        });

        setShowBillModal(true);
    };

    // ============================================
    // CALCULATE BILL
    // ============================================

    const calculateBill = () => {
        if (!billData || !selectedConsumer) return;

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
    // GENERATE BILL (Save to Database)
    // ============================================

    const generateBill = async () => {
        if (!billData || !selectedConsumer) return;

        setIsGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');

            // Send bill to backend
            const response = await fetch(`${API_URL}/api/billing/generate-bill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    meterNo: billData.meterNo,
                    consumerName: billData.consumerName,
                    consumerType: billData.consumerType,
                    previousReading: billData.previousReading,
                    currentReading: billData.currentReading,
                    unitsConsumed: billData.unitsConsumed,
                    ratePerUnit: billData.ratePerUnit,
                    totalAmount: billData.totalAmount,
                    billingMonth: billData.billingMonth,
                    dueDate: billData.dueDate,
                    unpaidAmount: billData.unpaidAmount,
                    lateFee: billData.lateFee,
                    grandTotal: billData.grandTotal,
                    consumerId: selectedConsumer.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate bill');
            }

            // Update consumer status
            setConsumers(prev => prev.map(c =>
                c.id === selectedConsumer.id
                    ? { ...c, billStatus: 'generated', billId: data.data?.billId || c.billId }
                    : c
            ));
            setFilteredConsumers(prev => prev.map(c =>
                c.id === selectedConsumer.id
                    ? { ...c, billStatus: 'generated', billId: data.data?.billId || c.billId }
                    : c
            ));

            setShowBillModal(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

        } catch (error: any) {
            console.error('Generate bill error:', error);
            setError(error.message || 'Failed to generate bill');
        } finally {
            setIsGenerating(false);
        }
    };

    // ============================================
    // FILTER CONSUMERS
    // ============================================

    const filteredByMonth = consumers.filter(c => {
        const currentMonth = `${selectedMonth} ${selectedYear}`;
        return c.lastBillingMonth !== currentMonth || c.billStatus === 'pending';
    });

    const searchFiltered = filteredByMonth.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.meterNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalConsumers = searchFiltered.length;
    const readyCount = searchFiltered.filter(c => c.billStatus === 'generated' || c.billStatus === 'paid').length;
    const pendingCount = searchFiltered.filter(c => c.billStatus === 'pending').length;

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
                    <p className="text-gray-500 text-sm">Enter current readings and generate bills for consumers</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/billing_wings')}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
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

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Consumers"
                    value={totalConsumers}
                    icon={<Users size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                />
                <StatCard
                    title="Bill Ready"
                    value={readyCount}
                    icon={<CheckCircle size={20} className="text-white" />}
                    bgColor="bg-green-100"
                />
                <StatCard
                    title="Pending Generation"
                    value={pendingCount}
                    icon={<FileText size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
                />
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by consumer name or meter number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Consumers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Reading</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Reading</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {searchFiltered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No consumers found for this month.
                                    </td>
                                </tr>
                            ) : (
                                searchFiltered.map((consumer) => {
                                    const StatusBadge = getStatusBadge(consumer.billStatus || 'pending');
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={consumer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {consumer.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{consumer.name}</p>
                                                        <p className="text-xs text-gray-400">{consumer.mobile}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-emerald-600">{consumer.meterNo}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(consumer.consumerType)}`}>
                                                    {getConsumerTypeLabel(consumer.consumerType)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{consumer.previousReading || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{consumer.currentReading || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openBillModal(consumer)}
                                                    className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                                                >
                                                    {consumer.billStatus === 'generated' || consumer.billStatus === 'paid' ? (
                                                        <>
                                                            <Eye size={14} />
                                                            <span>View</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText size={14} />
                                                            <span>Generate</span>
                                                        </>
                                                    )}
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

            {/* Bill Modal */}
            {showBillModal && billData && selectedConsumer && (
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

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Consumer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Consumer</p>
                                    <p className="text-sm font-medium">{billData.consumerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Meter</p>
                                    <p className="text-sm font-bold text-emerald-600">{billData.meterNo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Type</p>
                                    <p className="text-sm font-medium">{getConsumerTypeLabel(billData.consumerType)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Billing Month</p>
                                    <p className="text-sm font-medium">{billData.billingMonth}</p>
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
                                    />
                                    {billData.currentReading <= billData.previousReading && billData.currentReading > 0 && (
                                        <p className="text-red-500 text-xs mt-1">Must be greater than previous reading</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Unpaid Dues (if any) */}
                        {(billData.unpaidAmount > 0 || billData.lateFee > 0) && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center space-x-2">
                                    <AlertCircle size={16} />
                                    <span>Previous Month Unpaid Dues</span>
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-red-600">Unpaid Amount</span>
                                        <span className="font-medium text-red-700">৳{billData.unpaidAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-red-600">Late Fee (5%)</span>
                                        <span className="font-medium text-red-700">৳{billData.lateFee.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                <p className="text-xs text-gray-400 mt-2">Due Date: {billData.dueDate}</p>
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