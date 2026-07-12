// app/dashboard/connection_wing/applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap,
    FileText,
    CheckCircle,
    Clock,
    Users,
    MapPin,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    Calendar,
    X,
    User,
    Phone,
    Mail,
    Home,
    CreditCard,
    Building,
    Package,
    Send,
    Check,
    XCircle,
    ArrowRight,
    Filter,
    Activity,
    Plus,
    ListChecks,
    AlertTriangle,
    Save,
    Hourglass,
    ShieldAlert,
    Hash,
    Factory,
    Info,
    AlertCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

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
    status: 'pending_payment' | 'payment_done' | 'under_xen_review' | 'forwarded_to_wing' | 'team_sent' | 'connection_completed' | 'implemented' | 'rejected';
    paymentStatus: 'pending' | 'paid';
    feeAmount: number;
    assignedMeterNo: string | null;
    implementedAt: string | null;
    xenRemarks: string | null;
    connectionWingRemarks: string | null;
    createdAt: string;
    updatedAt: string;
}

interface MeterFormData {
    meterNo: string;
    meterSerialNo: string;
    meterType: 'single_phase' | 'three_phase';
    manufacturer: string;
    feederName: string;
    connectionDate: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    initialReading: string;
    specialNote: string;
    consumerName: string;
    address: string;
    mobile: string;
    email: string;
}

interface MeterCheckResult {
    exists: boolean;
    isAvailable: boolean;
    message: string;
    consumerName?: string;
    claimedBy?: string;
    status?: string;
}

const FEEDER_OPTIONS = ['Trimohoni', 'Circuit-Hose', 'DC-Court', 'N.S-Road'];
const MANUFACTURER_OPTIONS = ['ABB', 'Siemens', 'Schneider Electric', 'GE', 'L&T', 'WEG', 'C&S Electric', 'Other'];

