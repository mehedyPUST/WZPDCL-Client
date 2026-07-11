// app/dashboard/xen/page.tsx
'use client';

import React from 'react';
import { FileText, AlertCircle, CheckCircle, Clock, ArrowUpRight, Users, Zap } from 'lucide-react';

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

export default function XenDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">XEN Dashboard</h1>
                <p className="text-gray-500 text-sm">Review and manage new connection applications</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Applications"
                    value="45"
                    icon={<FileText size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                />
                <StatCard
                    title="Pending Review"
                    value="12"
                    icon={<Clock size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
                />
                <StatCard
                    title="Approved"
                    value="28"
                    icon={<CheckCircle size={20} className="text-white" />}
                    bgColor="bg-green-100"
                />
                <StatCard
                    title="Rejected"
                    value="5"
                    icon={<AlertCircle size={20} className="text-white" />}
                    bgColor="bg-red-100"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Applications</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Zap size={18} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Application #C-2026-00{i}</p>
                                    <p className="text-xs text-gray-500">Meter #MTR-00{i} • John Doe</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${i % 2 === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {i % 2 === 0 ? 'Pending Review' : 'Approved'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}