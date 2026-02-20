"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Layout,
    Monitor,
    Shield,
    AlertCircle,
    MapPin,
    AlertTriangle,
    Tag as TagIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WizardStep } from "@/components/ui/wizard-step";
import TagPicker from "@/components/TagPicker";

interface Category {
    id: number;
    name: string;
}

interface AttributeDefinition {
    id: number;
    name: string;
    dataType: string;
    required: boolean;
    section: 'COMMON' | 'MANUFACTURING' | 'MORE_ATTRIBUTES';
}

interface AssetType {
    id: number;
    name: string;
    category: Category;
    attributeDefinitions?: AttributeDefinition[];
}

interface Location {
    id: number;
    name: string;
    code: string;
    active: boolean;
}

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

export default function NewAssetPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Data Sources
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<AssetType[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [typeAttributes, setTypeAttributes] = useState<AttributeDefinition[]>([]);

    // Selection State
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedType, setSelectedType] = useState<AssetType | null>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        assetCustomId: "",
        brand: "",
        modelNo: "",
        serialNo: "",
        price: "",
        purchaseDate: "",
        warrantyEnd: "",
        location: null,
        status: "AVAILABLE",
        description: "",
        technicalSpecs: {},
        tags: [],
    });

    const [error, setError] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [cats, locs, tags] = await Promise.all([
                    fetch("http://localhost:8080/api/categories").then(r => r.json()),
                    fetch("http://localhost:8080/api/locations").then(r => r.json()),
                    fetch("http://localhost:8080/api/tags").then(r => r.json())
                ]);
                setCategories(cats);
                setLocations(locs.filter((l: any) => l.active));
                setAllTags(tags);
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch Types when Category changes
    useEffect(() => {
        if (selectedCategory) {
            fetch(`http://localhost:8080/api/asset-categories/${selectedCategory.id}/types`)
                .then(res => res.json())
                .then(setTypes)
                .catch(err => console.error(err));
        }
    }, [selectedCategory]);

    // Fetch Attributes when Type changes
    useEffect(() => {
        if (selectedType) {
            fetch(`http://localhost:8080/api/asset-types/${selectedType.id}/attributes`)
                .then(res => res.json())
                .then(attrs => setTypeAttributes(attrs))
                .catch(err => console.error(err));
        }
    }, [selectedType]);

    // --- State Handlers ---

    const handleCategoryChange = (val: string) => {
        const cat = categories.find(c => c.id.toString() === val) || null;
        setSelectedCategory(cat);
        setSelectedType(null);
        setTypeAttributes([]);
    };

    const handleTypeChange = (val: string) => {
        const type = types.find(t => t.id.toString() === val) || null;
        setSelectedType(type);
        if (type) {
            setFormData(prev => ({ ...prev, type: { id: type.id } }));
        }
    };

    const updateSpec = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            technicalSpecs: { ...prev.technicalSpecs, [name]: value }
        }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setError(null);
        const submitData = {
            ...formData,
            location: formData.location ? { id: parseInt(formData.location) } : null,
            price: formData.price ? parseFloat(formData.price) : null
        };

        try {
            const res = await fetch("http://localhost:8080/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });

            if (res.ok) {
                router.push("/assets");
            } else {
                const err = await res.text();
                setError(err);
            }
        } catch (err) {
            setError("Network error occurred.");
        }
    };

    // Filter attributes by section
    const getAttributesBySection = (section: string) => {
        return typeAttributes.filter(attr => (attr.section || 'COMMON') === section);
    };

    return (
        <div className="max-w-3xl mx-auto pb-20 pt-10 px-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl shrink-0">
                    <ArrowLeft className="text-gray-500" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-brand-black tracking-tight uppercase">New Asset Wizard</h1>
                </div>
            </div>

            {error && (
                <div className="bg-brand-red/10 border-2 border-brand-red/20 rounded-2xl p-4 flex items-center gap-3 text-brand-red font-bold mb-6">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 min-h-[500px] relative">

                {/* Step 1: Category */}
                <WizardStep
                    stepNumber={1}
                    totalSteps={5}
                    currentStep={step}
                    isActive={step === 1}
                    isCompleted={step > 1}
                    title="Select Category"
                    description="Choose the high-level category for this asset"
                    icon={Layout}
                    iconColor="text-brand-orange"
                    iconBgColor="bg-brand-orange/10"
                >
                    <div className="mt-8 max-w-sm mx-auto space-y-8 text-center">
                        <div className="bg-brand-orange/5 p-8 rounded-3xl inline-flex mb-4">
                            <Layout size={64} className="text-brand-orange/40" />
                        </div>
                        <div className="space-y-4">
                            <Select value={selectedCategory?.id.toString()} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="h-14 text-lg font-bold rounded-xl border-2 border-gray-100">
                                    <SelectValue placeholder="Choose Category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()} className="font-bold py-3">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={nextStep}
                            disabled={!selectedCategory}
                            className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                            Next Step
                        </Button>
                    </div>
                </WizardStep>

                {/* Step 2: Type */}
                <WizardStep
                    stepNumber={2}
                    totalSteps={5}
                    currentStep={step}
                    isActive={step === 2}
                    isCompleted={step > 2}
                    title="Select Asset Type"
                    description={`Which type of ${selectedCategory?.name} is this?`}
                    icon={Monitor}
                    iconColor="text-brand-blue"
                    iconBgColor="bg-brand-blue/10"
                >
                    <div className="mt-8 max-w-sm mx-auto space-y-8 text-center">
                        <div className="bg-brand-blue/5 p-8 rounded-3xl inline-flex mb-4">
                            <Monitor size={64} className="text-brand-blue/40" />
                        </div>
                        <div className="space-y-4">
                            <Select value={selectedType?.id.toString()} onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-14 text-lg font-bold rounded-xl border-2 border-gray-100">
                                    <SelectValue placeholder="Choose Type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()} className="font-bold py-3">{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-xl border-2">Back</Button>
                            <Button
                                onClick={nextStep}
                                disabled={!selectedType}
                                className="flex-[2] h-14 text-lg font-black uppercase tracking-widest rounded-xl"
                            >
                                Next Step
                            </Button>
                        </div>
                    </div>
                </WizardStep>

                {/* Step 3: Common Attributes */}
                <WizardStep
                    stepNumber={3}
                    totalSteps={5}
                    currentStep={step}
                    isActive={step === 3}
                    isCompleted={step > 3}
                    title="Common Details"
                    description="Standard identification and tracking info"
                    icon={Shield}
                    iconColor="text-brand-green"
                    iconBgColor="bg-brand-green/10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asset Custom ID *</label>
                            <Input value={formData.assetCustomId} onChange={e => setFormData({ ...formData, assetCustomId: e.target.value })} placeholder="AST-001" className="font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Brand / Make *</label>
                            <Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="Dell, Apple..." className="font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Model</label>
                            <Input value={formData.modelNo} onChange={e => setFormData({ ...formData, modelNo: e.target.value })} className="font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="ALLOCATED">Allocated</SelectItem>
                                    <SelectItem value="UNDER_REPAIR">Under Repair</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Location *</label>
                            <Select value={formData.location} onValueChange={v => setFormData({ ...formData, location: v })}>
                                <SelectTrigger className="font-bold h-12"><SelectValue placeholder="Select Location..." /></SelectTrigger>
                                <SelectContent>
                                    {locations.map(l => (
                                        <SelectItem key={l.id} value={l.id.toString()}>{l.name} ({l.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dynamic Common Attributes */}
                        {getAttributesBySection('COMMON').map(attr => (
                            <div key={attr.id} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {attr.name} {attr.required && <span className="text-red-500">*</span>}
                                </label>
                                <Input
                                    type={attr.dataType === 'NUMBER' ? 'number' : attr.dataType === 'DATE' ? 'date' : 'text'}
                                    onChange={e => updateSpec(attr.name, e.target.value)}
                                    className="font-bold"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                        <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-xl border-2">Back</Button>
                        <Button
                            onClick={nextStep}
                            disabled={!formData.assetCustomId || !formData.brand || !formData.location}
                            className="flex-[2] h-14 text-lg font-black uppercase tracking-widest rounded-xl"
                        >
                            Next Step
                        </Button>
                    </div>
                </WizardStep>

                {/* Step 4: Manufacturing */}
                <WizardStep
                    stepNumber={4}
                    totalSteps={5}
                    currentStep={step}
                    isActive={step === 4}
                    isCompleted={step > 4}
                    title="Manufacturing Info"
                    description="Serial numbers, dates, and warranty info"
                    icon={AlertCircle}
                    iconColor="text-brand-purple"
                    iconBgColor="bg-brand-purple/10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Serial Number</label>
                            <Input value={formData.serialNo} onChange={e => setFormData({ ...formData, serialNo: e.target.value })} className="font-black text-xl h-14 tracking-wide" placeholder="SN-XXXXX" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Purchase Date</label>
                            <Input type="date" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} className="font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Warranty End</label>
                            <Input type="date" value={formData.warrantyEnd} onChange={e => setFormData({ ...formData, warrantyEnd: e.target.value })} className="font-bold" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Purchase Price (INR)</label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="font-black text-2xl text-brand-orange h-16" placeholder="0.00" />
                        </div>

                        {/* Dynamic Manufacturing Attributes */}
                        {getAttributesBySection('MANUFACTURING').map(attr => (
                            <div key={attr.id} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {attr.name} {attr.required && <span className="text-red-500">*</span>}
                                </label>
                                <Input
                                    type={attr.dataType === 'NUMBER' ? 'number' : attr.dataType === 'DATE' ? 'date' : 'text'}
                                    onChange={e => updateSpec(attr.name, e.target.value)}
                                    className="font-bold"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                        <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-xl border-2">Back</Button>
                        <Button
                            onClick={nextStep}
                            className="flex-[2] h-14 text-lg font-black uppercase tracking-widest rounded-xl"
                        >
                            Next Step
                        </Button>
                    </div>
                </WizardStep>

                {/* Step 5: More Attributes & Submit */}
                <WizardStep
                    stepNumber={5}
                    totalSteps={5}
                    currentStep={step}
                    isActive={step === 5}
                    isCompleted={step > 5}
                    title="Final Details"
                    description="Additional attributes and tags"
                    icon={TagIcon}
                    iconColor="text-brand-red"
                    iconBgColor="bg-brand-red/10"
                >
                    <div className="space-y-6 mt-6">

                        {/* Dynamic More Attributes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getAttributesBySection('MORE_ATTRIBUTES').map(attr => (
                                <div key={attr.id} className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {attr.name} {attr.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <Input
                                        type={attr.dataType === 'NUMBER' ? 'number' : attr.dataType === 'DATE' ? 'date' : 'text'}
                                        onChange={e => updateSpec(attr.name, e.target.value)}
                                        className="font-bold"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notes / Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="font-medium"
                                placeholder="Any additional notes..."
                            />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <TagPicker
                                allTags={allTags}
                                selectedTagIds={formData.tags.map((t: any) => t.id)}
                                onToggle={(id) => {
                                    const currentIds = formData.tags.map((t: any) => t.id);
                                    const nextTags = currentIds.includes(id)
                                        ? formData.tags.filter((t: any) => t.id !== id)
                                        : [...formData.tags, { id }];
                                    setFormData({ ...formData, tags: nextTags });
                                }}
                                label="Assign Tags"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                        <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-xl border-2">Back</Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-[2] h-14 text-lg font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-orange/20"
                        >
                            Complete Asset
                        </Button>
                    </div>
                </WizardStep>

            </div>
        </div>
    );
}
