"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Monitor,
    Shield,
    MapPin,
    AlertCircle,
    Save
} from "lucide-react";
import TagPicker from "@/components/TagPicker";

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

interface Location {
    id: number;
    name: string;
    code: string;
}

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

export default function EditAssetPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState<Location[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetRes, locationsRes, tagsRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/assets/${id}`),
                    fetch("http://localhost:8080/api/locations"),
                    fetch("http://localhost:8080/api/tags")
                ]);

                if (assetRes.ok) {
                    const asset = await assetRes.json();
                    setFormData({
                        ...asset,
                        location: asset.location?.id?.toString() || "",
                        price: asset.price?.toString() || "",
                        purchaseDate: asset.purchaseDate || "",
                        warrantyEnd: asset.warrantyEnd || "",
                    });
                }

                if (locationsRes.ok) {
                    const locs = await locationsRes.json();
                    setLocations(locs.filter((l: any) => l.active));
                }

                if (tagsRes.ok) {
                    const tags = await tagsRes.json();
                    setAllTags(tags);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSpecChange = (name: string, value: any) => {
        setFormData({
            ...formData,
            technicalSpecs: { ...formData.technicalSpecs, [name]: value },
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...formData,
            location: formData.location ? { id: parseInt(formData.location) } : null,
            price: formData.price ? parseFloat(formData.price) : null
        };

        const res = await fetch(`http://localhost:8080/api/assets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submitData),
        });

        if (res.ok) {
            router.push("/assets");
        } else {
            const err = await res.text();
            alert("Error updating asset: " + err);
        }
    };

    if (loading || !formData) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Asset</h1>
                    <p className="text-gray-500 font-medium text-sm">Modifying {formData.assetCustomId}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Information */}
                    <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                <Monitor size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">Asset Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Asset ID (Custom)</label>
                                <input
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-400 outline-none"
                                    value={formData.assetCustomId}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Brand / Manufacturer</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold"
                                    value={formData.brand || ""}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Model Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold"
                                    value={formData.modelNo || ""}
                                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Serial Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold"
                                    value={formData.serialNo || ""}
                                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description / Notes</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Technical Specs */}
                    {formData.type?.category?.attributeDefinitions?.length > 0 && (
                        <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                                    <AlertCircle size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">Specifications</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.type.category.attributeDefinitions.map((def: any) => (
                                    <div key={def.id}>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                            {def.name} {def.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={def.dataType === "NUMBER" ? "number" : def.dataType === "DATE" ? "date" : "text"}
                                            required={def.required}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold"
                                            value={formData.technicalSpecs?.[def.name] || ""}
                                            onChange={(e) => handleSpecChange(def.name, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Governance */}
                    <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">Governance</h2>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Asset Status</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-gray-700"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="ALLOCATED">Allocated</option>
                                <option value="UNDER_REPAIR">Under Repair</option>
                                <option value="TRANSIT">In Transit</option>
                                <option value="DEFECTIVE">Defective</option>
                                <option value="DECOMMISSIONED">Decommissioned</option>
                                <option value="DISPOSED">Disposed</option>
                                <option value="LOST_STOLEN">Lost / Stolen</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Current Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-gray-700"
                                    value={formData.location || ""}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(l => (
                                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Financials & Dates */}
                    <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Purchase Price (INR)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-black text-2xl text-orange-500"
                                value={formData.price || ""}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Purchase Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Warranty End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl"
                                    value={formData.warrantyEnd}
                                    onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Tags */}
                    <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
                        <TagPicker
                            allTags={allTags}
                            selectedTagIds={formData.tags?.map((t: any) => t.id) || []}
                            onToggle={(id) => {
                                const currentIds = formData.tags?.map((t: any) => t.id) || [];
                                const nextTags = currentIds.includes(id)
                                    ? formData.tags.filter((t: any) => t.id !== id)
                                    : [...(formData.tags || []), { id }];
                                setFormData({ ...formData, tags: nextTags });
                            }}
                            label="Asset Tags"
                        />
                    </section>

                    {/* Actions */}
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest italic"
                        >
                            <Save size={20} />
                            Update Asset Entry
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full bg-white text-gray-400 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
