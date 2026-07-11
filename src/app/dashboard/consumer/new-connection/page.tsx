// app/dashboard/consumer/new-connection/page.tsx
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

interface FormErrors {
    [key: string]: string;
}

const FEEDER_OPTIONS = ['Trimohoni', 'Circuit-Hose', 'DC-Court', 'N.S-Road'];
const TRANSFORMER_OPTIONS = ['TR-01', 'TR-02', 'TR-03', 'TR-04', 'TR-05', 'TR-06', 'TR-07', 'TR-08', 'TR-09', 'TR-10'];

export default function ConsumerNewConnectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');
    const [user, setUser] = useState<any>(null);

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

    const [errors, setErrors] = useState<FormErrors>({});
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await authClient.getSession();
                setUser(data?.user || null);
                if (data?.user) {
                    setFormData(prev => ({
                        ...prev,
                        applicantName: data.user.name || '',
                        email: data.user.email || '',
                        mobile: data.user.mobile || '',
                        nidNo: data.user.nidNo || '',
                    }));
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        getUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
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
            const response = await fetch(`${API_URL}/api/connection-applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
                body: JSON.stringify({
                    ...formData,
                    consumerId: user?.id || 'unknown',
                    loadRequired: Number(formData.loadRequired),
                    status: 'pending_payment',
                    paymentStatus: 'pending',
                    feeAmount: formData.connectionType === 'residential' ? 5000 : formData.connectionType === 'commercial' ? 10000 : 15000,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit application');
            setApplicationId(data.data?.applicationId || '');
            setSubmitSuccess(true);
        } catch (error: any) {
            console.error('Submission error:', error);
            setErrors(prev => ({ ...prev, submit: error.message || 'Failed to submit application' }));
        } finally { setIsSubmitting(false); }
    };

    if (submitSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
                    <p className="text-gray-500 mb-4">Your new connection application has been submitted.</p>
                    {applicationId && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">Application ID</p>
                            <p className="text-xl font-bold text-emerald-700">{applicationId}</p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => router.push('/dashboard/consumer/my-connections')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">View Applications</button>
                        <button onClick={() => { setSubmitSuccess(false); router.push('/dashboard/consumer'); }} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">Go to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2"><Zap size={24} className="text-emerald-600" /><span>New Connection Application</span></h1><p className="text-gray-500 text-sm">Apply for a new electricity connection</p></div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg"><Clock size={16} /><span>Processing: 5-7 days</span></div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
                <div className="flex items-start justify-between">
                    <div><h3 className="text-lg font-semibold">Before You Apply</h3>
                        <ul className="mt-2 space-y-1 text-sm text-emerald-100">
                            <li>• Have your NID, proof of address, and land documents ready</li>
                            <li>• Connection fee: Residential ৳5,000 | Commercial ৳10,000 | Industrial ৳15,000</li>
                            <li>• Applications processed within 5-7 business days</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/30 p-3 rounded-lg hidden sm:block"><ClipboardList size={40} className="text-white" /></div>
                </div>
            </div>

            {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle size={20} className="text-red-600" /><p className="text-sm text-red-700">{errors.submit}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                {/* Personal Information */}
                <div><h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2"><User size={20} className="text-emerald-600" /><span>Personal Information</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Applicant Name <span className="text-red-500">*</span></label><div className="relative"><User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.applicantName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Full name" /></div>{errors.applicantName && <p className="text-red-500 text-xs mt-1">{errors.applicantName}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} placeholder="you@example.com" /></div>{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.mobile ? 'border-red-500' : 'border-gray-200'}`} placeholder="017XX-XXXXXX" /></div>{errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">NID Number <span className="text-red-500">*</span></label><div className="relative"><CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="nidNo" value={formData.nidNo} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.nidNo ? 'border-red-500' : 'border-gray-200'}`} placeholder="12345678901234567" /></div>{errors.nidNo && <p className="text-red-500 text-xs mt-1">{errors.nidNo}</p>}</div>
                    </div>
                </div>

                {/* Connection Details */}
                <div className="border-t border-gray-100 pt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2"><Zap size={20} className="text-emerald-600" /><span>Connection Details</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Connection Type <span className="text-red-500">*</span></label><div className="relative"><Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select name="connectionType" value={formData.connectionType} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${errors.connectionType ? 'border-red-500' : 'border-gray-200'}`}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option></select></div>{errors.connectionType && <p className="text-red-500 text-xs mt-1">{errors.connectionType}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Load Required (kW) <span className="text-red-500">*</span></label><div className="relative"><Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="number" name="loadRequired" value={formData.loadRequired} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.loadRequired ? 'border-red-500' : 'border-gray-200'}`} placeholder="e.g., 5" step="0.5" min="1" /></div>{errors.loadRequired && <p className="text-red-500 text-xs mt-1">{errors.loadRequired}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Voltage Level</label><div className="relative"><Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select name="voltageLevel" value={formData.voltageLevel} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"><option value="220">220V (Single Phase)</option><option value="380">380V (Three Phase)</option><option value="11000">11kV (High Tension)</option></select></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose <span className="text-red-500">*</span></label><div className="relative"><FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.purpose ? 'border-red-500' : 'border-gray-200'}`} placeholder="e.g., New house, Shop, Factory" /></div>{errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}</div>
                    </div>
                </div>

                {/* Location Details */}
                <div className="border-t border-gray-100 pt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2"><MapPin size={20} className="text-emerald-600" /><span>Location Details</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Address <span className="text-red-500">*</span></label><div className="relative"><Home size={18} className="absolute left-3 top-3 text-gray-400" /><textarea name="address" value={formData.address} onChange={handleChange} rows={2} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.address ? 'border-red-500' : 'border-gray-200'}`} placeholder="Complete address" /></div>{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Feeder Name <span className="text-red-500">*</span></label><div className="relative"><Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select name="feederName" value={formData.feederName} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${errors.feederName ? 'border-red-500' : 'border-gray-200'}`}><option value="">Select Feeder</option>{FEEDER_OPTIONS.map((feeder) => (<option key={feeder} value={feeder}>{feeder}</option>))}</select></div>{errors.feederName && <p className="text-red-500 text-xs mt-1">{errors.feederName}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Transformer Number <span className="text-gray-400 text-xs">(Optional)</span></label><div className="relative"><Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select name="transformerNo" value={formData.transformerNo} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"><option value="">Select Transformer</option>{TRANSFORMER_OPTIONS.map((tr) => (<option key={tr} value={tr}>{tr}</option>))}</select></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pole Number <span className="text-gray-400 text-xs">(Optional)</span></label><div className="relative"><Home size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="poleNumber" value={formData.poleNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., P-123" /></div></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Nearest Landmark</label><div className="relative"><MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="nearestLandmark" value={formData.nearestLandmark} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Near the local mosque" /></div></div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="border-t border-gray-100 pt-6"><h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2"><FileText size={20} className="text-emerald-600" /><span>Additional Information</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">TIN Number</label><div className="relative"><CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="tinNumber" value={formData.tinNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="TIN number (if any)" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Trade License</label><div className="relative"><FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="tradeLicense" value={formData.tradeLicense} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="For commercial connections" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Plot Number</label><div className="relative"><MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="plotNumber" value={formData.plotNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Plot number" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Holding Number</label><div className="relative"><Home size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" name="holdingNumber" value={formData.holdingNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Holding number" /></div></div>
                    </div>
                    <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks (Optional)</label><textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Any additional information" /></div>
                </div>

                {/* Fee Summary */}
                <div className="border-t border-gray-100 pt-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Fee Summary</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-2 border-b border-gray-200"><span className="text-sm text-gray-600">Connection Fee</span><span className="text-sm font-medium">{formData.connectionType === 'residential' ? '৳5,000' : formData.connectionType === 'commercial' ? '৳10,000' : '৳15,000'}</span></div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-200"><span className="text-sm text-gray-600">Security Deposit</span><span className="text-sm font-medium">{formData.connectionType === 'residential' ? '৳2,000' : formData.connectionType === 'commercial' ? '৳5,000' : '৳10,000'}</span></div>
                            <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold text-gray-800">Total</span><span className="text-lg font-bold text-emerald-700">{formData.connectionType === 'residential' ? '৳7,000' : formData.connectionType === 'commercial' ? '৳15,000' : '৳25,000'}</span></div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex items-center justify-end">
                    <button type="submit" disabled={isSubmitting} className={`px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium flex items-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'}`}>
                        {isSubmitting ? <><Loader2 size={20} className="animate-spin" /><span>Submitting...</span></> : <><span>Submit Application</span><ArrowRight size={20} /></>}
                    </button>
                </div>
            </form>
        </div>
    );
}