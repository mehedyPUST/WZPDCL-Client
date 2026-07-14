// app/dashboard/consumer/connections/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap,
    User,
    Mail,
    Phone,
    MapPin,
    Home,
    Building,
    CreditCard,
    FileText,
    ArrowRight,
    Loader2,
    CheckCircle,
    AlertCircle,
    Package,
    ClipboardList,
    Clock,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Plus,
    Minus,
    XCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FormData {
    applicantName: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    connectionType: 'residential' | 'commercial' | 'industrial';
    loadRequired: string;
    voltageLevel: string;
    purpose: string;
    feederName: string;
    transformerNo: string;
    poleNumber: string;
    nearestLandmark: string;
    tinNumber: string;
    tradeLicense: string;
    plotNumber: string;
    holdingNumber: string;
    remarks: string;
}

interface ConnectionApplication {
    _id?: string;
    applicationId: string;
    applicantName: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    connectionType: 'residential' | 'commercial' | 'industrial';
    loadRequired: number;
    voltageLevel: string;
    purpose: string;
    feederName: string;
    transformerNo: string;
    poleNumber: string;
    nearestLandmark: string;
    consumerId: string;
    status: 'pending_payment' | 'payment_done' | 'under_xen_review' | 'forwarded_to_wing' | 'implemented' | 'rejected';
    paymentStatus: 'pending' | 'paid';
    feeAmount: number;
    assignedMeterNo: string | null;
    implementedAt: string | null;
    xenRemarks: string | null;
    connectionWingRemarks: string | null;
    createdAt: string;
    updatedAt: string;
}

const FEEDER_OPTIONS = ['Trimohoni', 'Circuit-Hose', 'DC-Court', 'N.S-Road'];
const TRANSFORMER_OPTIONS = ['TR-01', 'TR-02', 'TR-03', 'TR-04', 'TR-05', 'TR-06', 'TR-07', 'TR-08', 'TR-09', 'TR-10'];

