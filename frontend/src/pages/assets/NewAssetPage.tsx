import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TagPicker from "@/components/TagPicker";

interface Category {
    id: number;
    name: string;
}

interface User {
    id: number;
    fullName: string;
}

interface AttributeDefinition {
    id: number;
    name: string;
    dataType: string;
    required: boolean;
    section: string;
}

interface AssetType {
    id: number;
    name: string;
    attributeDefinitions: AttributeDefinition[];
}

export default function NewAssetPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [allTypes, setAllTypes] = useState<AssetType[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<AssetType[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
    const [selectedType, setSelectedType] = useState<AssetType | null>(null);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [formData, setFormData] = useState<any>({
        assetCustomId: "",
        type: { id: "" },
        brand: "",
        modelNo: "",
        serialNo: "",
        sku: "",
        color: "",
        status: "AVAILABLE",
        location: { id: "" },
        purchaseDate: "",
        warrantyStart: "",
        warrantyEnd: "",
        price: "",
        vendorInfo: "",
        description: "",
        technicalSpecs: {},
    });

    useEffect(() => {
        // Fetch Categories
        fetch("http://localhost:8080/api/categories")
            .then((res) => res.json())
            .then(setCategories);

        // Fetch All Types (for filtering)
        fetch("http://localhost:8080/api/asset-types")
            .then((res) => res.json())
            .then(setAllTypes);

        // Fetch Locations
        fetch("http://localhost:8080/api/locations?active=true")
            .then((res) => res.json())
            .then(setLocations);

        // Fetch Tags
        fetch("http://localhost:8080/api/tags")
            .then((res) => res.json())
            .then(setAllTags);
    }, []);

    const handleCategoryChange = (catId: string) => {
        const id = catId === "" ? "" : parseInt(catId);
        setSelectedCategoryId(id);
        setSelectedType(null);
        setFormData({ ...formData, type: { id: "" }, technicalSpecs: {} });

        if (id === "") {
            setFilteredTypes([]);
        } else {
            // Fetch types specifically for this category
            fetch(`http://localhost:8080/api/asset-categories/${id}/types`)
                .then((res) => res.json())
                .then(setFilteredTypes);
        }
    };

    const handleTypeChange = (typeId: string) => {
        const type = filteredTypes.find((t) => t.id === parseInt(typeId)) || null;
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
        // Prepare payload: convert numbers/nulls where appropriate
        const payload = {
            ...formData,
            price: formData.price === "" ? null : parseFloat(formData.price),
            location: formData.location?.id ? { id: formData.location.id } : null,
            // Empty strings to null for dates if preferred
            purchaseDate: formData.purchaseDate || null,
            warrantyStart: formData.warrantyStart || null,
            warrantyEnd: formData.warrantyEnd || null,
            tags: selectedTagIds.map(id => ({ id }))
        };

        const res = await fetch("http://localhost:8080/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            navigate("/assets");
        } else {
            alert("Error saving asset");
        }
    };

    return (
        <div className="max-w-4xl pb-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Create New Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">

                {/* Identification & Categorization */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                        <span className="bg-orange-100 p-1 rounded mr-2">1</span> Basic Information
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 bg-gray-50"
                                value={selectedCategoryId}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                            <select
                                required
                                disabled={!selectedCategoryId}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 bg-gray-50"
                                value={formData.type.id}
                                onChange={(e) => handleTypeChange(e.target.value)}
                            >
                                <option value="">Select Type</option>
                                {filteredTypes.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Internal Asset ID</label>
                            <input
                                type="text"
                                required
                                placeholder="E.g. AST-001"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.assetCustomId}
                                onChange={(e) => setFormData({ ...formData, assetCustomId: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Manufacturer Details */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                        <span className="bg-orange-100 p-1 rounded mr-2">2</span> Hardware Specification
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Model No</label>
                            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.modelNo} onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Serial No</label>
                            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.serialNo} onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color</label>
                            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Status & Inventory Details */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                        <span className="bg-orange-100 p-1 rounded mr-2">3</span> Status
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Initial Status</label>
                            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 bg-gray-50"
                                value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="UNDER_REPAIR">Under Repair</option>
                                <option value="DEFECTIVE">Defective</option>
                                <option value="IN_ACTIVE">In Active</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <TagPicker
                                allTags={allTags}
                                selectedTagIds={selectedTagIds}
                                onToggle={(id) => setSelectedTagIds(prev =>
                                    prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
                                )}
                                label="Asset Tags"
                            />
                        </div>
                    </div>
                </section>

                {/* Financial & Location */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                        <span className="bg-orange-100 p-1 rounded mr-2">4</span> Financial & Location
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Warranty End</label>
                            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.warrantyEnd} onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <select
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                                value={formData.location?.id || ""}
                                onChange={(e) => setFormData({ ...formData, location: { id: parseInt(e.target.value) } })}
                            >
                                <option value="">Select Location</option>
                                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Additional Info */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                        <span className="bg-orange-100 p-1 rounded mr-2">5</span> Additional Info
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </section>

                {/* Dynamic Attributes */}
                {selectedType?.attributeDefinitions?.length ? (
                    <section className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                            <span className="bg-orange-100 p-1 rounded mr-2">6</span> Technical Specs ({selectedType.name})
                        </h3>
                        <div className="grid grid-cols-2 gap-6 p-4 bg-orange-50 rounded-lg">
                            {selectedType.attributeDefinitions.map((def) => (
                                <div key={def.id}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {def.name} {def.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={def.dataType === "NUMBER" ? "number" : def.dataType === "DATE" ? "date" : def.dataType === "BOOLEAN" ? "checkbox" : "text"}
                                        required={def.required}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white ${def.dataType === 'BOOLEAN' ? 'w-auto h-auto' : ''}`}
                                        onChange={(e) => handleSpecChange(def.name, def.dataType === 'BOOLEAN' ? e.target.checked : e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <div className="pt-6 flex justify-end space-x-4 border-t">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" className="px-8 py-2 bg-primary text-white font-semibold rounded-md hover:bg-orange-600 shadow-md transition-all">
                        Create Asset
                    </button>
                </div>
            </form>
        </div>
    );
}

