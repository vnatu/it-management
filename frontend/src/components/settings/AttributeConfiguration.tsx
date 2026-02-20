"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Copy, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attribute {
    id?: number;
    name: string;
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN';
    required: boolean;
    section: 'COMMON' | 'MANUFACTURING' | 'MORE_ATTRIBUTES';
}

interface AssetType {
    id: number;
    name: string;
    category: {
        name: string;
    };
}

const SECTIONS = [
    { id: 'COMMON', label: 'Common Attributes' },
    { id: 'MANUFACTURING', label: 'Manufacturing Info' },
    { id: 'MORE_ATTRIBUTES', label: 'More Attributes' }
];

export default function AttributeConfiguration({ typeId }: { typeId: number }) {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [activeSection, setActiveSection] = useState<string>('COMMON');
    const [allTypes, setAllTypes] = useState<AssetType[]>([]);
    const [copySourceTypeId, setCopySourceTypeId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        fetchAttributes();
        fetchAllTypes();
    }, [typeId]);

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/asset-types/${typeId}/attributes`);
            if (res.ok) {
                const data = await res.json();
                setAttributes(data.length > 0 ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch attributes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTypes = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/asset-types');
            if (res.ok) {
                const data = await res.json();
                setAllTypes(data.filter((t: any) => t.id !== typeId));
            }
        } catch (error) {
            console.error('Failed to fetch types:', error);
        }
    };

    const handleAddRow = () => {
        setAttributes([...attributes, {
            name: '',
            dataType: 'TEXT',
            required: false,
            section: activeSection as any
        }]);
    };

    const handleRemoveRow = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleUpdateRow = (index: number, field: keyof Attribute, value: any) => {
        const newAttrs = [...attributes];
        newAttrs[index] = { ...newAttrs[index], [field]: value };
        setAttributes(newAttrs);
    };

    const handleBatchSave = async () => {
        setSaveStatus('saving');
        try {
            const validAttrs = attributes.filter(a => a.name.trim() !== "");
            const res = await fetch(`http://localhost:8080/api/asset-types/${typeId}/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validAttrs),
            });
            if (res.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            setSaveStatus('error');
        }
    };

    const handleCopyAttributes = async () => {
        if (!copySourceTypeId) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/asset-types/${typeId}/copy-from/${copySourceTypeId}`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchAttributes();
                setCopySourceTypeId("");
            }
        } catch (error) {
            console.error('Failed to copy attributes:', error);
        } finally {
            setLoading(false);
        }
    };

    const globalIndices = attributes.reduce((acc, attr, idx) => {
        if (attr.section === activeSection) acc.push(idx);
        return acc;
    }, [] as number[]);

    return (
        <div className="space-y-6">
            {/* Quick Copy Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-brand-orange/5 rounded-2xl border border-brand-orange/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                        <Copy size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange/60">Quick Configuration</p>
                        <h3 className="text-xl font-black text-brand-black uppercase tracking-tight">Copy Attributes From</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Select value={copySourceTypeId} onValueChange={setCopySourceTypeId}>
                        <SelectTrigger className="flex-1 bg-white border-brand-orange/20 h-10 px-4">
                            <SelectValue placeholder="Select Asset Type to copy from" />
                        </SelectTrigger>
                        <SelectContent>
                            {allTypes.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.category.name} - {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleCopyAttributes}
                        disabled={!copySourceTypeId || loading}
                        size="sm"
                        className="h-10"
                    >
                        Copy Now
                    </Button>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex border-b border-gray-100 mb-6 overflow-x-auto">
                {SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                            "px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                            activeSection === section.id
                                ? 'text-brand-orange'
                                : 'text-brand-slate/40 hover:text-brand-slate'
                        )}
                    >
                        {section.label}
                        {activeSection === section.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-orange rounded-t-full shadow-lg shadow-brand-orange/50"></div>
                        )}
                        {attributes.filter(a => a.section === section.id).length > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-brand-orange/10 text-brand-orange text-[10px] flex items-center justify-center rounded-full font-black">
                                {attributes.filter(a => a.section === section.id).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Attributes Table */}
            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/40">
                <Table>
                    <TableHeader className="bg-brand-orange/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-brand-orange">Attribute Name</TableHead>
                            <TableHead className="text-brand-orange">Type</TableHead>
                            <TableHead className="text-brand-orange text-center">Required</TableHead>
                            <TableHead className="text-brand-orange w-20 text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {globalIndices.map((globalIdx) => (
                            <TableRow key={globalIdx} className="group border-gray-50">
                                <TableCell>
                                    <Input
                                        placeholder="Enter attribute name..."
                                        className="h-10 bg-gray-50 border-gray-100 font-bold"
                                        value={attributes[globalIdx].name}
                                        onChange={(e) => handleUpdateRow(globalIdx, 'name', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={attributes[globalIdx].dataType}
                                        onValueChange={(value) => handleUpdateRow(globalIdx, 'dataType', value)}
                                    >
                                        <SelectTrigger className="h-10 bg-gray-50 border-gray-100 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TEXT">Input Type</SelectItem>
                                            <SelectItem value="NUMBER">Number</SelectItem>
                                            <SelectItem value="DATE">Date Picker</SelectItem>
                                            <SelectItem value="BOOLEAN">Checkbox / Toggle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={attributes[globalIdx].required}
                                        onCheckedChange={(checked) => handleUpdateRow(globalIdx, 'required', !!checked)}
                                        className="w-5 h-5"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <button
                                        onClick={() => handleRemoveRow(globalIdx)}
                                        className="p-2 text-brand-slate/20 hover:text-brand-red transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {globalIndices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-brand-slate/40 font-bold">No attributes defined for this section</p>
                                        <button
                                            onClick={handleAddRow}
                                            className="text-brand-orange text-sm font-black uppercase tracking-widest hover:underline"
                                        >
                                            + Add First Attribute
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={4} className="p-4 text-center">
                                <button
                                    onClick={handleAddRow}
                                    className="w-10 h-10 bg-brand-black text-brand-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all mx-auto shadow-lg"
                                >
                                    <Plus size={24} />
                                </button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Final Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate opacity-60">
                    {attributes.length} Total Attributes Defined
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-brand-slate/60">
                        Discard Changes
                    </Button>
                    <Button
                        onClick={handleBatchSave}
                        className={cn(
                            saveStatus === 'success' && 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20',
                            saveStatus === 'error' && 'bg-brand-red hover:bg-brand-red/90 shadow-brand-red/20'
                        )}
                    >
                        {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {saveStatus === 'success' && <Check size={18} />}
                        {saveStatus === 'error' && <X size={18} />}
                        {saveStatus === 'idle' ? 'Update Configuration' :
                            saveStatus === 'saving' ? 'Updating...' :
                                saveStatus === 'success' ? 'Configuration Saved' : 'Save Error'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
