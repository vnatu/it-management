"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    ArrowRight,
    X,
    Search,
    Filter,
    MoreVertical,
    Layers,
    ChevronUp,
    ChevronDown
} from "lucide-react";

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    status: string;
    price: number;
    location: string;
    purchaseDate: string;
    warrantyEnd: string;
    type: {
        name: string;
    };
    assignedTo?: {
        fullName: string;
    };
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Mobile Assets');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['Mobile Assets', 'Fixed Assets', 'Licenses', 'Cloud Accounts'];

    useEffect(() => {
        fetch("http://localhost:8080/api/assets")
            .then((res) => res.json())
            .then((data) => {
                setAssets(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching assets:", err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'ALLOCATED': return 'text-orange-500';
            case 'AVAILABLE':
            case 'AVAILABLE FOR ALLOCATION': return 'text-green-500';
            case 'DECOMMISSIONED':
            case 'DEFECTIVE': return 'text-red-500';
            case 'IN-ACTIVE': return 'text-gray-400';
            default: return 'text-gray-600';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price).replace('₹', 'Rs. ');
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-baseline gap-4 mb-2">
                        <h1 className="text-4xl font-extrabold text-gray-900">Inventory</h1>
                        <Link href="/helpdesk">
                            <span className="text-sm font-bold text-orange-500 underline decoration-2 underline-offset-4 cursor-pointer">
                                IT Helpdesk
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex gap-3">
                    <button className="flex flex-col items-center justify-center bg-white border-b-4 border-green-500 px-6 py-2 rounded-t-lg group">
                        <Layers size={20} className="text-green-600 mb-1" />
                        <span className="text-[11px] font-bold text-green-700 uppercase tracking-tighter">Inventory</span>
                    </button>

                    <Link href="/assets/new">
                        <button className="flex flex-col items-center justify-center bg-[#F26522] hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all shadow-lg hover:shadow-orange-200">
                            <Plus size={20} className="mb-1" />
                            <span className="text-[11px] font-bold uppercase tracking-tighter">Add Asset</span>
                        </button>
                    </Link>

                    <button className="flex flex-col items-center justify-center bg-[#FF7F7F] hover:bg-red-400 text-white px-6 py-2 rounded-lg transition-all shadow-lg hover:shadow-red-100">
                        <ArrowRight size={20} className="mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">Allocate Asset</span>
                    </button>

                    <button className="flex flex-col items-center justify-center bg-[#D64545] hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg hover:shadow-red-200">
                        <X size={20} className="mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">Deallocate Asset</span>
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-4 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                                ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px]">
                {/* Search and Table Header */}
                <div className="p-8 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-extrabold text-gray-900">{activeTab}</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 w-64 transition-all"
                            />
                        </div>
                        <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                            <Filter size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="border-y border-gray-50">
                                {[
                                    'Asset Type', 'Brand', 'Asset ID', 'Price', 'Description',
                                    'Status', 'Allocated To', 'Allocation Date', 'Service Ticket',
                                    'Last Update', 'Warranty End', 'Location'
                                ].map((head) => (
                                    <th key={head} className="px-6 py-4">
                                        <div className="flex items-center gap-1 cursor-pointer group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">
                                                {head}
                                            </span>
                                            <div className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp size={10} className="text-gray-400" />
                                                <ChevronDown size={10} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(13).fill(0).map((_, j) => (
                                            <td key={j} className="px-6 py-6 font-medium">
                                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <Layers size={48} className="text-gray-200 mb-4" />
                                            <p className="text-gray-500 font-bold">No assets found in {activeTab}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-900">{asset.type.name}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.brand}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-900">{asset.assetCustomId}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{formatPrice(asset.price)}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500 max-w-xs truncate">{asset.modelNo} - {asset.serialNo}</td>
                                        <td className={`px-6 py-5 text-[12px] font-black underline decoration-2 underline-offset-4 ${getStatusColor(asset.status)}`}>
                                            {asset.status}
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.assignedTo?.fullName || 'NA'}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.assignedTo ? '10 Oct 2022' : 'NA'}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">SER#12345678</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">10 Oct 2022</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.warrantyEnd || 'NA'}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.location || 'NA'}</td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                <MoreVertical size={18} className="text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
