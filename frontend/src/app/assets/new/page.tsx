"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
    id: number;
    name: string;
    attributeDefinitions: AttributeDefinition[];
}

interface AttributeDefinition {
    id: number;
    name: string;
    dataType: string;
    required: boolean;
}

interface AssetType {
    id: number;
    name: string;
    category: Category;
}

export default function NewAssetPage() {
    const router = useRouter();
    const [types, setTypes] = useState<AssetType[]>([]);
    const [selectedType, setSelectedType] = useState<AssetType | null>(null);
    const [formData, setFormData] = useState<any>({
        assetCustomId: "",
        brand: "",
        modelNo: "",
        serialNo: "",
        status: "AVAILABLE",
        technicalSpecs: {},
    });

    useEffect(() => {
        fetch("http://localhost:8080/api/asset-types")
            .then((res) => res.json())
            .then(setTypes);
    }, []);

    const handleTypeChange = (typeId: string) => {
        const type = types.find((t) => t.id === parseInt(typeId)) || null;
        setSelectedType(type);
        setFormData({ ...formData, type: { id: type?.id }, technicalSpecs: {} });
    };

    const handleSpecChange = (name: string, value: any) => {
        setFormData({
            ...formData,
            technicalSpecs: { ...formData.technicalSpecs, [name]: value },
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("http://localhost:8080/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            router.push("/assets");
        } else {
            alert("Error saving asset");
        }
    };

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asset ID</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border p-2"
                            value={formData.assetCustomId}
                            onChange={(e) => setFormData({ ...formData, assetCustomId: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                        <select
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border p-2"
                            onChange={(e) => handleTypeChange(e.target.value)}
                        >
                            <option value="">Select Type</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.category.name})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Model No</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            value={formData.modelNo}
                            onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                        />
                    </div>
                </div>

                {selectedType?.category.attributeDefinitions.length ? (
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-medium mb-4 text-gray-800">Technical Specifications</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {selectedType.category.attributeDefinitions.map((def) => (
                                <div key={def.id}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {def.name} {def.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={def.dataType === "NUMBER" ? "number" : def.dataType === "DATE" ? "date" : "text"}
                                        required={def.required}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                        onChange={(e) => handleSpecChange(def.name, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

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
                        Save Asset
                    </button>
                </div>
            </form>
        </div>
    );
}
