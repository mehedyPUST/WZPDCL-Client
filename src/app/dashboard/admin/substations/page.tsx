// app/dashboard/admin/substations/page.tsx
'use client';

import React, { useState } from 'react';
import {
    MapPin,
    Search,
    Plus,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Power,
    Zap,
    Phone,
    Mail,
    Map,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    RefreshCw,
    Activity,
    BarChart3,
    Users,
    Gauge,
    HardDrive,
    Calendar,
    X,
} from 'lucide-react';

interface Substation {
    id: string;
    name: string;
    location: string;
    capacity: string;
    voltage: string;
    contactNumber: string;
    address: string;
    status: 'active' | 'inactive' | 'maintenance';
    type: 'grid' | 'distribution' | 'transformer';
    installedCapacity: number;
    peakLoad: number;
    numberOfFeeders: number;
    lastMaintenance: string;
    createdAt: string;
    imageUrl?: string;
}

export default function AdminSubstationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    // Mock substations data
    const substations: Substation[] = [
        {
            id: '1',
            name: 'Trimohoni Grid Substation',
            location: 'Trimohoni, Kushtia',
            capacity: '50 MVA',
            voltage: '132/33 kV',
            contactNumber: '+880 1712-345678',
            address: 'Trimohoni Road, Kushtia Sadar, Kushtia',
            status: 'active',
            type: 'grid',
            installedCapacity: 50,
            peakLoad: 42,
            numberOfFeeders: 6,
            lastMaintenance: '2026-06-15',
            createdAt: '2020-03-10',
        },
        {
            id: '2',
            name: 'Circuit-Hose Distribution Substation',
            location: 'Circuit-Hose, Kushtia',
            capacity: '25 MVA',
            voltage: '33/11 kV',
            contactNumber: '+880 1712-345679',
            address: 'Circuit-Hose Area, Kushtia',
            status: 'active',
            type: 'distribution',
            installedCapacity: 25,
            peakLoad: 20,
            numberOfFeeders: 4,
            lastMaintenance: '2026-06-20',
            createdAt: '2021-06-15',
        },
        {
            id: '3',
            name: 'DC-Court Transformer Station',
            location: 'DC-Court, Kushtia',
            capacity: '10 MVA',
            voltage: '11/0.4 kV',
            contactNumber: '+880 1712-345680',
            address: 'DC-Court Road, Kushtia',
            status: 'maintenance',
            type: 'transformer',
            installedCapacity: 10,
            peakLoad: 8,
            numberOfFeeders: 3,
            lastMaintenance: '2026-07-01',
            createdAt: '2022-01-20',
        },
        {
            id: '4',
            name: 'N.S-Road Distribution Substation',
            location: 'N.S-Road, Kushtia',
            capacity: '20 MVA',
            voltage: '33/11 kV',
            contactNumber: '+880 1712-345681',
            address: 'N.S-Road, Kushtia',
            status: 'active',
            type: 'distribution',
            installedCapacity: 20,
            peakLoad: 16,
            numberOfFeeders: 5,
            lastMaintenance: '2026-06-10',
            createdAt: '2021-09-05',
        },
        {
            id: '5',
            name: 'Kushtia Grid Substation',
            location: 'Kushtia Sadar, Kushtia',
            capacity: '75 MVA',
            voltage: '132/33 kV',
            contactNumber: '+880 1712-345682',
            address: 'Kushtia Sadar, Kushtia',
            status: 'active',
            type: 'grid',
            installedCapacity: 75,
            peakLoad: 60,
            numberOfFeeders: 8,
            lastMaintenance: '2026-05-28',
            createdAt: '2019-11-15',
        },
        {
            id: '6',
            name: 'Daulatpur Substation',
            location: 'Daulatpur, Kushtia',
            capacity: '15 MVA',
            voltage: '33/11 kV',
            contactNumber: '+880 1712-345683',
            address: 'Daulatpur, Kushtia',
            status: 'inactive',
            type: 'distribution',
            installedCapacity: 15,
            peakLoad: 10,
            numberOfFeeders: 3,
            lastMaintenance: '2026-04-15',
            createdAt: '2022-08-10',
        },
    ];

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            active: { color: 'bg-green-100 text-green-700', label: 'Active', icon: CheckCircle },
            inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive', icon: AlertCircle },
            maintenance: { color: 'bg-yellow-100 text-yellow-700', label: 'Maintenance', icon: Clock },
        };
        return statuses[status] || statuses.inactive;
    };

    const getTypeBadge = (type: string) => {
        const types: Record<string, { color: string; label: string }> = {
            grid: { color: 'bg-purple-100 text-purple-700', label: 'Grid' },
            distribution: { color: 'bg-blue-100 text-blue-700', label: 'Distribution' },
            transformer: { color: 'bg-orange-100 text-orange-700', label: 'Transformer' },
        };
        return types[type] || types.distribution;
    };

    const filteredSubstations = substations.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
        const matchesType = filterType === 'all' || sub.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredSubstations.length / 6);
    const paginatedSubstations = filteredSubstations.slice((currentPage - 1) * 6, currentPage * 6);

    const handleDelete = (id: string) => {
        setShowDeleteModal(id);
    };

    const confirmDelete = () => {
        setShowDeleteModal(null);
    };

    // Stats
    const stats = [
        { label: 'Total Substations', value: substations.length, icon: MapPin, color: 'bg-blue-100 text-blue-600' },
        { label: 'Active', value: substations.filter(s => s.status === 'active').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        { label: 'Maintenance', value: substations.filter(s => s.status === 'maintenance').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Total Capacity', value: `${substations.reduce((sum, s) => sum + s.installedCapacity, 0)} MVA`, icon: Gauge, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <MapPin size={24} className="text-emerald-600" />
                        <span>Substations</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage all substations in the distribution network</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Add Substation</span>
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
                            placeholder="Search by name, location, or address..."
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
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="grid">Grid</option>
                            <option value="distribution">Distribution</option>
                            <option value="transformer">Transformer</option>
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

            {/* View Toggle */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing {paginatedSubstations.length} of {filteredSubstations.length} substations
                </p>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                            }`}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                            }`}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* Substations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedSubstations.map((sub) => {
                    const StatusBadge = getStatusBadge(sub.status);
                    const TypeBadge = getTypeBadge(sub.type);
                    const StatusIcon = StatusBadge.icon;

                    return (
                        <div
                            key={sub.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={24} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                                                {sub.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{sub.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                            <Eye size={16} className="text-gray-500" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                            <Edit size={16} className="text-blue-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2">
                                        <Gauge size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">{sub.capacity}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Zap size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">{sub.voltage}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">{sub.numberOfFeeders} Feeders</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Activity size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">{sub.peakLoad} MW</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Phone size={14} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">{sub.contactNumber}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${StatusBadge.color}`}>
                                        <StatusIcon size={12} />
                                        <span>{StatusBadge.label}</span>
                                    </span>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${TypeBadge.color}`}>
                                        {TypeBadge.label}
                                    </span>
                                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                        Last Maintenance: {sub.lastMaintenance}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-400">Created: {sub.createdAt}</span>
                                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1">
                                    <span>View Details</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * 6) + 1} to {Math.min(currentPage * 6, filteredSubstations.length)} of {filteredSubstations.length} substations
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

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center space-x-3 text-red-600 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-semibold">Delete Substation</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this substation? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}