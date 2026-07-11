// app/dashboard/billing_wings/page.tsx
'use client';

import React from 'react';
import { FileText, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, PlusCircle, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
}

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

export default function BillingWingsDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Billing Dashboard</h1>
                <p className="text-gray-500 text-sm">Manage bills and collections</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Bills"
                    value="1,247"
                    icon={<FileText size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                />
                <StatCard
                    title="Total Collection"
                    value="₹45,230"
                    icon={<DollarSign size={20} className="text-white" />}
                    bgColor="bg-green-100"
                />
                <StatCard
                    title="Pending Bills"
                    value="127"
                    icon={<Clock size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
                />
                <StatCard
                    title="Collection Rate"
                    value="94.8%"
                    icon={<TrendingUp size={20} className="text-white" />}
                    bgColor="bg-purple-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Recent Bills</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                                <div>
                                    <p className="text-sm font-medium">Bill #B-2026-00{i}</p>
                                    <p className="text-xs text-gray-500">Meter #MTR-00{i} • ₹{1.2 + i * 0.5}K</p>
                                </div>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Paid</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <FileText size={18} className="text-emerald-600" />
                            <span>Generate Monthly Bills</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <DollarSign size={18} className="text-emerald-600" />
                            <span>View Collections</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <PlusCircle size={18} className="text-emerald-600" />
                            <span>Add Bill</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}