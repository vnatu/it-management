"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    sku: string;
    color: string;
    status: string;
    location: string;
    type: {
        id: number;
        name: string;
        category: {
            name: string;
            attributeDefinitions: any[];
        };
    };
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
                const assetData = await assetRes.json();
                const historyData = await historyRes.json();
                setAsset(assetData);
                setHistory(historyData);
            } catch (err) {
                console.error("Error fetching asset details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8">Loading asset details...</div>;
    if (!asset) return <div className="p-8">Asset not found.</div>;

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Link href="/assets" className="text-gray-500 hover:text-gray-700">← Back</Link>
                    <h1 className="text-3xl font-bold text-gray-800">Asset: {asset.assetCustomId}</h1>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Generate QR</button>
                    <Link href={`/assets/edit/${asset.id}`}>
                        <span className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer">
                            Edit Asset
                        </span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* General Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">General Information</h2>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Brand & Model</label>
                                <p className="text-gray-800 font-medium">{asset.brand} - {asset.modelNo}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Serial Number</label>
                                <p className="text-gray-800 font-medium">{asset.serialNo}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {asset.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</label>
                                <p className="text-gray-800 font-medium">{asset.location || "Not assigned"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Technical Specifications</h2>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            {Object.entries(asset.technicalSpecs || {}).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{key}</label>
                                    <p className="text-gray-800 font-medium">{String(value)}</p>
                                </div>
                            ))}
                            {!asset.technicalSpecs && <p className="text-gray-400 italic">No specs defined.</p>}
                        </div>
                    </div>
                </div>

                {/* History Timeline */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Asset History</h2>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        {history.map((item, idx) => (
                            <div key={item.id} className="relative flex items-center justify-between group">
                                <div className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 z-10 ${item.action === 'CREATED' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-bold text-gray-800">{item.action}</p>
                                        <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}</p>
                                        <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-gray-400 italic">No history available.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
