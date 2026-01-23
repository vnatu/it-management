"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditAssetPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        fetch(`http://localhost:8080/api/assets/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setFormData(data);
                setLoading(false);
            });
    }, [id]);

    const handleSpecChange = (name: string, value: any) => {
        setFormData({
            ...formData,
            technicalSpecs: { ...formData.technicalSpecs, [name]: value },
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`http://localhost:8080/api/assets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            router.push(`/assets/${id}`);
        } else {
            alert("Error updating asset");
        }
    };

    if (loading || !formData) return <div className="p-8">Loading asset...</div>;

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Asset: {formData.assetCustomId}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asset ID</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border p-2 bg-gray-50"
                            value={formData.assetCustomId}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            value={formData.brand || ""}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Model No</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            value={formData.modelNo || ""}
                            onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Serial No</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            value={formData.serialNo || ""}
                            onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="ALLOCATED">Allocated</option>
                            <option value="DEFECTIVE">Defective</option>
                            <option value="DECOMMISSIONED">Decommissioned</option>
                        </select>
                    </div>
                </div>

                {formData.type?.category?.attributeDefinitions?.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-medium mb-4 text-gray-800">Technical Specifications</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {formData.type.category.attributeDefinitions.map((def: any) => (
                                <div key={def.id}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {def.name} {def.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={def.dataType === "NUMBER" ? "number" : def.dataType === "DATE" ? "date" : "text"}
                                        required={def.required}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                        value={formData.technicalSpecs?.[def.name] || ""}
                                        onChange={(e) => handleSpecChange(def.name, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-orange-600 shadow-sm transition-colors"
                    >
                        Update Asset
                    </button>
                </div>
            </form>
        </div>
    );
}
