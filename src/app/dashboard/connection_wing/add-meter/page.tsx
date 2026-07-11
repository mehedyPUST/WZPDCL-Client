// app/dashboard/connection_wing/add-meter/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    Loader2,
    ArrowLeft,
    Save,
    Package,
    MapPin,
    Calendar,
    Building,
    Zap,
    AlertCircle,
    Search,
    X,
    Shield,
    ClipboardCheck,
    Info,
    Plus,
    FileText,
    Factory,
    Hash,
    Tag,
    User,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FormData {
    meterNo: string;
    meterType: 'single_phase' | 'three_phase';
    manufacturer: string;
    feederName: string;
    connectionDate: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    initialReading: string;
    specialNote: string;
}

interface FormErrors {
    [key: string]: string;
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

export default function ConnectionWingAddMeterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [meterId, setMeterId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    // Meter check states
    const [isCheckingMeter, setIsCheckingMeter] = useState(false);
    const [meterCheckResult, setMeterCheckResult] = useState<MeterCheckResult | null>(null);
    const [meterChecked, setMeterChecked] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        meterNo: '',
        meterType: 'single_phase',
        manufacturer: '',
        feederName: '',
        connectionDate: '',
        consumerType: 'residential',
        initialReading: '',
        specialNote: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'meterNo') {
            setMeterChecked(false);
            setMeterCheckResult(null);
            setError(null);
        }
    };

    // ✅ Check meter availability
    const checkMeterAvailability = async () => {
        const meterNo = formData.meterNo.trim();

        if (!meterNo) {
            setErrors(prev => ({ ...prev, meterNo: 'Please enter a meter number to check' }));
            return;
        }

        setIsCheckingMeter(true);
        setMeterCheckResult(null);
        setError(null);

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
                setErrors(prev => ({
                    ...prev,
                    meterNo: data.data.message || 'This meter number already exists in the system'
                }));
            } else {
                setErrors(prev => ({ ...prev, meterNo: '' }));
            }

        } catch (error: any) {
            console.error('Check meter error:', error);
            setError(error.message || 'Failed to check meter availability');
            setMeterCheckResult({
                exists: false,
                isAvailable: false,
                message: 'Error checking meter'
            });
        } finally {
            setIsCheckingMeter(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.meterNo.trim()) {
            newErrors.meterNo = 'Meter number is required';
        } else if (meterCheckResult?.exists) {
            newErrors.meterNo = 'This meter number already exists. Please use a different meter number.';
        }

        if (!formData.meterType) {
            newErrors.meterType = 'Please select meter type';
        }
        if (!formData.manufacturer) {
            newErrors.manufacturer = 'Please select manufacturer';
        }
        if (!formData.feederName) {
            newErrors.feederName = 'Please select a feeder';
        }
        if (!formData.connectionDate) {
            newErrors.connectionDate = 'Connection date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.meterNo.trim() && !meterChecked) {
            await checkMeterAvailability();
            if (meterCheckResult?.exists) {
                return;
            }
        }

        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/connection-wing/add-meter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    meterNo: formData.meterNo.trim(),
                    meterType: formData.meterType,
                    manufacturer: formData.manufacturer,
                    feederName: formData.feederName,
                    connectionDate: formData.connectionDate,
                    consumerType: formData.consumerType,
                    initialReading: Number(formData.initialReading) || 0,
                    specialNote: formData.specialNote || '',
                    consumerName: 'Pending',
                    address: '',
                    mobile: '',
                    email: '',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.message?.toLowerCase().includes('duplicate') ||
                    data.message?.toLowerCase().includes('already exists')) {
                    setErrors(prev => ({
                        ...prev,
                        meterNo: 'This meter number already exists. Please use a different meter number.'
                    }));
                    setIsSubmitting(false);
                    return;
                }
                throw new Error(data.message || 'Failed to add meter');
            }

            setMeterId(data.data?.meterNo || '');
            setSubmitSuccess(true);

            setFormData({
                meterNo: '',
                meterType: 'single_phase',
                manufacturer: '',
                feederName: '',
                connectionDate: '',
                consumerType: 'residential',
                initialReading: '',
                specialNote: '',
            });
            setMeterCheckResult(null);
            setMeterChecked(false);
            setErrors({});

        } catch (error: any) {
            console.error('Add meter error:', error);
            setError(error.message || 'Failed to add meter. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-emerald-100">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={48} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Meter Added Successfully! 🎉</h2>
                    <p className="text-gray-500 mb-4">
                        The meter has been added to the system. Now you can add a consumer and link this meter.
                    </p>
                    {meterId && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">Meter Number</p>
                            <p className="text-2xl font-bold text-emerald-700">{meterId}</p>
                        </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-blue-700 font-medium">📌 Next Steps:</p>
                        <ul className="text-sm text-blue-600 list-disc list-inside mt-2 space-y-1">
                            <li>Go to <strong>"Add Consumer"</strong> to link this meter to a consumer</li>
                            <li>Consumer can then register on the website</li>
                            <li>Consumer can claim the meter to their account</li>
                            <li>After claiming, bills will appear for this meter</li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => {
                                setSubmitSuccess(false);
                                router.push('/dashboard/connection_wing');
                            }}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setSubmitSuccess(false);
                                router.push('/dashboard/connection_wing/add-consumer');
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                        >
                            <Plus size={18} />
                            <span>Add Consumer</span>
                        </button>
                        <button
                            onClick={() => {
                                setSubmitSuccess(false);
                            }}
                            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Add Another Meter
                        </button>
                    </div>
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
                        <Package size={24} className="text-emerald-600" />
                        <span>Add New Meter</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Add a meter so consumers can claim it later</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/connection_wing')}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
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

            {/* Info Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center space-x-2">
                            <Shield size={20} />
                            <span>Add Meter</span>
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-sm text-emerald-100">
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>Meter number must be unique in the system</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>System will automatically check for duplicates</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>After adding, go to "Add Consumer" to link with a consumer</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/30 p-4 rounded-2xl hidden sm:block">
                        <Package size={48} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Add Meter Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Meter Number with Check Button */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Meter Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="meterNo"
                                    value={formData.meterNo}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.meterNo ? 'border-red-500 bg-red-50' :
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
                                disabled={isCheckingMeter || !formData.meterNo.trim()}
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

                        {/* Meter availability status messages */}
                        {meterCheckResult && (
                            <div className={`mt-3 p-4 rounded-xl border ${meterCheckResult.exists
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-emerald-50 border-emerald-200'
                                }`}>
                                <div className="flex items-start space-x-3">
                                    {meterCheckResult.exists ? (
                                        <X size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={`text-sm font-medium ${meterCheckResult.exists ? 'text-red-700' : 'text-emerald-700'
                                            }`}>
                                            {meterCheckResult.message}
                                        </p>
                                        {meterCheckResult.exists && meterCheckResult.consumerName && (
                                            <p className="text-sm text-red-600 mt-1">
                                                <span className="font-medium">Consumer:</span> {meterCheckResult.consumerName}
                                            </p>
                                        )}
                                        {meterCheckResult.exists && meterCheckResult.claimedBy && meterCheckResult.claimedBy !== 'Not claimed yet' && (
                                            <p className="text-sm text-red-600">
                                                <span className="font-medium">Claimed by:</span> {meterCheckResult.claimedBy}
                                            </p>
                                        )}
                                        {!meterCheckResult.exists && (
                                            <p className="text-sm text-emerald-600 mt-1">
                                                ✅ This meter number is available and ready to be added
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors.meterNo && !meterCheckResult?.exists && (
                            <p className="text-red-500 text-sm mt-1">{errors.meterNo}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                            <Info size={12} />
                            <span>Click "Check" to verify if this meter number is available</span>
                        </p>
                    </div>

                    {/* Meter Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Meter Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="meterType"
                                value={formData.meterType}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${errors.meterType ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <option value="single_phase">Single Phase</option>
                                <option value="three_phase">Three Phase</option>
                            </select>
                        </div>
                        {errors.meterType && <p className="text-red-500 text-sm mt-1">{errors.meterType}</p>}
                    </div>

                    {/* Manufacturer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Manufacturer <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Factory size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${errors.manufacturer ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <option value="">Select Manufacturer</option>
                                {MANUFACTURER_OPTIONS.map((manufacturer) => (
                                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                                ))}
                            </select>
                        </div>
                        {errors.manufacturer && <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>}
                    </div>

                    {/* Feeder Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Feeder Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="feederName"
                                value={formData.feederName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${errors.feederName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <option value="">Select Feeder</option>
                                {FEEDER_OPTIONS.map((feeder) => (
                                    <option key={feeder} value={feeder}>{feeder}</option>
                                ))}
                            </select>
                        </div>
                        {errors.feederName && <p className="text-red-500 text-sm mt-1">{errors.feederName}</p>}
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
                                name="connectionDate"
                                value={formData.connectionDate}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.connectionDate ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                        </div>
                        {errors.connectionDate && <p className="text-red-500 text-sm mt-1">{errors.connectionDate}</p>}
                    </div>

                    {/* Consumer Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Consumer Type
                        </label>
                        <div className="relative">
                            <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="consumerType"
                                value={formData.consumerType}
                                onChange={handleChange}
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
                                name="initialReading"
                                value={formData.initialReading}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Special Note */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Special Note
                        </label>
                        <div className="relative">
                            <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                                name="specialNote"
                                value={formData.specialNote}
                                onChange={handleChange}
                                rows={2}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="Any special notes about this meter..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {meterCheckResult?.isAvailable ? (
                            <span className="text-emerald-600 flex items-center space-x-1 text-sm font-medium">
                                <CheckCircle size={16} />
                                <span>✅ Meter is available. Ready to add!</span>
                            </span>
                        ) : formData.meterNo && !meterChecked && (
                            <span className="text-amber-600 flex items-center space-x-1 text-sm font-medium">
                                <AlertCircle size={16} />
                                <span>Please check meter availability first</span>
                            </span>
                        )}
                        {meterCheckResult?.exists && (
                            <span className="text-red-600 flex items-center space-x-1 text-sm font-medium">
                                <X size={16} />
                                <span>Meter already exists. Please use a different number.</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/connection_wing')}
                            className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !meterCheckResult?.isAvailable}
                            className={`px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium flex items-center space-x-2 transition-all shadow-sm hover:shadow-md ${isSubmitting || !meterCheckResult?.isAvailable
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-emerald-700'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Add Meter</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}