export default function ConnectionWingApplicationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applications, setApplications] = useState<ConnectionApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<ConnectionApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showAssignMeterModal, setShowAssignMeterModal] = useState(false);
    const [actionType, setActionType] = useState<'team_sent' | 'connection_completed' | null>(null);
    const [actionRemarks, setActionRemarks] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pendingXenApproval: 0,
        forwardedToWing: 0,
        teamSent: 0,
        completed: 0,
        implemented: 0,
        rejected: 0,
    });
    const [user, setUser] = useState<any>(null);

    // ✅ Complete meter form with all fields
    const [meterForm, setMeterForm] = useState<MeterFormData>({
        meterNo: '',
        meterSerialNo: '',
        meterType: 'single_phase',
        manufacturer: '',
        feederName: '',
        connectionDate: '',
        consumerType: 'residential',
        initialReading: '',
        specialNote: '',
        consumerName: '',
        address: '',
        mobile: '',
        email: '',
    });
    const [meterErrors, setMeterErrors] = useState<{ [key: string]: string }>({});

    // ✅ Meter check states
    const [isCheckingMeter, setIsCheckingMeter] = useState(false);
    const [meterCheckResult, setMeterCheckResult] = useState<MeterCheckResult | null>(null);
    const [meterChecked, setMeterChecked] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const ITEMS_PER_PAGE = 5;

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
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(
                `${API_URL}/api/connection-wing/applications`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch applications');
            }

            const data = await response.json();
            const apps = data.data || [];
            setApplications(apps);

            const total = apps.length;
            const pendingXenApproval = apps.filter((a: ConnectionApplication) =>
                a.status === 'pending_payment' ||
                a.status === 'payment_done' ||
                a.status === 'under_xen_review'
            ).length;
            const forwardedToWing = apps.filter((a: ConnectionApplication) => a.status === 'forwarded_to_wing').length;
            const teamSent = apps.filter((a: ConnectionApplication) => a.status === 'team_sent').length;
            const completed = apps.filter((a: ConnectionApplication) => a.status === 'connection_completed').length;
            const implemented = apps.filter((a: ConnectionApplication) => a.status === 'implemented').length;
            const rejected = apps.filter((a: ConnectionApplication) => a.status === 'rejected').length;

            setStats({
                total,
                pendingXenApproval,
                forwardedToWing,
                teamSent,
                completed,
                implemented,
                rejected,
            });

        } catch (error: any) {
            console.error('Error fetching applications:', error);
            setError(error.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            pending_payment: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Payment', icon: Clock },
            payment_done: { color: 'bg-blue-100 text-blue-700', label: 'Payment Done', icon: CheckCircle },
            under_xen_review: { color: 'bg-indigo-100 text-indigo-700', label: 'Under XEN Review', icon: ShieldAlert },
            forwarded_to_wing: { color: 'bg-purple-100 text-purple-700', label: 'Forwarded to Wing', icon: Send },
            team_sent: { color: 'bg-blue-100 text-blue-700', label: 'Team Sent', icon: Users },
            connection_completed: { color: 'bg-orange-100 text-orange-700', label: 'Connection Completed', icon: CheckCircle },
            implemented: { color: 'bg-green-100 text-green-700', label: 'Implemented', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
        };
        return statuses[status] || statuses.forwarded_to_wing;
    };

    const getConnectionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const updateStatus = async (app: ConnectionApplication, newStatus: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(
                `${API_URL}/api/connection-wing/applications/${app.applicationId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        connectionWingRemarks: actionRemarks || `${newStatus.replace('_', ' ')} by connection wing`,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status');
            }

            await fetchApplications();
            setShowActionModal(false);
            setSelectedApp(null);
            setActionType(null);
            setActionRemarks('');

        } catch (error: any) {
            console.error('Update status error:', error);
            alert(error.message || 'Failed to update status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openActionModal = (app: ConnectionApplication, type: 'team_sent' | 'connection_completed') => {
        setSelectedApp(app);
        setActionType(type);
        setActionRemarks('');
        setShowActionModal(true);
    };

    // ✅ Open assign meter modal with pre-filled data from application
    const openAssignMeterModal = (app: ConnectionApplication) => {
        setSelectedApp(app);
        setMeterForm({
            meterNo: '',
            meterSerialNo: '',
            meterType: 'single_phase',
            manufacturer: '',
            feederName: app.feederName || '',
            connectionDate: new Date().toISOString().split('T')[0],
            consumerType: app.connectionType || 'residential',
            initialReading: '0',
            specialNote: `Assigned for application: ${app.applicationId}`,
            consumerName: app.applicantName || '',
            address: app.address || '',
            mobile: app.mobile || '',
            email: app.email || '',
        });
        setMeterErrors({});
        setMeterCheckResult(null);
        setMeterChecked(false);
        setShowAssignMeterModal(true);
    };

    // ✅ Check meter availability
    const checkMeterAvailability = async () => {
        const meterNo = meterForm.meterNo.trim();

        if (!meterNo) {
            setMeterErrors(prev => ({ ...prev, meterNo: 'Please enter a meter number to check' }));
            return;
        }

        setIsCheckingMeter(true);
        setMeterCheckResult(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/meters/check-availability/${encodeURIComponent(meterNo)}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check meter availability');
            }

            setMeterCheckResult(data.data);
            setMeterChecked(true);

            if (data.data.exists) {
                setMeterErrors(prev => ({
                    ...prev,
                    meterNo: data.data.message || 'This meter number already exists in the system'
                }));
            } else {
                setMeterErrors(prev => ({ ...prev, meterNo: '' }));
            }

        } catch (error: any) {
            console.error('Check meter error:', error);
            setMeterErrors(prev => ({ ...prev, meterNo: error.message || 'Failed to check meter' }));
        } finally {
            setIsCheckingMeter(false);
        }
    };

    // ✅ Submit assign meter with all fields
    const submitAssignMeter = async () => {
        if (!selectedApp) return;

        const errors: { [key: string]: string } = {};

        // Validate all required fields
        if (!meterForm.meterNo.trim()) {
            errors.meterNo = 'Meter number is required';
        } else if (meterCheckResult?.exists) {
            errors.meterNo = 'This meter number already exists';
        }

        if (!meterForm.meterSerialNo.trim()) {
            errors.meterSerialNo = 'Meter serial number is required';
        }

        if (!meterForm.meterType) {
            errors.meterType = 'Please select meter type';
        }

        if (!meterForm.manufacturer) {
            errors.manufacturer = 'Please select manufacturer';
        }

        if (!meterForm.feederName) {
            errors.feederName = 'Please select a feeder';
        }

        if (!meterForm.connectionDate) {
            errors.connectionDate = 'Connection date is required';
        }

        if (meterForm.initialReading && (isNaN(Number(meterForm.initialReading)) || Number(meterForm.initialReading) < 0)) {
            errors.initialReading = 'Please enter a valid reading';
        }

        if (Object.keys(errors).length > 0) {
            setMeterErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');

            // ✅ Send complete meter data to backend
            const response = await fetch(
                `${API_URL}/api/connection-wing/applications/${selectedApp.applicationId}/assign-meter`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        meterNo: meterForm.meterNo.trim(),
                        meterSerialNo: meterForm.meterSerialNo.trim(),
                        meterType: meterForm.meterType,
                        manufacturer: meterForm.manufacturer,
                        feederName: meterForm.feederName,
                        connectionDate: meterForm.connectionDate,
                        consumerType: meterForm.consumerType,
                        initialReading: Number(meterForm.initialReading) || 0,
                        specialNote: meterForm.specialNote || '',
                        consumerName: meterForm.consumerName || selectedApp.applicantName,
                        address: meterForm.address || selectedApp.address,
                        mobile: meterForm.mobile || selectedApp.mobile,
                        email: meterForm.email || selectedApp.email,
                        connectionWingRemarks: meterForm.specialNote || 'Meter assigned successfully',
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to assign meter');
            }

            setShowAssignMeterModal(false);
            setSelectedApp(null);
            await fetchApplications();

        } catch (error: any) {
            console.error('Assign meter error:', error);
            setMeterErrors({ submit: error.message || 'Failed to assign meter. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Action button function
    const getActionButton = (app: ConnectionApplication) => {
        const isWaitingForXen = ['pending_payment', 'payment_done', 'under_xen_review'].includes(app.status);

        if (isWaitingForXen) {
            return (
                <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Hourglass size={14} className="text-amber-600 animate-pulse" />
                    <span className="text-xs text-amber-700 font-medium">Awaiting XEN's Approval</span>
                </div>
            );
        }

        switch (app.status) {
            case 'forwarded_to_wing':
                return (
                    <button
                        onClick={() => openActionModal(app, 'team_sent')}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 shadow-sm"
                    >
                        <Send size={14} />
                        <span>Send Team</span>
                    </button>
                );
            case 'team_sent':
                return (
                    <button
                        onClick={() => openActionModal(app, 'connection_completed')}
                        className="px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1 shadow-sm"
                    >
                        <CheckCircle size={14} />
                        <span>Complete</span>
                    </button>
                );
            case 'connection_completed':
                return (
                    <button
                        onClick={() => openAssignMeterModal(app)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1 shadow-sm"
                    >
                        <Plus size={14} />
                        <span>Assign Meter</span>
                    </button>
                );
            case 'implemented':
                return (
                    <span className="text-xs text-green-600 font-medium flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={14} />
                        <span>Implemented</span>
                    </span>
                );
            case 'rejected':
                return (
                    <span className="text-xs text-red-600 font-medium flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
                        <XCircle size={14} />
                        <span>Rejected</span>
                    </span>
                );
            default:
                return (
                    <span className="text-xs text-gray-500 font-medium">
                        No Action
                    </span>
                );
        }
    };

    const getActionLabel = () => {
        switch (actionType) {
            case 'team_sent':
                return 'Send Team';
            case 'connection_completed':
                return 'Complete Connection';
            default:
                return '';
        }
    };

    const getActionColor = () => {
        switch (actionType) {
            case 'team_sent':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'connection_completed':
                return 'bg-orange-600 hover:bg-orange-700';
            default:
                return 'bg-emerald-600 hover:bg-emerald-700';
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.mobile.includes(searchTerm) ||
            app.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchesType = filterType === 'all' || app.connectionType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApplications.slice(
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

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertTriangle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchApplications}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                        <ListChecks size={24} className="text-emerald-600" />
                        <span>New Connection Applications</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage and process new connection applications</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchApplications}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <FileText size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Awaiting XEN</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.pendingXenApproval}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-100">
                            <Hourglass size={20} className="text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Forwarded</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.forwardedToWing}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100">
                            <Send size={20} className="text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Team Sent</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.teamSent}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <Users size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.completed}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-100">
                            <CheckCircle size={20} className="text-orange-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Implemented</p>
                            <p className="text-2xl font-bold text-green-600">{stats.implemented}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-100">
                            <XCircle size={20} className="text-red-600" />
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
                            placeholder="Search by application ID, name, mobile, or address..."
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
                            <option value="team_sent">Team Sent</option>
                            <option value="connection_completed">Connection Completed</option>
                            <option value="implemented">Implemented</option>
                            <option value="rejected">Rejected</option>
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
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No applications found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedApps.map((app) => {
                                    const StatusBadge = getStatusBadge(app.status);
                                    const StatusIcon = StatusBadge.icon;

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
                                                    {getActionButton(app)}
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

            {/* Details Modal */}
            {showDetailsModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Application Details</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500">Application ID</p><p className="text-sm font-medium">{selectedApp.applicationId}</p></div>
                            <div><p className="text-xs text-gray-500">Status</p><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedApp.status).color}`}>{getStatusBadge(selectedApp.status).label}</span></div>
                            <div><p className="text-xs text-gray-500">Applicant</p><p className="text-sm font-medium">{selectedApp.applicantName}</p></div>
                            <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium">{getConnectionTypeLabel(selectedApp.connectionType)}</p></div>
                            <div><p className="text-xs text-gray-500">Mobile</p><p className="text-sm font-medium">{selectedApp.mobile}</p></div>
                            <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{selectedApp.email}</p></div>
                            <div><p className="text-xs text-gray-500">Load</p><p className="text-sm font-medium">{selectedApp.loadRequired} kW</p></div>
                            <div><p className="text-xs text-gray-500">Feeder</p><p className="text-sm font-medium">{selectedApp.feederName}</p></div>
                            <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium">{selectedApp.address}</p></div>
                            {selectedApp.xenRemarks && (
                                <div className="col-span-2"><p className="text-xs text-gray-500">XEN Remarks</p><p className="text-sm text-gray-600">{selectedApp.xenRemarks}</p></div>
                            )}
                            {selectedApp.connectionWingRemarks && (
                                <div className="col-span-2"><p className="text-xs text-gray-500">Wing Remarks</p><p className="text-sm text-gray-600">{selectedApp.connectionWingRemarks}</p></div>
                            )}
                            {selectedApp.assignedMeterNo && (
                                <div className="col-span-2"><p className="text-xs text-gray-500">Assigned Meter</p><p className="text-sm font-bold text-emerald-600">{selectedApp.assignedMeterNo}</p></div>
                            )}
                            <div><p className="text-xs text-gray-500">Created</p><p className="text-sm text-gray-600">{new Date(selectedApp.createdAt).toLocaleString()}</p></div>
                            {selectedApp.implementedAt && (
                                <div><p className="text-xs text-gray-500">Implemented</p><p className="text-sm text-green-600">{new Date(selectedApp.implementedAt).toLocaleString()}</p></div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            {getActionButton(selectedApp)}
                            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal - Send Team / Complete */}
            {showActionModal && selectedApp && actionType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{getActionLabel()}</h3>
                            <button onClick={() => setShowActionModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600"><span className="font-medium">Application:</span> {selectedApp.applicationId}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Applicant:</span> {selectedApp.applicantName}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {getConnectionTypeLabel(selectedApp.connectionType)}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Current Status:</span> <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(selectedApp.status).color}`}>{getStatusBadge(selectedApp.status).label}</span></p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Remarks <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <textarea
                                value={actionRemarks}
                                onChange={(e) => setActionRemarks(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={`Add notes for ${getActionLabel().toLowerCase()}...`}
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateStatus(selectedApp, actionType)}
                                disabled={isSubmitting}
                                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${getActionColor()} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {actionType === 'team_sent' && <Send size={16} />}
                                        {actionType === 'connection_completed' && <CheckCircle size={16} />}
                                        <span>{getActionLabel()}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Updated Assign Meter Modal with all fields */}
            {showAssignMeterModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <Plus size={20} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Assign Meter</h3>
                                    <p className="text-sm text-gray-500">Add meter details for {selectedApp.applicationId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAssignMeterModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Application Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500">Application ID</p>
                                <p className="text-sm font-medium text-gray-800">{selectedApp.applicationId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Applicant</p>
                                <p className="text-sm font-medium text-gray-800">{selectedApp.applicantName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Connection Type</p>
                                <p className="text-sm font-medium text-gray-800">{getConnectionTypeLabel(selectedApp.connectionType)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Load Required</p>
                                <p className="text-sm font-medium text-gray-800">{selectedApp.loadRequired} kW</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Feeder</p>
                                <p className="text-sm font-medium text-gray-800">{selectedApp.feederName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{selectedApp.address}</p>
                            </div>
                        </div>

                        {meterErrors.submit && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center space-x-2">
                                <AlertCircle size={16} />
                                <span>{meterErrors.submit}</span>
                            </div>
                        )}

                        {/* Meter Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Meter Number with Check */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Meter Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={meterForm.meterNo}
                                            onChange={(e) => {
                                                setMeterForm(prev => ({ ...prev, meterNo: e.target.value }));
                                                setMeterChecked(false);
                                                setMeterCheckResult(null);
                                            }}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${meterErrors.meterNo ? 'border-red-500 bg-red-50' :
                                                meterCheckResult?.exists ? 'border-red-500 bg-red-50' :
                                                    meterCheckResult?.isAvailable ? 'border-green-500 bg-green-50' :
                                                        'border-gray-200'
                                                }`}
                                            placeholder="e.g., MTR-2026-016"
                                            disabled={isCheckingMeter}
                                        />
                                        {isCheckingMeter && (
                                            <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                        )}
                                        {!isCheckingMeter && meterCheckResult?.isAvailable && (
                                            <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                        )}
                                        {!isCheckingMeter && meterCheckResult?.exists && (
                                            <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={checkMeterAvailability}
                                        disabled={isCheckingMeter || !meterForm.meterNo.trim()}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center space-x-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                                    >
                                        {isCheckingMeter ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>Checking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search size={18} />
                                                <span>Check</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                {meterErrors.meterNo && (
                                    <p className="text-red-500 text-sm mt-1">{meterErrors.meterNo}</p>
                                )}
                                {meterCheckResult?.isAvailable && (
                                    <p className="text-emerald-600 text-sm mt-1 flex items-center space-x-1">
                                        <Check size={14} />
                                        <span>✅ Meter is available</span>
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                                    <Info size={12} />
                                    <span>Click "Check" to verify if this meter number is available</span>
                                </p>
                            </div>

                            {/* Meter Serial Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Meter Serial No <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={meterForm.meterSerialNo}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, meterSerialNo: e.target.value }))}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${meterErrors.meterSerialNo ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                            }`}
                                        placeholder="e.g., SN-2026-001"
                                    />
                                </div>
                                {meterErrors.meterSerialNo && (
                                    <p className="text-red-500 text-sm mt-1">{meterErrors.meterSerialNo}</p>
                                )}
                            </div>

                            {/* Meter Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Meter Type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={meterForm.meterType}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, meterType: e.target.value as any }))}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${meterErrors.meterType ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <option value="single_phase">Single Phase</option>
                                        <option value="three_phase">Three Phase</option>
                                    </select>
                                </div>
                                {meterErrors.meterType && <p className="text-red-500 text-sm mt-1">{meterErrors.meterType}</p>}
                            </div>

                            {/* Manufacturer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Manufacturer <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Factory size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={meterForm.manufacturer}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${meterErrors.manufacturer ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <option value="">Select Manufacturer</option>
                                        {MANUFACTURER_OPTIONS.map((manufacturer) => (
                                            <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                                        ))}
                                    </select>
                                </div>
                                {meterErrors.manufacturer && <p className="text-red-500 text-sm mt-1">{meterErrors.manufacturer}</p>}
                            </div>

                            {/* Feeder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Feeder Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={meterForm.feederName}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, feederName: e.target.value }))}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${meterErrors.feederName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <option value="">Select Feeder</option>
                                        {FEEDER_OPTIONS.map((feeder) => (
                                            <option key={feeder} value={feeder}>{feeder}</option>
                                        ))}
                                    </select>
                                </div>
                                {meterErrors.feederName && <p className="text-red-500 text-sm mt-1">{meterErrors.feederName}</p>}
                            </div>

                            {/* Connection Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Connection Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={meterForm.connectionDate}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, connectionDate: e.target.value }))}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${meterErrors.connectionDate ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                            }`}
                                    />
                                </div>
                                {meterErrors.connectionDate && <p className="text-red-500 text-sm mt-1">{meterErrors.connectionDate}</p>}
                            </div>

                            {/* Consumer Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Consumer Type
                                </label>
                                <div className="relative">
                                    <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={meterForm.consumerType}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, consumerType: e.target.value as any }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all"
                                    >
                                        <option value="residential">Residential</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="industrial">Industrial</option>
                                    </select>
                                </div>
                            </div>

                            {/* Initial Reading */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Initial Reading (kWh)
                                </label>
                                <div className="relative">
                                    <Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={meterForm.initialReading}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, initialReading: e.target.value }))}
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${meterErrors.initialReading ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {meterErrors.initialReading && <p className="text-red-500 text-sm mt-1">{meterErrors.initialReading}</p>}
                            </div>

                            {/* Special Note */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Special Note
                                </label>
                                <div className="relative">
                                    <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        value={meterForm.specialNote}
                                        onChange={(e) => setMeterForm(prev => ({ ...prev, specialNote: e.target.value }))}
                                        rows={2}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        placeholder="Any special notes about this meter..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                {meterCheckResult?.isAvailable && (
                                    <span className="text-emerald-600 flex items-center space-x-1 text-sm font-medium">
                                        <CheckCircle size={16} />
                                        <span>✅ Meter is available</span>
                                    </span>
                                )}
                                {meterForm.meterNo && !meterChecked && (
                                    <span className="text-amber-600 flex items-center space-x-1 text-sm font-medium">
                                        <AlertCircle size={16} />
                                        <span>Please check meter availability</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowAssignMeterModal(false)}
                                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitAssignMeter}
                                    disabled={isSubmitting || !meterCheckResult?.isAvailable}
                                    className={`px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium flex items-center space-x-2 transition-all shadow-sm hover:shadow-md ${isSubmitting || !meterCheckResult?.isAvailable
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-emerald-700'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Assigning...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            <span>Assign Meter</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}