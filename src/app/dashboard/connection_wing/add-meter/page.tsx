// app/dashboard/connection_wing/add-meter/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Save,
    Zap,
    User,
    Phone,
    Mail,
    Home,
    MapPin,
    CreditCard,
    Package,
    Building,
    FileText,
    AlertCircle,
    Calendar,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FormData {
    meterNo: string;
    consumerName: string;
    feederName: string;
    connectionDate: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    address: string;
    mobile: string;
    email: string;
    initialReading: string;
    remarks: string;
}

interface FormErrors {
    [key: string]: string;
}

const FEEDER_OPTIONS = ['Trimohoni', 'Circuit-Hose', 'DC-Court', 'N.S-Road'];

export default function ConnectionWingAddMeterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [meterId, setMeterId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState<FormData>({
        meterNo: '',
        consumerName: '',
        feederName: '',
        connectionDate: '',
        consumerType: 'residential',
        address: '',
        mobile: '',
        email: '',
        initialReading: '',
        remarks: '',
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
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.meterNo.trim()) newErrors.meterNo = 'Meter number is required';
        if (!formData.consumerName.trim()) newErrors.consumerName = 'Consumer name is required';
        if (!formData.feederName) newErrors.feederName = 'Please select a feeder';
        if (!formData.connectionDate) newErrors.connectionDate = 'Connection date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                    ...formData,
                    initialReading: Number(formData.initialReading) || 0,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add meter');
            }

            setMeterId(data.data?.meterNo || '');
            setSubmitSuccess(true);

            setFormData({
                meterNo: '',
                consumerName: '',
                feederName: '',
                connectionDate: '',
                consumerType: 'residential',
                address: '',
                mobile: '',
                email: '',
                initialReading: '',
                remarks: '',
            });

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
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Meter Added Successfully! 🎉</h2>
                    <p className="text-gray-500 mb-4">
                        The meter has been added to the system. The consumer can now claim it during registration.
                    </p>
                    {meterId && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">Meter Number</p>
                            <p className="text-xl font-bold text-emerald-700">{meterId}</p>
                        </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-blue-700">📌 Next Steps:</p>
                        <ul className="text-sm text-blue-600 list-disc list-inside mt-2 space-y-1">
                            <li>Consumer can register on the website</li>
                            <li>During registration, search for this meter number</li>
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
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setSubmitSuccess(false);
                            }}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
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
                        <Plus size={24} className="text-emerald-600" />
                        <span>Add Meter for Consumer</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Pre-add a meter so consumers can claim it during registration</p>
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
                </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Adding a Meter</h3>
                        <ul className="mt-2 space-y-1 text-sm text-emerald-100">
                            <li>• Add meter details before consumer registers</li>
                            <li>• Consumer can search and claim during registration</li>
                            <li>• After claiming, bills will be generated automatically</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/30 p-3 rounded-lg hidden sm:block">
                        <Package size={40} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Add Meter Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Meter Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Meter Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="meterNo"
                                value={formData.meterNo}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.meterNo ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="e.g., MTR-2026-016"
                            />
                        </div>
                        {errors.meterNo && <p className="text-red-500 text-xs mt-1">{errors.meterNo}</p>}
                    </div>

                    {/* Consumer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Consumer Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="consumerName"
                                value={formData.consumerName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.consumerName ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.consumerName && <p className="text-red-500 text-xs mt-1">{errors.consumerName}</p>}
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
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${errors.feederName ? 'border-red-500' : 'border-gray-200'
                                    }`}
                            >
                                <option value="">Select Feeder</option>
                                {FEEDER_OPTIONS.map((feeder) => (
                                    <option key={feeder} value={feeder}>{feeder}</option>
                                ))}
                            </select>
                        </div>
                        {errors.feederName && <p className="text-red-500 text-xs mt-1">{errors.feederName}</p>}
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
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.connectionDate ? 'border-red-500' : 'border-gray-200'
                                    }`}
                            />
                        </div>
                        {errors.connectionDate && <p className="text-red-500 text-xs mt-1">{errors.connectionDate}</p>}
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
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="017XX-XXXXXX"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Address
                        </label>
                        <div className="relative">
                            <Home size={18} className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Complete address"
                            />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Any additional notes..."
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
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
            </form>
        </div>
    );
}