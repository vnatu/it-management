import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    ArrowRightCircle
} from "lucide-react";
import AllocationModal from "@/components/assets/AllocationModal";

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    status: string;
    price: number;
    location: {
        id: number;
        name: string;
    };
    description: string;
    purchaseDate: string;
    warrantyEnd: string;
    allocationDate: string;
    updatedAt: string;
    type: {
        name: string;
        category: {
            id: number;
            name: string;
            tags: Tag[];
        }
    };
    assignedTo?: {
        fullName: string;
    };
    tags: Tag[];
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupTags, setGroupTags] = useState<Tag[]>([]);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<number[]>([]);
    const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    const fetchAssets = () => {
        setLoading(true);
        Promise.all([
            fetch("http://localhost:8080/api/assets").then(res => res.json()),
            fetch("http://localhost:8080/api/tags?isGroup=true").then(res => res.json())
        ]).then(([assetData, tagData]) => {
            setAssets(assetData);
            setGroupTags(tagData);
            setLoading(false);
        }).catch((err) => {
            console.error("Error fetching inventory data:", err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredAssets = assets.filter(asset => {
        // Tab Filtering (Group Tags on Category)
        if (activeTab !== 'All') {
            const hasGroupTag = asset.type?.category?.tags?.some(tag => tag.name === activeTab);
            if (!hasGroupTag) return false;
        }

        // Search Query
        const searchMatch = !searchQuery ||
            asset.assetCustomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.type?.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (!searchMatch) return false;

        // Tag Filter (Asset Tags)
        if (selectedFilterTags.length > 0) {
            const hasAllTags = selectedFilterTags.every(tagId =>
                asset.tags?.some(t => t.id === tagId)
            );
            if (!hasAllTags) return false;
        }

        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'AVAILABLE': return 'text-green-500';
            case 'ALLOCATED': return 'text-orange-500';
            case 'UNDER_REPAIR': return 'text-yellow-600';
            case 'TRANSIT': return 'text-blue-500';
            case 'DECOMMISSIONED':
            case 'DEFECTIVE':
            case 'DISPOSED':
            case 'LOST_STOLEN': return 'text-red-500';
            case 'IN_ACTIVE': return 'text-gray-400';
            default: return 'text-gray-600';
        }
    };

    const formatPrice = (price: number) => {
        if (!price) return 'Rs. 0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price).replace('₹', 'Rs. ');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'NA';
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-baseline gap-4 mb-2">
                        <h1 className="text-4xl font-extrabold text-gray-900">Inventory</h1>
                        <Link to="/helpdesk">
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

                    <Link to="/assets/new">
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
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('All')}
                    className={`px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'All'
                        ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                        }`}
                >
                    All Assets
                </button>
                {groupTags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => setActiveTab(tag.name)}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tag.name
                            ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        {tag.name} Assets
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
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900">{asset.type?.name}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {asset.tags?.map(tag => (
                                                        <span
                                                            key={tag.id}
                                                            className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-white"
                                                            style={{ backgroundColor: tag.color }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.brand}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-900">{asset.assetCustomId}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{formatPrice(asset.price)}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500 max-w-xs truncate" title={asset.description}>{asset.description || 'NA'}</td>
                                        <td className={`px-6 py-5 text-[12px] font-black underline decoration-2 underline-offset-4 ${getStatusColor(asset.status)}`}>
                                            {asset.status}
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.assignedTo?.fullName || 'NA'}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{formatDate(asset.allocationDate)}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">SER#12345678</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{formatDate(asset.updatedAt)}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{formatDate(asset.warrantyEnd)}</td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-gray-500">{asset.location?.name || 'NA'}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {asset.status === 'AVAILABLE' && (
                                                    <button
                                                        onClick={() => { setSelectedAsset(asset); setIsAllocModalOpen(true); }}
                                                        className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors text-orange-500"
                                                        title="Allocate Asset"
                                                    >
                                                        <ArrowRightCircle size={18} />
                                                    </button>
                                                )}
                                                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                    <MoreVertical size={18} className="text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedAsset && (
                <AllocationModal
                    asset={selectedAsset}
                    isOpen={isAllocModalOpen}
                    onClose={() => setIsAllocModalOpen(false)}
                    onSuccess={fetchAssets}
                />
            )}
        </div>
    );
}
