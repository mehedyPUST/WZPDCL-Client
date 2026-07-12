// app/dashboard/admin/settings/page.tsx
'use client';

import React, { useState } from 'react';
import {
    Settings,
    Save,
    RefreshCw,
    Shield,
    Bell,
    Mail,
    Database,
    Globe,
    Users,
    Zap,
    MapPin,
    DollarSign,
    Clock,
    Lock,
    Key,
    Server,
    UserCog,
    Palette,
    Moon,
    Sun,
    Monitor,
    AlertTriangle,
    CheckCircle,
    Smartphone,
    Laptop,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';

interface SettingSection {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface GeneralSetting {
    id: string;
    label: string;
    value: string | boolean | number;
    type: 'text' | 'number' | 'select' | 'toggle' | 'email' | 'url';
    options?: { value: string; label: string }[];
    description?: string;
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        companyName: 'West Zone Power Distribution Company Ltd',
        companyEmail: 'info@wzpdc.gov.bd',
        companyPhone: '+880 1712-345678',
        companyAddress: 'Boyra Main Road, Khulna',
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        currency: 'BDT',
        language: 'bn',
    });

    // Billing Settings
    const [billingSettings, setBillingSettings] = useState({
        billGenerationDay: '5',
        dueDateDay: '15',
        lateFeePercent: '5',
        vatRate: '15',
        minimumBill: '100',
        unitRateResidential: '7.50',
        unitRateCommercial: '9.75',
        unitRateIndustrial: '11.25',
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: true,
        billReminders: true,
        complaintUpdates: true,
        paymentConfirmations: true,
        systemAlerts: true,
        marketingEmails: false,
    });

    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: '60',
        maxLoginAttempts: '5',
        requireStrongPassword: true,
        ipWhitelist: false,
        sslEnabled: true,
    });

    // Appearance Settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        primaryColor: '#059669',
        sidebarCollapsed: false,
        compactMode: false,
        fontSize: 'medium',
    });

    const sections: SettingSection[] = [
        {
            id: 'general',
            title: 'General',
            description: 'Company and system settings',
            icon: <Settings size={20} />,
        },
        {
            id: 'billing',
            title: 'Billing & Rates',
            description: 'Bill generation and tariff settings',
            icon: <DollarSign size={20} />,
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Email and SMS preferences',
            icon: <Bell size={20} />,
        },
        {
            id: 'security',
            title: 'Security',
            description: 'Authentication and security settings',
            icon: <Shield size={20} />,
        },
        {
            id: 'appearance',
            title: 'Appearance',
            description: 'Theme and display settings',
            icon: <Palette size={20} />,
        },
    ];

    const handleGeneralChange = (key: string, value: string) => {
        setGeneralSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleBillingChange = (key: string, value: string) => {
        setBillingSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleNotificationToggle = (key: string, value: boolean) => {
        setNotificationSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSecurityChange = (key: string, value: string | boolean) => {
        setSecuritySettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAppearanceChange = (key: string, value: string | boolean) => {
        setAppearanceSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Name
                    </label>
                    <input
                        type="text"
                        value={generalSettings.companyName}
                        onChange={(e) => handleGeneralChange('companyName', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Email
                    </label>
                    <input
                        type="email"
                        value={generalSettings.companyEmail}
                        onChange={(e) => handleGeneralChange('companyEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Phone
                    </label>
                    <input
                        type="text"
                        value={generalSettings.companyPhone}
                        onChange={(e) => handleGeneralChange('companyPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Address
                    </label>
                    <input
                        type="text"
                        value={generalSettings.companyAddress}
                        onChange={(e) => handleGeneralChange('companyAddress', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Timezone
                    </label>
                    <select
                        value={generalSettings.timezone}
                        onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                        <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Currency
                    </label>
                    <select
                        value={generalSettings.currency}
                        onChange={(e) => handleGeneralChange('currency', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                        <option value="BDT">BDT (Bangladeshi Taka)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="INR">INR (Indian Rupee)</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderBillingSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Bill Generation Day
                    </label>
                    <input
                        type="number"
                        value={billingSettings.billGenerationDay}
                        onChange={(e) => handleBillingChange('billGenerationDay', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Day of month to generate bills (1-28)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Due Date Day
                    </label>
                    <input
                        type="number"
                        value={billingSettings.dueDateDay}
                        onChange={(e) => handleBillingChange('dueDateDay', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Day of month when bills are due</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Late Fee (%)
                    </label>
                    <input
                        type="number"
                        step="0.5"
                        value={billingSettings.lateFeePercent}
                        onChange={(e) => handleBillingChange('lateFeePercent', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        VAT Rate (%)
                    </label>
                    <input
                        type="number"
                        step="0.5"
                        value={billingSettings.vatRate}
                        onChange={(e) => handleBillingChange('vatRate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Minimum Bill Amount (BDT)
                    </label>
                    <input
                        type="number"
                        value={billingSettings.minimumBill}
                        onChange={(e) => handleBillingChange('minimumBill', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Unit Rates (per kWh)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Residential (BDT)
                        </label>
                        <input
                            type="number"
                            step="0.25"
                            value={billingSettings.unitRateResidential}
                            onChange={(e) => handleBillingChange('unitRateResidential', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Commercial (BDT)
                        </label>
                        <input
                            type="number"
                            step="0.25"
                            value={billingSettings.unitRateCommercial}
                            onChange={(e) => handleBillingChange('unitRateCommercial', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Industrial (BDT)
                        </label>
                        <input
                            type="number"
                            step="0.25"
                            value={billingSettings.unitRateIndustrial}
                            onChange={(e) => handleBillingChange('unitRateIndustrial', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => {
        const notifications = [
            { key: 'emailNotifications', label: 'Email Notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications' },
            { key: 'billReminders', label: 'Bill Reminders' },
            { key: 'complaintUpdates', label: 'Complaint Updates' },
            { key: 'paymentConfirmations', label: 'Payment Confirmations' },
            { key: 'systemAlerts', label: 'System Alerts' },
            { key: 'marketingEmails', label: 'Marketing Emails' },
        ];

        return (
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div key={notif.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-800">{notif.label}</p>
                            <p className="text-xs text-gray-400">
                                Receive {notif.label.toLowerCase()} updates
                            </p>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle(notif.key, !notificationSettings[notif.key as keyof typeof notificationSettings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings[notif.key as keyof typeof notificationSettings]
                                ? 'bg-emerald-600'
                                : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings[notif.key as keyof typeof notificationSettings]
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Session Timeout (minutes)
                    </label>
                    <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Max Login Attempts
                    </label>
                    <input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => handleSecurityChange('maxLoginAttempts', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-400">Require 2FA for all admin accounts</p>
                    </div>
                    <button
                        onClick={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.twoFactorAuth ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Require Strong Password</p>
                        <p className="text-xs text-gray-400">Password must be at least 8 characters with special chars</p>
                    </div>
                    <button
                        onClick={() => handleSecurityChange('requireStrongPassword', !securitySettings.requireStrongPassword)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.requireStrongPassword ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.requireStrongPassword ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-800">SSL Enabled</p>
                        <p className="text-xs text-gray-400">Force HTTPS connections</p>
                    </div>
                    <button
                        onClick={() => handleSecurityChange('sslEnabled', !securitySettings.sslEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.sslEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.sslEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                    Changing security settings may affect user sessions. Please ensure all users are informed.
                </p>
            </div>
        </div>
    );

    const renderAppearanceSettings = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                    ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                            <button
                                key={theme.value}
                                onClick={() => handleAppearanceChange('theme', theme.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${appearanceSettings.theme === theme.value
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={24} className={`mx-auto ${appearanceSettings.theme === theme.value ? 'text-emerald-600' : 'text-gray-500'
                                    }`} />
                                <p className="text-sm font-medium text-gray-700 mt-2">{theme.label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex flex-wrap gap-3">
                    {['#059669', '#2563EB', '#7C3AED', '#DC2626', '#F59E0B', '#8B5CF6'].map((color) => (
                        <button
                            key={color}
                            onClick={() => handleAppearanceChange('primaryColor', color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${appearanceSettings.primaryColor === color
                                ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-800'
                                : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Compact Mode</p>
                        <p className="text-xs text-gray-400">Reduce spacing and padding</p>
                    </div>
                    <button
                        onClick={() => handleAppearanceChange('compactMode', !appearanceSettings.compactMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appearanceSettings.compactMode ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearanceSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Sidebar Collapsed by Default</p>
                        <p className="text-xs text-gray-400">Minimize sidebar on login</p>
                    </div>
                    <button
                        onClick={() => handleAppearanceChange('sidebarCollapsed', !appearanceSettings.sidebarCollapsed)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appearanceSettings.sidebarCollapsed ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearanceSettings.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'small', label: 'Small' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'large', label: 'Large' },
                        ].map((size) => (
                            <button
                                key={size.value}
                                onClick={() => handleAppearanceChange('fontSize', size.value)}
                                className={`p-3 rounded-lg border-2 transition-all ${appearanceSettings.fontSize === size.value
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className={`${size.value === 'small' ? 'text-sm' : size.value === 'large' ? 'text-lg' : 'text-base'
                                    } font-medium text-gray-700`}>
                                    Aa
                                </span>
                                <p className="text-xs text-gray-500 mt-1">{size.label}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'billing':
                return renderBillingSettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'security':
                return renderSecuritySettings();
            case 'appearance':
                return renderAppearanceSettings();
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Settings size={24} className="text-emerald-600" />
                        <span>Settings</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage system configuration and preferences</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            // Reset all settings to default
                            window.location.reload();
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-4 py-2 text-white text-sm rounded-lg transition-colors flex items-center space-x-2 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Save Success Message */}
            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-sm text-green-700">Settings saved successfully!</p>
                </div>
            )}

            {/* Settings Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-gray-100">
                    {sections.map((section) => {
                        const Icon = section.icon.type;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === section.id
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {section.icon}
                                <span>{section.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Settings Content */}
                <div className="p-6">
                    <div className="mb-6 pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {sections.find(s => s.id === activeTab)?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {sections.find(s => s.id === activeTab)?.description}
                        </p>
                    </div>
                    {renderContent()}
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">System Status</p>
                            <p className="text-xs text-green-600">All systems operational</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Database size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Database</p>
                            <p className="text-xs text-blue-600">Connected & Synced</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock size={18} className="text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Last Backup</p>
                            <p className="text-xs text-gray-500">Today, 2:30 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}