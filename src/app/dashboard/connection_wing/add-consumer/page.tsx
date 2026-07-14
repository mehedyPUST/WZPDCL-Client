'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    CreditCard,
    Home,
    MapPin,
    Building,
    Package,
    AlertCircle,
    X,
    User as UserIcon,
    Shield,
    ClipboardCheck,
    Info,
    Link2,
    UserPlus,
    Clock,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FormData {
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    feederName: string;
    meterNo: string;
    isActive: boolean;
}

interface FormErrors {
    [key: string]: string;
}

interface MeterValidationResult {
    exists: boolean;
    isAvailable: boolean;
    isAssigned: boolean;
    assignedTo?: {
        name: string;
        email: string;
        id: string;
    };
    message: string;
    meterData?: any;
}

interface FieldCheckResult {
    exists: boolean;
    message: string;
    field: string;
}

interface ResponseData {
    userId?: string;
    isNewUser?: boolean;
    isExistingConsumer?: boolean;
    nextSteps?: string[];
    _id?: string;
}

const FEEDER_OPTIONS = ['Trimohoni', 'Circuit-Hose', 'DC-Court', 'N.S-Road'];

export default function ConnectionWingAddConsumerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [consumerId, setConsumerId] = useState('');
    const [responseData, setResponseData] = useState<ResponseData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    // ✅ Validation states
    const [meterChecking, setMeterChecking] = useState(false);
    const [meterValidation, setMeterValidation] = useState<MeterValidationResult | null>(null);

    // ✅ Unique field checking states
    const [checkingField, setCheckingField] = useState<string | null>(null);
    const [fieldValid, setFieldValid] = useState<{ [key: string]: boolean | null }>({});
    const [fieldCheckResult, setFieldCheckResult] = useState<{ [key: string]: FieldCheckResult | null }>({});

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobile: '',
        nidNo: '',
        address: '',
        consumerType: 'residential',
        feederName: '',
        meterNo: '',
        isActive: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

    // ✅ Check field uniqueness (Email, Mobile, NID)
    const checkFieldUniqueness = async (field: string, value: string) => {
        if (!value.trim()) return;

        setCheckingField(field);
        setFieldValid(prev => ({ ...prev, [field]: null }));

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/consumers/check-unique?field=${field}&value=${encodeURIComponent(value.trim())}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check');
            }

            if (data.success && data.data) {
                const result: FieldCheckResult = {
                    exists: data.data.exists,
                    message: data.data.message,
                    field: field,
                };
                setFieldCheckResult(prev => ({ ...prev, [field]: result }));
                setFieldValid(prev => ({ ...prev, [field]: !data.data.exists }));

                if (data.data.exists) {
                    setErrors(prev => ({
                        ...prev,
                        [field]: data.data.message
                    }));
                } else {
                    setErrors(prev => ({ ...prev, [field]: '' }));
                }
            }
        } catch (error: any) {
            console.error(`Check ${field} error:`, error);
            setFieldValid(prev => ({ ...prev, [field]: false }));
        } finally {
            setCheckingField(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // ✅ Real-time validation for unique fields
        if (name === 'email' || name === 'mobile' || name === 'nidNo') {
            if (value.trim().length >= (name === 'nidNo' ? 5 : 3)) {
                checkFieldUniqueness(name, value);
            } else {
                setFieldValid(prev => ({ ...prev, [name]: null }));
                setFieldCheckResult(prev => ({ ...prev, [name]: null }));
            }
        }

        // ✅ Real-time meter validation
        if (name === 'meterNo') {
            validateMeterNumber(value);
        }
    };

    // ✅ Real-time meter validation with assignment check
    const validateMeterNumber = async (meterNo: string) => {
        if (!meterNo.trim()) {
            setMeterValidation(null);
            setErrors(prev => ({ ...prev, meterNo: '' }));
            return;
        }

        setMeterChecking(true);
        setMeterValidation(null);

        try {
            const token = localStorage.getItem('auth_token');

            // ✅ Check if meter exists
            const response = await fetch(
                `${API_URL}/api/meters/check-availability/${encodeURIComponent(meterNo.trim())}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check meter');
            }

            if (data.success && data.data) {
                const result: MeterValidationResult = {
                    exists: data.data.exists,
                    isAvailable: data.data.isAvailable,
                    isAssigned: false,
                    message: data.data.message,
                    meterData: data.data,
                };

                // ✅ If meter exists, check if it's assigned to anyone
                if (data.data.exists) {
                    const assignmentCheck = await fetch(
                        `${API_URL}/api/meters/check-assignment/${encodeURIComponent(meterNo.trim())}`,
                        {
                            headers: {
                                'Authorization': token ? `Bearer ${token}` : '',
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (assignmentCheck.ok) {
                        const assignmentData = await assignmentCheck.json();
                        if (assignmentData.success && assignmentData.data) {
                            if (assignmentData.data.isAssigned) {
                                result.isAssigned = true;
                                result.isAvailable = false;
                                result.assignedTo = assignmentData.data.assignedTo;
                                result.message = `This meter is already assigned to ${assignmentData.data.assignedTo.name}`;
                            }
                        }
                    }
                }

                setMeterValidation(result);

                if (!result.exists) {
                    setErrors(prev => ({
                        ...prev,
                        meterNo: 'Meter number not found in the system. Please add the meter first.'
                    }));
                } else if (result.isAssigned) {
                    setErrors(prev => ({
                        ...prev,
                        meterNo: `This meter is already assigned to ${result.assignedTo?.name} (${result.assignedTo?.email})`
                    }));
                } else {
                    setErrors(prev => ({ ...prev, meterNo: '' }));
                    if (data.data.feederName) {
                        setFormData(prev => ({
                            ...prev,
                            feederName: data.data.feederName || prev.feederName,
                        }));
                    }
                }
            }
        } catch (error: any) {
            console.error('Meter validation error:', error);
            setMeterValidation({
                exists: false,
                isAvailable: false,
                isAssigned: false,
                message: error.message || 'Failed to validate meter number'
            });
            setErrors(prev => ({
                ...prev,
                meterNo: error.message || 'Failed to validate meter number'
            }));
        } finally {
            setMeterChecking(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        } else if (fieldValid.email === false) {
            newErrors.email = fieldCheckResult.email?.message || 'Email already exists';
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
            newErrors.mobile = 'Invalid Bangladeshi mobile number';
        } else if (fieldValid.mobile === false) {
            newErrors.mobile = fieldCheckResult.mobile?.message || 'Mobile number already exists';
        }

        if (!formData.nidNo.trim()) {
            newErrors.nidNo = 'NID number is required';
        } else if (!/^\d{10,17}$/.test(formData.nidNo)) {
            newErrors.nidNo = 'Invalid NID number (10-17 digits)';
        } else if (fieldValid.nidNo === false) {
            newErrors.nidNo = fieldCheckResult.nidNo?.message || 'NID number already exists';
        }

        if (!formData.address.trim()) newErrors.address = 'Address is required';

        if (!formData.meterNo.trim()) {
            newErrors.meterNo = 'Meter number is required';
        } else if (!meterValidation?.exists || meterValidation?.isAssigned) {
            newErrors.meterNo = errors.meterNo || 'Please enter a valid and available meter number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Final validation before submit
        if (formData.email.trim()) {
            await checkFieldUniqueness('email', formData.email);
        }
        if (formData.mobile.trim()) {
            await checkFieldUniqueness('mobile', formData.mobile);
        }
        if (formData.nidNo.trim()) {
            await checkFieldUniqueness('nidNo', formData.nidNo);
        }

        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_URL}/api/connection-wing/add-consumer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    nidNo: formData.nidNo,
                    address: formData.address,
                    consumerType: formData.consumerType,
                    feederName: formData.feederName,
                    meterNo: formData.meterNo,
                    isActive: formData.isActive,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add consumer');
            }

            // ✅ Store response data
            setConsumerId(data.data?._id || data.data?.id || '');
            setResponseData({
                userId: data.data?.userId,
                isNewUser: data.data?.isNewUser,
                isExistingConsumer: data.data?.isExistingConsumer,
                nextSteps: data.data?.nextSteps,
                _id: data.data?._id,
            });
            setSubmitSuccess(true);

            // ✅ Reset form
            setFormData({
                name: '',
                email: '',
                mobile: '',
                nidNo: '',
                address: '',
                consumerType: 'residential',
                feederName: '',
                meterNo: '',
                isActive: true,
            });
            setMeterValidation(null);
            setFieldValid({});
            setFieldCheckResult({});

        } catch (error: any) {
            console.error('Add consumer error:', error);
            setError(error.message || 'Failed to add consumer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // SUCCESS PAGE
    // ============================================
    if (submitSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {responseData?.isNewUser === false ? 'Consumer Linked Successfully! 🔗' : 'Consumer Added Successfully! 🎉'}
                    </h2>

                    <p className="text-gray-500 mb-4">
                        {responseData?.isNewUser === false
                            ? 'Consumer has been linked to their existing account successfully.'
                            : responseData?.isExistingConsumer
                                ? 'Consumer already existed and has been updated with the new information.'
                                : 'Consumer has been added to the system. They can claim this meter after registration.'
                        }
                    </p>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600">Consumer ID</p>
                        <p className="text-xl font-bold text-emerald-700">{consumerId || 'N/A'}</p>
                    </div>

                    {responseData?.userId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">Linked User ID</p>
                            <p className="text-sm font-medium text-blue-700">{responseData.userId}</p>
                        </div>
                    )}

                    {responseData?.isNewUser !== false && responseData?.nextSteps && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-blue-700 font-medium flex items-center space-x-2">
                                <ClipboardCheck size={16} />
                                <span>📌 Next Steps:</span>
                            </p>
                            <ul className="text-sm text-blue-600 list-disc list-inside mt-2 space-y-1">
                                {responseData.nextSteps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {responseData?.isNewUser === false && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-green-700 font-medium flex items-center space-x-2">
                                <Link2 size={16} />
                                <span>✅ Already Registered:</span>
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                This consumer already has an account. They can now access their dashboard to view bills and manage connections.
                            </p>
                        </div>
                    )}

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
                                router.push('/dashboard/connection_wing/add-meter');
                            }}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <Package size={16} />
                            <span>Add Meter</span>
                        </button>
                        <button
                            onClick={() => {
                                setSubmitSuccess(false);
                                setConsumerId('');
                                setResponseData(null);
                                setFormData({
                                    name: '',
                                    email: '',
                                    mobile: '',
                                    nidNo: '',
                                    address: '',
                                    consumerType: 'residential',
                                    feederName: '',
                                    meterNo: '',
                                    isActive: true,
                                });
                                setMeterValidation(null);
                                setFieldValid({});
                                setFieldCheckResult({});
                            }}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Add Another Consumer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // MAIN FORM
    // ============================================
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Users size={24} className="text-emerald-600" />
                        <span>Add Consumer</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Add a new consumer and link to an existing meter</p>
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
                            <span>Add New Consumer</span>
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-sm text-emerald-100">
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>Email, Mobile, NID, and Meter must be unique</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>System will validate all fields in real-time</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>Meter must be available (not assigned to anyone)</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <ClipboardCheck size={14} />
                                <span>If user already exists, consumer will be linked automatically</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/30 p-4 rounded-2xl hidden sm:block">
                        <Users size={48} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Add Consumer Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email with Real-time Validation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.email ? 'border-red-500 bg-red-50' :
                                    fieldValid.email === true ? 'border-green-500 bg-green-50' :
                                        fieldValid.email === false ? 'border-red-500 bg-red-50' :
                                            'border-gray-200'
                                    }`}
                                placeholder="john@example.com"
                            />
                            {checkingField === 'email' && (
                                <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {!checkingField && fieldValid.email === true && formData.email && (
                                <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {!checkingField && fieldValid.email === false && formData.email && (
                                <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {!checkingField && fieldValid.email === true && formData.email && (
                            <p className="text-green-600 text-xs mt-1 flex items-center space-x-1">
                                <CheckCircle size={12} />
                                <span>✓ Email is available</span>
                            </p>
                        )}
                        {!checkingField && fieldValid.email === false && formData.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email || 'Email already exists'}</p>
                        )}
                        {errors.email && fieldValid.email !== false && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Mobile with Real-time Validation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.mobile ? 'border-red-500 bg-red-50' :
                                    fieldValid.mobile === true ? 'border-green-500 bg-green-50' :
                                        fieldValid.mobile === false ? 'border-red-500 bg-red-50' :
                                            'border-gray-200'
                                    }`}
                                placeholder="017XX-XXXXXX"
                            />
                            {checkingField === 'mobile' && (
                                <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {!checkingField && fieldValid.mobile === true && formData.mobile && (
                                <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {!checkingField && fieldValid.mobile === false && formData.mobile && (
                                <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {!checkingField && fieldValid.mobile === true && formData.mobile && (
                            <p className="text-green-600 text-xs mt-1 flex items-center space-x-1">
                                <CheckCircle size={12} />
                                <span>✓ Mobile is available</span>
                            </p>
                        )}
                        {!checkingField && fieldValid.mobile === false && formData.mobile && (
                            <p className="text-red-500 text-xs mt-1">{errors.mobile || 'Mobile number already exists'}</p>
                        )}
                        {errors.mobile && fieldValid.mobile !== false && (
                            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                        )}
                    </div>

                    {/* NID with Real-time Validation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            NID Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="nidNo"
                                value={formData.nidNo}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.nidNo ? 'border-red-500 bg-red-50' :
                                    fieldValid.nidNo === true ? 'border-green-500 bg-green-50' :
                                        fieldValid.nidNo === false ? 'border-red-500 bg-red-50' :
                                            'border-gray-200'
                                    }`}
                                placeholder="12345678901234567"
                            />
                            {checkingField === 'nidNo' && (
                                <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {!checkingField && fieldValid.nidNo === true && formData.nidNo && (
                                <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {!checkingField && fieldValid.nidNo === false && formData.nidNo && (
                                <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {!checkingField && fieldValid.nidNo === true && formData.nidNo && (
                            <p className="text-green-600 text-xs mt-1 flex items-center space-x-1">
                                <CheckCircle size={12} />
                                <span>✓ NID is available</span>
                            </p>
                        )}
                        {!checkingField && fieldValid.nidNo === false && formData.nidNo && (
                            <p className="text-red-500 text-xs mt-1">{errors.nidNo || 'NID number already exists'}</p>
                        )}
                        {errors.nidNo && fieldValid.nidNo !== false && (
                            <p className="text-red-500 text-sm mt-1">{errors.nidNo}</p>
                        )}
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

                    {/* Feeder Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Feeder Name
                        </label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="feederName"
                                value={formData.feederName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all"
                            >
                                <option value="">Select Feeder</option>
                                {FEEDER_OPTIONS.map((feeder) => (
                                    <option key={feeder} value={feeder}>{feeder}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Meter Number with Real-time Validation */}
                    <div className="md:col-span-2">
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
                                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.meterNo ? 'border-red-500' :
                                    meterValidation?.exists && !meterValidation?.isAssigned ? 'border-green-500 bg-green-50' :
                                        meterValidation && (meterValidation?.isAssigned || !meterValidation?.exists) ? 'border-red-500 bg-red-50' :
                                            'border-gray-200'
                                    }`}
                                placeholder="Enter meter number (e.g., MTR-2026-001)"
                            />
                            {meterChecking && (
                                <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {!meterChecking && meterValidation?.exists && !meterValidation?.isAssigned && formData.meterNo && (
                                <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {!meterChecking && meterValidation && (meterValidation?.isAssigned || !meterValidation?.exists) && formData.meterNo && (
                                <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>

                        {/* Meter Validation Status Messages */}
                        {meterChecking && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-600 text-sm flex items-center space-x-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Checking meter availability...</span>
                                </p>
                            </div>
                        )}

                        {!meterChecking && meterValidation && meterValidation.exists && !meterValidation.isAssigned && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-green-700 text-sm font-medium">✓ Meter is available</p>
                                        <p className="text-green-600 text-xs mt-1">
                                            This meter can be assigned to the new consumer
                                        </p>
                                        {meterValidation.meterData?.consumerName && (
                                            <p className="text-green-600 text-xs mt-1">
                                                Previous consumer: {meterValidation.meterData.consumerName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!meterChecking && meterValidation && meterValidation.isAssigned && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <X size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-700 text-sm font-medium">✗ Meter is already assigned</p>
                                        <div className="mt-1 p-2 bg-red-100/50 rounded-lg">
                                            <p className="text-red-700 text-sm flex items-center space-x-2">
                                                <UserIcon size={14} />
                                                <span><strong>{meterValidation.assignedTo?.name}</strong></span>
                                            </p>
                                            <p className="text-red-600 text-xs mt-1">
                                                Email: {meterValidation.assignedTo?.email}
                                            </p>
                                            <p className="text-red-600 text-xs">
                                                ID: {meterValidation.assignedTo?.id}
                                            </p>
                                        </div>
                                        <p className="text-red-600 text-xs mt-2">
                                            This meter cannot be assigned to a new consumer
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!meterChecking && meterValidation && !meterValidation.exists && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <X size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-700 text-sm font-medium">✗ Meter not found</p>
                                        <p className="text-red-600 text-xs mt-1">
                                            This meter number does not exist in the system.
                                        </p>
                                        <p className="text-red-600 text-xs mt-1">
                                            Please add the meter first using "Add Meter" option.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors.meterNo && !meterChecking && !meterValidation?.isAssigned && meterValidation?.exists && (
                            <p className="text-red-500 text-xs mt-1">{errors.meterNo}</p>
                        )}

                        <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                            <Info size={12} />
                            <span>System will validate the meter number and check if it's already assigned</span>
                        </p>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Active Status
                        </label>
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Home size={18} className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            placeholder="House #12, Road #5, Dhaka"
                        />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* Submit Button */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {Object.values(fieldValid).some(v => v === false) && (
                            <span className="text-red-600 flex items-center space-x-1 text-sm font-medium">
                                <X size={16} />
                                <span>Please fix duplicate fields</span>
                            </span>
                        )}
                        {meterValidation?.exists && !meterValidation?.isAssigned && !meterChecking && (
                            <span className="text-emerald-600 flex items-center space-x-1 text-sm font-medium">
                                <CheckCircle size={16} />
                                <span>All fields validated. Ready to add!</span>
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
                            disabled={
                                isSubmitting ||
                                meterChecking ||
                                !meterValidation?.exists ||
                                meterValidation?.isAssigned ||
                                Object.values(fieldValid).some(v => v === false) ||
                                Object.values(fieldValid).some(v => v === null && formData.email && formData.mobile && formData.nidNo)
                            }
                            className={`px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium flex items-center space-x-2 transition-all shadow-sm hover:shadow-md ${isSubmitting ||
                                meterChecking ||
                                !meterValidation?.exists ||
                                meterValidation?.isAssigned ||
                                Object.values(fieldValid).some(v => v === false) ||
                                Object.values(fieldValid).some(v => v === null && formData.email && formData.mobile && formData.nidNo)
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
                                    <span>Add Consumer</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}