export default function ConsumerConnectionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');
    const [user, setUser] = useState<any>(null);

    // ✅ Modal states
    const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<FormData>({
        applicantName: '',
        email: '',
        mobile: '',
        nidNo: '',
        address: '',
        connectionType: 'residential',
        loadRequired: '',
        voltageLevel: '220',
        purpose: '',
        feederName: '',
        transformerNo: '',
        poleNumber: '',
        nearestLandmark: '',
        tinNumber: '',
        tradeLicense: '',
        plotNumber: '',
        holdingNumber: '',
        remarks: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Applications List
    const [applications, setApplications] = useState<ConnectionApplication[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedApp, setSelectedApp] = useState<ConnectionApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentApp, setPaymentApp] = useState<ConnectionApplication | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await authClient.getSession();
                // ✅ FIX: Use type assertion for custom fields
                const userData = data?.user as any;
                setUser(userData || null);
                if (userData) {
                    setFormData(prev => ({
                        ...prev,
                        applicantName: userData.name || '',
                        email: userData.email || '',
                        mobile: userData.mobile || '',
                        nidNo: userData.nidNo || '',
                    }));
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/connection-applications/consumer/${user?.id}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch applications');
            }

            setApplications(data.data || []);
        } catch (error: any) {
            console.error('Error fetching applications:', error);
            setError(error.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Helper function to get total amount (Connection Fee + Security Deposit)
    const getTotalAmount = (app: ConnectionApplication) => {
        let connectionFee = app.feeAmount || 0;
        let securityDeposit = 0;

        if (app.connectionType === 'residential') {
            securityDeposit = 2000;
        } else if (app.connectionType === 'commercial') {
            securityDeposit = 5000;
        } else if (app.connectionType === 'industrial') {
            securityDeposit = 10000;
        }

        return connectionFee + securityDeposit;
    };

    // Form Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.applicantName.trim()) newErrors.applicantName = 'Applicant name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile number';
        if (!formData.nidNo.trim()) newErrors.nidNo = 'NID number is required';
        else if (!/^\d{10,17}$/.test(formData.nidNo)) newErrors.nidNo = 'Invalid NID number';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.connectionType) newErrors.connectionType = 'Connection type is required';
        if (!formData.loadRequired) newErrors.loadRequired = 'Load requirement is required';
        else if (isNaN(Number(formData.loadRequired)) || Number(formData.loadRequired) <= 0) {
            newErrors.loadRequired = 'Please enter a valid load value';
        }
        if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
        if (!formData.feederName) newErrors.feederName = 'Please select a feeder';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');

            let connectionFee = 0;
            if (formData.connectionType === 'residential') connectionFee = 5000;
            else if (formData.connectionType === 'commercial') connectionFee = 10000;
            else if (formData.connectionType === 'industrial') connectionFee = 15000;

            const response = await fetch(`${API_URL}/api/connection-applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
                body: JSON.stringify({
                    ...formData,
                    consumerId: user?.id || 'unknown',
                    loadRequired: Number(formData.loadRequired),
                    status: 'pending_payment',
                    paymentStatus: 'pending',
                    feeAmount: connectionFee,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit application');
            setApplicationId(data.data?.applicationId || '');
            setSubmitSuccess(true);
            await fetchApplications();
            setShowNewConnectionModal(false);

            // Reset form
            setFormData({
                ...formData,
                loadRequired: '',
                purpose: '',
                feederName: '',
                transformerNo: '',
                poleNumber: '',
                nearestLandmark: '',
                tinNumber: '',
                tradeLicense: '',
                plotNumber: '',
                holdingNumber: '',
                remarks: '',
            });

        } catch (error: any) {
            console.error('Submission error:', error);
            setErrors(prev => ({ ...prev, submit: error.message || 'Failed to submit application' }));
        } finally { setIsSubmitting(false); }
    };

    // Payment Handlers
    const handlePayment = async (app: ConnectionApplication) => {
        setPaymentApp(app);
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        if (!paymentApp) return;

        setIsProcessingPayment(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const totalAmount = getTotalAmount(paymentApp);

            const response = await fetch(`${API_URL}/api/create-payment-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    applicationId: paymentApp.applicationId,
                    amount: totalAmount,
                    consumerId: user?.id,
                    consumerName: user?.name,
                    email: user?.email,
                    description: `New Connection Fee - ${paymentApp.applicationId}`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create payment session');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error: any) {
            console.error('❌ Payment error:', error);
            setError(error.message || 'Payment processing failed. Please try again.');
            setIsProcessingPayment(false);
        }
    };

    // Status Helpers
    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            pending_payment: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Payment', icon: Clock },
            payment_done: { color: 'bg-blue-100 text-blue-700', label: 'Payment Done', icon: CheckCircle },
            under_xen_review: { color: 'bg-purple-100 text-purple-700', label: 'Under XEN Review', icon: Loader2 },
            forwarded_to_wing: { color: 'bg-orange-100 text-orange-700', label: 'Forwarded to Wing', icon: ArrowRight },
            implemented: { color: 'bg-green-100 text-green-700', label: 'Implemented', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
        };
        return statuses[status] || statuses.pending_payment;
    };

    const getConnectionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const getStatusProgress = (status: string) => {
        const steps = [
            'pending_payment',
            'payment_done',
            'under_xen_review',
            'forwarded_to_wing',
            'implemented',
        ];
        const index = steps.indexOf(status);
        if (index === -1) return 0;
        return Math.round((index / (steps.length - 1)) * 100);
    };

    // Filter and Pagination
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.mobile.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApplications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = [
        { label: 'Total Applications', value: applications.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Pending Payment', value: applications.filter(a => a.status === 'pending_payment').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Under Review', value: applications.filter(a => a.status === 'under_xen_review' || a.status === 'forwarded_to_wing').length, icon: Loader2, color: 'bg-purple-100 text-purple-600' },
        { label: 'Completed', value: applications.filter(a => a.status === 'implemented').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    ];

    // ✅ Success Modal
    if (submitSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted! 🎉</h2>
                    <p className="text-gray-500 mb-4">Your new connection application has been submitted successfully.</p>
                    {applicationId && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">Application ID</p>
                            <p className="text-xl font-bold text-emerald-700">{applicationId}</p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setSubmitSuccess(false)}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            View Applications
                        </button>
                        <button
                            onClick={() => { setSubmitSuccess(false); setShowNewConnectionModal(true); }}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                            Apply Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <Zap size={24} className="text-emerald-600" />
                        <span>Connections</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Apply for new connection or track existing applications</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchApplications}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => setShowNewConnectionModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>New Application</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
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
                            placeholder="Search by application ID, name, or mobile..."
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
                            <option value="pending_payment">Pending Payment</option>
                            <option value="payment_done">Payment Done</option>
                            <option value="under_xen_review">Under XEN Review</option>
                            <option value="forwarded_to_wing">Forwarded to Wing</option>
                            <option value="implemented">Implemented</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No applications found.
                                        <button
                                            onClick={() => setShowNewConnectionModal(true)}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium ml-1"
                                        >
                                            Apply for new connection
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                paginatedApps.map((app) => {
                                    const StatusBadge = getStatusBadge(app.status);
                                    const StatusIcon = StatusBadge.icon;
                                    const totalAmount = getTotalAmount(app);

                                    return (
                                        <tr key={app.applicationId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">{app.applicationId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{app.applicantName}</p>
                                                <p className="text-xs text-gray-400">{app.mobile}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{getConnectionTypeLabel(app.connectionType)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{app.loadRequired} kW</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">৳{totalAmount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                    {app.status === 'pending_payment' && (
                                                        <button
                                                            onClick={() => handlePayment(app)}
                                                            className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                                                        >
                                                            <CreditCard size={12} />
                                                            <span>Pay ৳{totalAmount.toLocaleString()}</span>
                                                        </button>
                                                    )}
                                                    {app.status === 'payment_done' && (
                                                        <span className="text-xs text-blue-600 font-medium">Payment Done</span>
                                                    )}
                                                    {app.status === 'implemented' && (
                                                        <span className="text-xs text-green-600 font-medium">✅ Implemented</span>
                                                    )}
                                                </div>
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
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredApplications.length)} of {filteredApplications.length} applications
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
            </div>

            {/* ✅ New Connection Modal */}
            {showNewConnectionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <Zap size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">New Connection Application</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowNewConnectionModal(false);
                                    setErrors({});
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-4 text-white mb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold">Before You Apply</h4>
                                    <ul className="mt-1 space-y-0.5 text-xs text-emerald-100">
                                        <li>• Have your NID, proof of address, and land documents ready</li>
                                        <li>• Connection fee: Residential ৳5,000 | Commercial ৳10,000 | Industrial ৳15,000</li>
                                        <li>• Applications processed within 5-7 business days</li>
                                    </ul>
                                </div>
                                <div className="bg-emerald-500/30 p-2 rounded-lg hidden sm:block">
                                    <ClipboardList size={32} className="text-white" />
                                </div>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-3 mb-4">
                                <AlertCircle size={18} className="text-red-600" />
                                <p className="text-sm text-red-700">{errors.submit}</p>
                                <button
                                    onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Personal Information */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <User size={16} className="text-emerald-600" />
                                    <span>Personal Information</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Applicant Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.applicantName ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="Full name" />
                                        {errors.applicantName && <p className="text-red-500 text-xs mt-1">{errors.applicantName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="you@example.com" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.mobile ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="017XX-XXXXXX" />
                                        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">NID Number <span className="text-red-500">*</span></label>
                                        <input type="text" name="nidNo" value={formData.nidNo} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.nidNo ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="12345678901234567" />
                                        {errors.nidNo && <p className="text-red-500 text-xs mt-1">{errors.nidNo}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Connection Details */}
                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <Zap size={16} className="text-emerald-600" />
                                    <span>Connection Details</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Connection Type <span className="text-red-500">*</span></label>
                                        <select name="connectionType" value={formData.connectionType} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${errors.connectionType ? 'border-red-500' : 'border-gray-200'}`}>
                                            <option value="residential">Residential</option>
                                            <option value="commercial">Commercial</option>
                                            <option value="industrial">Industrial</option>
                                        </select>
                                        {errors.connectionType && <p className="text-red-500 text-xs mt-1">{errors.connectionType}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Load Required (kW) <span className="text-red-500">*</span></label>
                                        <input type="number" name="loadRequired" value={formData.loadRequired} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.loadRequired ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="e.g., 5" step="0.5" min="1" />
                                        {errors.loadRequired && <p className="text-red-500 text-xs mt-1">{errors.loadRequired}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Voltage Level</label>
                                        <select name="voltageLevel" value={formData.voltageLevel} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                            <option value="220">220V (Single Phase)</option>
                                            <option value="380">380V (Three Phase)</option>
                                            <option value="11000">11kV (High Tension)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Purpose <span className="text-red-500">*</span></label>
                                        <input type="text" name="purpose" value={formData.purpose} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.purpose ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="e.g., New house, Shop, Factory" />
                                        {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <MapPin size={16} className="text-emerald-600" />
                                    <span>Location Details</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="Complete address" />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Feeder Name <span className="text-red-500">*</span></label>
                                        <select name="feederName" value={formData.feederName} onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${errors.feederName ? 'border-red-500' : 'border-gray-200'}`}>
                                            <option value="">Select Feeder</option>
                                            {FEEDER_OPTIONS.map((feeder) => (<option key={feeder} value={feeder}>{feeder}</option>))}
                                        </select>
                                        {errors.feederName && <p className="text-red-500 text-xs mt-1">{errors.feederName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Transformer Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                                        <select name="transformerNo" value={formData.transformerNo} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                            <option value="">Select Transformer</option>
                                            {TRANSFORMER_OPTIONS.map((tr) => (<option key={tr} value={tr}>{tr}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Pole Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                                        <input type="text" name="poleNumber" value={formData.poleNumber} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., P-123" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Nearest Landmark</label>
                                        <input type="text" name="nearestLandmark" value={formData.nearestLandmark} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., Near the local mosque" />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <FileText size={16} className="text-emerald-600" />
                                    <span>Additional Information</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">TIN Number</label>
                                        <input type="text" name="tinNumber" value={formData.tinNumber} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="TIN number (if any)" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Trade License</label>
                                        <input type="text" name="tradeLicense" value={formData.tradeLicense} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="For commercial connections" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Plot Number</label>
                                        <input type="text" name="plotNumber" value={formData.plotNumber} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Plot number" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Holding Number</label>
                                        <input type="text" name="holdingNumber" value={formData.holdingNumber} onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Holding number" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Any additional information" />
                                </div>
                            </div>

                            {/* Fee Summary */}
                            <div className="border-t border-gray-100 pt-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Fee Summary</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-1 text-sm">
                                            <span className="text-gray-600">Connection Fee</span>
                                            <span className="font-medium">
                                                {formData.connectionType === 'residential' ? '৳5,000' :
                                                    formData.connectionType === 'commercial' ? '৳10,000' : '৳15,000'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-1 text-sm border-t border-gray-200">
                                            <span className="text-gray-600">Security Deposit</span>
                                            <span className="font-medium">
                                                {formData.connectionType === 'residential' ? '৳2,000' :
                                                    formData.connectionType === 'commercial' ? '৳5,000' : '৳10,000'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-1 text-sm border-t border-gray-200">
                                            <span className="text-sm font-semibold text-gray-800">Total</span>
                                            <span className="text-base font-bold text-emerald-700">
                                                {formData.connectionType === 'residential' ? '৳7,000' :
                                                    formData.connectionType === 'commercial' ? '৳15,000' : '৳25,000'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewConnectionModal(false);
                                        setErrors({});
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className={`px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
                                        }`}>
                                    {isSubmitting ?
                                        <><Loader2 size={16} className="animate-spin" /><span>Submitting...</span></> :
                                        <><span>Submit Application</span><ArrowRight size={16} /></>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && paymentApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <CreditCard size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Pay Now</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPaymentApp(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">Application ID</span>
                                    <span className="text-sm font-medium">{paymentApp.applicationId}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Connection Type</span>
                                    <span className="text-sm font-medium">{getConnectionTypeLabel(paymentApp.connectionType)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Connection Fee</span>
                                    <span className="text-sm font-medium">৳{paymentApp.feeAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Security Deposit</span>
                                    <span className="text-sm font-medium">
                                        ৳{paymentApp.connectionType === 'residential' ? '2,000' :
                                            paymentApp.connectionType === 'commercial' ? '5,000' : '10,000'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-gray-800">Total Amount</span>
                                    <span className="text-xl font-bold text-emerald-600">
                                        ৳{getTotalAmount(paymentApp).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                                    <AlertCircle size={16} className="text-red-600" />
                                    <p className="text-sm text-red-700">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-auto text-red-500 hover:text-red-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 text-center">
                                You will be redirected to Stripe to complete your payment securely.
                            </p>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentApp(null);
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processPayment}
                                    disabled={isProcessingPayment}
                                    className={`px-6 py-2 bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2 ${isProcessingPayment ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
                                        }`}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={16} />
                                            <span>Pay ৳{getTotalAmount(paymentApp).toLocaleString()}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Application Details</h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Status Progress Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                <span>Progress</span>
                                <span className="font-medium text-emerald-600">{getStatusProgress(selectedApp.status)}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                    style={{ width: `${getStatusProgress(selectedApp.status)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                <span>Submitted</span>
                                <span>Payment</span>
                                <span>XEN Review</span>
                                <span>Wing</span>
                                <span>Implemented</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Application ID</p>
                                <p className="text-sm font-medium">{selectedApp.applicationId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedApp.status).color}`}>
                                    {getStatusBadge(selectedApp.status).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Applicant Name</p>
                                <p className="text-sm font-medium">{selectedApp.applicantName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Connection Type</p>
                                <p className="text-sm font-medium">{getConnectionTypeLabel(selectedApp.connectionType)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Mobile</p>
                                <p className="text-sm font-medium">{selectedApp.mobile}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium">{selectedApp.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Load Required</p>
                                <p className="text-sm font-medium">{selectedApp.loadRequired} kW</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Voltage Level</p>
                                <p className="text-sm font-medium">{selectedApp.voltageLevel}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Feeder</p>
                                <p className="text-sm font-medium">{selectedApp.feederName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Transformer</p>
                                <p className="text-sm font-medium">{selectedApp.transformerNo || 'N/A'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{selectedApp.address}</p>
                            </div>
                            {selectedApp.assignedMeterNo && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Assigned Meter Number</p>
                                    <p className="text-sm font-bold text-emerald-600">{selectedApp.assignedMeterNo}</p>
                                </div>
                            )}
                            {selectedApp.xenRemarks && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">XEN Remarks</p>
                                    <p className="text-sm text-gray-600">{selectedApp.xenRemarks}</p>
                                </div>
                            )}
                            {selectedApp.connectionWingRemarks && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Wing Remarks</p>
                                    <p className="text-sm text-gray-600">{selectedApp.connectionWingRemarks}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Submitted On</p>
                                <p className="text-sm text-gray-600">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                            </div>
                            {selectedApp.implementedAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Implemented On</p>
                                    <p className="text-sm text-green-600">{new Date(selectedApp.implementedAt).toLocaleString()}</p>
                                </div>
                            )}
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Fee Amount</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">Connection Fee: ৳{selectedApp.feeAmount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Security Deposit: ৳{selectedApp.connectionType === 'residential' ? '2,000' :
                                        selectedApp.connectionType === 'commercial' ? '5,000' : '10,000'}</p>
                                    <p className="text-lg font-bold text-emerald-600">
                                        Total: ৳{getTotalAmount(selectedApp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            {selectedApp.status === 'pending_payment' && (
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handlePayment(selectedApp);
                                    }}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                                >
                                    <CreditCard size={16} />
                                    <span>Pay ৳{getTotalAmount(selectedApp).toLocaleString()}</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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