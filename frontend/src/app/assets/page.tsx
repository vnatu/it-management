"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    status: string;
    type: {
        name: string;
    };
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch assets from backend API
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">IT Assets</h1>
                <Link href="/assets/new">
                    <span className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer inline-block">
                        + Add Asset
                    </span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Asset ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Brand/Model</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Serial No</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Loading assets...
                                </td>
                            </tr>
                        ) : assets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No assets found.
                                </td>
                            </tr>
                        ) : (
                            assets.map((asset) => (
                                <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 underline decoration-primary/30 hover:decoration-primary">
                                        <Link href={`/assets/${asset.id}`}>
                                            {asset.assetCustomId}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{asset.type.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {asset.brand} - {asset.modelNo}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{asset.serialNo}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            asset.status === 'ALLOCATED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button className="text-primary hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
