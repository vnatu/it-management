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
import { Plus, X } from 'lucide-react';

interface AssetType {
    id: number;
    name: string;
}

interface TypeSelectProps {
    categoryId: number | null;
    selectedTypeId: number | null;
    onSelect: (id: number) => void;
}

export default function TypeSelect({ categoryId, selectedTypeId, onSelect }: TypeSelectProps) {
    const [types, setTypes] = useState<AssetType[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');

    useEffect(() => {
        if (categoryId) {
            fetchTypes();
        } else {
            setTypes([]);
        }
    }, [categoryId]);

    const fetchTypes = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/asset-categories/${categoryId}/types`);
            if (res.ok) setTypes(await res.json());
        } catch (error) {
            console.error('Failed to fetch types:', error);
        }
    };

    const handleCreate = async () => {
        if (!newTypeName.trim() || !categoryId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/asset-categories/${categoryId}/types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTypeName,
                    category: { id: categoryId }
                }),
            });
            if (res.ok) {
                const newType = await res.json();
                setTypes([...types, newType]);
                onSelect(newType.id);
                setIsCreating(false);
                setNewTypeName('');
            }
        } catch (error) {
            console.error('Failed to create type:', error);
        }
    };

    if (!categoryId) return (
        <div className="space-y-4 opacity-50 pointer-events-none">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-slate opacity-60">Asset Type</h3>
            <div className="px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] font-bold text-gray-400">
                Select Category First
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-slate opacity-60">Asset Type</h3>

            {!isCreating ? (
                <Select
                    value={selectedTypeId?.toString() || ""}
                    onValueChange={(value) => {
                        if (value === "new") {
                            setIsCreating(true);
                        } else {
                            onSelect(Number(value));
                        }
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {types.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                                {t.name}
                            </SelectItem>
                        ))}
                        <SelectItem
                            value="new"
                            className="text-brand-orange focus:bg-brand-orange/10 focus:text-brand-orange border-t border-gray-100 rounded-none mt-2 pt-4"
                        >
                            + ADD NEW TYPE
                        </SelectItem>
                    </SelectContent>
                </Select>
            ) : (
                <div className="space-y-6 p-6 bg-brand-white border-2 border-dashed border-gray-200 rounded-[2rem] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Define Specific Type</h4>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-brand-red transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <Input
                        autoFocus
                        placeholder="e.g. Laptop, Server, Office Chair"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                    />

                    <Button
                        onClick={handleCreate}
                        disabled={!newTypeName.trim()}
                        className="w-full"
                    >
                        <Plus size={18} />
                        Confirm Asset Type
                    </Button>
                </div>
            )}
        </div>
    );
}
