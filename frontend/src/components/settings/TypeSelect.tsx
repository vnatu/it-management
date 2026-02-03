'use client';

import { useState, useEffect } from 'react';

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
            fetchTypes(categoryId);
        } else {
            setTypes([]);
        }
    }, [categoryId]);

    const fetchTypes = async (catId: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/asset-categories/${catId}/types`);
            if (res.ok) {
                setTypes(await res.json());
            }
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
                    description: '',
                    category: { id: categoryId } // Backend expects this structure usually
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

    if (!categoryId) return null;

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Asset Type</h3>
            {!isCreating ? (
                <div className="relative">
                    <select
                        className="w-full p-2 border rounded-md appearance-none bg-white"
                        value={selectedTypeId || ''}
                        onChange={(e) => {
                            if (e.target.value === 'new') {
                                setIsCreating(true);
                            } else {
                                onSelect(Number(e.target.value));
                            }
                        }}
                    >
                        <option value="" disabled>Select Asset Type</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        <option value="new" className="font-semibold text-blue-600">+ Add New Asset Type</option>
                    </select>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded-md"
                        placeholder="Enter new type name"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                    />
                    <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-md">Add</button>
                    <button onClick={() => setIsCreating(false)} className="text-gray-600 px-4 py-2">Cancel</button>
                </div>
            )}
        </div>
    );
}
