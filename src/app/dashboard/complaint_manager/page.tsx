// app/dashboard/complaint_manager/page.tsx
'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Clock, FileText, Users, ArrowUpRight } from 'lucide-react';

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

export default function ComplaintManagerDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Complaint Manager Dashboard</h1>
                <p className="text-gray-500 text-sm">Manage and resolve customer complaints</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Complaints"
                    value="47"
                    icon={<FileText size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                />
                <StatCard
                    title="Pending"
                    value="12"
                    icon={<Clock size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
                />
                <StatCard
                    title="Under Action"
                    value="8"
                    icon={<AlertCircle size={20} className="text-white" />}
                    bgColor="bg-orange-100"
                />
                <StatCard
                    title="Resolved"
                    value="27"
                    icon={<CheckCircle size={20} className="text-white" />}
                    bgColor="bg-green-100"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Complaints</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                                <p className="text-sm font-medium">Complaint #CMP-00{i}</p>
                                <p className="text-xs text-gray-500">Meter #MTR-00{i} • Voltage fluctuation</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${i % 3 === 0 ? 'bg-red-100 text-red-700' :
                                    i % 3 === 1 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {i % 3 === 0 ? 'Pending' : i % 3 === 1 ? 'Under Action' : 'Resolved'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}