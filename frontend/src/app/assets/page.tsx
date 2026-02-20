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
    ChevronDown,
    MapPin,
    Tag as TagIcon
} from "lucide-react";
import TagPicker from "@/components/TagPicker";

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

interface Location {
    id: number;
    name: string;
    code: string;
}

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    status: string;
    price: number;
    location: Location | null;
    purchaseDate: string;
    warrantyEnd: string;
    type: {
        name: string;
    };
    assignedTo?: {
        fullName: string;
    };
    tags: Tag[];
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsRes, tagsRes] = await Promise.all([
                    fetch("http://localhost:8080/api/assets"),
                    fetch("http://localhost:8080/api/tags")
                ]);
                if (assetsRes.ok) setAssets(await assetsRes.json());
                if (tagsRes.ok) setAllTags(await tagsRes.json());
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const groupTags = allTags.filter(t => t.isGroupTag);
    const tabs = ['All', ...groupTags.map(t => t.name)];

    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.assetCustomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.modelNo?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'All' ||
            asset.tags.some(t => t.name === activeTab);

        const matchesTags = selectedTagIds.length === 0 ||
            selectedTagIds.every(id => asset.tags.some(t => t.id === id));

        return matchesSearch && matchesTab && matchesTags;
    });

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE': return 'text-green-500 bg-green-50 border-green-100';
            case 'ALLOCATED': return 'text-blue-500 bg-blue-50 border-blue-100';
            case 'UNDER_REPAIR': return 'text-orange-500 bg-orange-50 border-orange-100';
            case 'DEFECTIVE': return 'text-red-500 bg-red-50 border-red-100';
            case 'TRANSIT': return 'text-purple-500 bg-purple-50 border-purple-100';
            case 'DECOMMISSIONED': return 'text-gray-500 bg-gray-50 border-gray-100';
            default: return 'text-gray-500 bg-gray-50 border-gray-100';
        }
    };

    const formatPrice = (price: number) => {
        if (!price) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price).replace('₹', 'Rs. ');
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Inventory</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Global Assets</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                        <Link href="/helpdesk">
                            <span className="text-orange-500 font-bold uppercase text-[10px] tracking-widest hover:underline decoration-2 underline-offset-4 cursor-pointer">
                                IT Helpdesk
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link href="/assets/new">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <Plus size={18} strokeWidth={3} />
                            Add Asset
                        </button>
                    </Link>
                </div>
            </div>

            {/* Dynamic Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-[1.5rem] w-fit border border-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                            ? 'bg-white text-gray-900 shadow-lg'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px]">
                {/* Search and Table Header */}
                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{activeTab} Inventory</h2>
                            <p className="text-gray-400 font-medium text-sm">Showing {filteredAssets.length} assets</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Brand, Model..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 w-full md:w-80 transition-all outline-none"
                                />
                            </div>

                            <div className="w-full md:w-64">
                                <TagPicker
                                    allTags={allTags.filter(t => !t.isGroupTag)}
                                    selectedTagIds={selectedTagIds}
                                    onToggle={(id) => setSelectedTagIds(prev =>
                                        prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
                                    )}
                                    label=""
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="border-y border-gray-50 bg-gray-50/30">
                                {[
                                    'Asset ID', 'Type', 'Brand / Model', 'Price',
                                    'Status', 'Tags', 'Location', 'Assigned To'
                                ].map((head) => (
                                    <th key={head} className="px-8 py-5">
                                        <div className="flex items-center gap-1 cursor-pointer group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {head}
                                            </span>
                                            <div className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp size={10} className="text-gray-300" />
                                                <ChevronDown size={10} className="text-gray-300" />
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(8).fill(0).map((_, j) => (
                                            <td key={j} className="px-8 py-6 font-medium">
                                                <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 text-gray-200">
                                                <Layers size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-400 italic uppercase">Empty Space</h3>
                                            <p className="text-gray-400 font-medium">No assets match your current filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-gray-900 tracking-tight">{asset.assetCustomId}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                <span className="text-[13px] font-bold text-gray-600">{asset.type.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-gray-900">{asset.brand}</span>
                                                <span className="text-[11px] font-bold text-gray-400">{asset.modelNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[13px] font-black text-orange-500">{formatPrice(asset.price)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(asset.status)}`}>
                                                <div className={`w-1 h-1 rounded-full ${getStatusColor(asset.status).split(' ')[0].replace('text-', 'bg-')}`}></div>
                                                {asset.status.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {asset.tags.filter(t => !t.isGroupTag).map(tag => (
                                                    <span
                                                        key={tag.id}
                                                        style={{ color: tag.color }}
                                                        className="text-[10px] font-black uppercase tracking-tighter"
                                                    >
                                                        #{tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-500 font-bold">
                                                <MapPin size={14} className="text-gray-300" />
                                                <span className="text-[13px]">{asset.location?.code || asset.location?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">
                                                    {asset.assignedTo?.fullName?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-700">{asset.assignedTo?.fullName || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all opacity-0 group-hover:opacity-100">
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
