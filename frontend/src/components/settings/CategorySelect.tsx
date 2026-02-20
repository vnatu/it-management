"use client";

import { useState, useEffect } from 'react';
import TagPicker from '@/components/TagPicker';
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

interface Category {
    id: number;
    name: string;
}

interface CategorySelectProps {
    selectedCategoryId: number | null;
    onSelect: (id: number) => void;
    onCategoryCreated: () => void;
}

export default function CategorySelect({ selectedCategoryId, onSelect, onCategoryCreated }: CategorySelectProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [allTags, setAllTags] = useState<any[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                fetch('http://localhost:8080/api/categories'),
                fetch('http://localhost:8080/api/tags')
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (tagRes.ok) setAllTags(await tagRes.json());
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch('http://localhost:8080/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryName,
                    type: 'IT',
                    description: '',
                    tags: selectedTagIds.map(id => ({ id }))
                }),
            });
            if (res.ok) {
                const newCategory = await res.json();
                setCategories([...categories, newCategory]);
                onSelect(newCategory.id);
                setIsCreating(false);
                setNewCategoryName('');
                setSelectedTagIds([]);
                onCategoryCreated();
            }
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-slate opacity-60">Asset Categories</h3>

            {!isCreating ? (
                <Select
                    value={selectedCategoryId?.toString() || ""}
                    onValueChange={(value) => {
                        if (value === "new") {
                            setIsCreating(true);
                        } else {
                            onSelect(Number(value));
                        }
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                            </SelectItem>
                        ))}
                        <SelectItem
                            value="new"
                            className="text-brand-orange focus:bg-brand-orange/10 focus:text-brand-orange border-t border-gray-100 rounded-none mt-2 pt-4"
                        >
                            + ADD NEW CATEGORY
                        </SelectItem>
                    </SelectContent>
                </Select>
            ) : (
                <div className="space-y-6 p-6 bg-brand-white border-2 border-dashed border-gray-200 rounded-[2rem] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Create Hierarchy Root</h4>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-brand-red transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <Input
                        autoFocus
                        placeholder="e.g. Hardware, Furniture, License"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />

                    <TagPicker
                        allTags={allTags}
                        selectedTagIds={selectedTagIds}
                        onToggle={(id) => setSelectedTagIds(prev =>
                            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
                        )}
                        label="Category Indicators (Tags)"
                    />

                    <Button
                        onClick={handleCreate}
                        disabled={!newCategoryName.trim()}
                        className="w-full"
                    >
                        <Plus size={18} />
                        Establish Category
                    </Button>
                </div>
            )}
        </div>
    );
}
