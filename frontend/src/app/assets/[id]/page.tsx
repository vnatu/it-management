"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Edit,
    QrCode,
    History,
    Monitor,
    Shield,
    MapPin,
    Tag as TagIcon,
    Calendar,
    DollarSign,
    Box
} from "lucide-react";

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
}

interface Location {
    id: number;
    name: string;
    code: string;
    address: string;
}

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    status: string;
    price: number;
    description: string;
    location: Location | null;
    purchaseDate: string;
    warrantyEnd: string;
    type: {
        name: string;
        category: {
            name: string;
        };
    };
    tags: Tag[];
    technicalSpecs: any;
}

export default function AssetDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetRes, historyRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/assets/${id}`),
                    fetch(`http://localhost:8080/api/history/asset/${id}`)
                ]);
                if (assetRes.ok) setAsset(await assetRes.json());
                if (historyRes.ok) setHistory(await historyRes.json());
            } catch (err) {
                console.error("Error fetching asset details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE': return 'bg-green-500 shadow-green-500/20';
            case 'ALLOCATED': return 'bg-blue-500 shadow-blue-500/20';
            case 'UNDER_REPAIR': return 'bg-orange-500 shadow-orange-500/20';
            case 'TRANSIT': return 'bg-purple-500 shadow-purple-500/20';
            case 'DEFECTIVE': return 'bg-red-500 shadow-red-500/20';
            default: return 'bg-gray-500 shadow-gray-500/20';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!asset) return <div className="p-8">Asset not found.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all"
                    >
                        <ArrowLeft className="text-gray-500" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{asset.assetCustomId}</h1>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${getStatusColor(asset.status)}`}>
                                {asset.status.replace('_', ' ')}
                            </div>
                        </div>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                            {asset.type.category.name} <span className="mx-2">•</span> {asset.type.name}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-gray-100 shadow-sm transition-all">
                        <QrCode size={18} />
                        Generate QR
                    </button>
                    <Link href={`/assets/edit/${asset.id}`}>
                        <button className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all italic">
                            <Edit size={18} />
                            Edit Asset
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual Card */}
                    <section className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex gap-8 items-start">
                        <div className="w-32 h-32 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
                            <Box size={64} strokeWidth={1} />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Brand & Model</h3>
                                    <p className="text-2xl font-black text-gray-900 leading-tight">
                                        {asset.brand} <br />
                                        <span className="text-orange-500">{asset.modelNo}</span>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Serial Number</h3>
                                    <p className="text-xl font-bold text-gray-700 font-mono tracking-wider">{asset.serialNo}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-600">{asset.location?.name || 'No Location'}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-600">Added {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Description & Technical Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                                <Shield size={14} /> Description
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                {asset.description || "No description provided for this asset."}
                            </p>
                        </section>

                        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                                <Monitor size={14} /> Technical Specs
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(asset.technicalSpecs || {}).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{key}</span>
                                        <span className="text-sm font-black text-gray-800">{String(value)}</span>
                                    </div>
                                ))}
                                {(!asset.technicalSpecs || Object.keys(asset.technicalSpecs).length === 0) && (
                                    <p className="text-gray-400 italic text-sm">Universal asset profile</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sidebar Info Column */}
                <div className="space-y-8">
                    {/* Financials Card */}
                    <section className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Purchase Price</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black italic">Rs.</span>
                                <span className="text-5xl font-black italic tracking-tighter text-orange-500">
                                    {asset.price?.toLocaleString()}
                                </span>
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-800 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-bold">Warranty Ends</span>
                                    <span className="font-black text-orange-400">{asset.warrantyEnd ? new Date(asset.warrantyEnd).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 text-gray-800 opacity-20">
                            <DollarSign size={160} />
                        </div>
                    </section>

                    {/* Tags Card */}
                    <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                            <TagIcon size={14} /> Associated Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {asset.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}
                                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border"
                                >
                                    #{tag.name}
                                </span>
                            ))}
                            {asset.tags.length === 0 && <span className="text-gray-300 italic text-xs">No tags assigned</span>}
                        </div>
                    </section>

                    {/* History Mini-Timeline */}
                    <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                            <History size={14} /> Recent Activity
                        </h3>
                        <div className="space-y-6 relative ml-3 before:absolute before:inset-0 before:ml-[-2px] before:w-[2px] before:bg-gray-50">
                            {history.slice(0, 3).map((item) => (
                                <div key={item.id} className="relative pl-6">
                                    <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-white shadow-sm"></div>
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{item.action}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(item.timestamp).toLocaleDateString()}</p>
                                </div>
                            ))}
                            {history.length === 0 && <p className="text-gray-300 italic text-xs">No activity recorded</p>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
