import { useState, useEffect } from 'react';
import TagPicker from '@/components/TagPicker';

interface Category {
    id: number;
    name: string;
    type: 'IT' | 'NON_IT';
}

interface CategorySelectProps {
    selectedCategoryId: number | null;
    onSelect: (id: number) => void;
    onCategoryCreated: () => void; // Refresh list
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
        <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Asset Categories</h3>
            {!isCreating ? (
                <div className="relative">
                    <select
                        className="w-full p-2 border rounded-md appearance-none bg-white"
                        value={selectedCategoryId || ''}
                        onChange={(e) => {
                            if (e.target.value === 'new') {
                                setIsCreating(true);
                            } else {
                                onSelect(Number(e.target.value));
                            }
                        }}
                    >
                        <option value="" disabled>Select Asset Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        <option value="new" className="font-semibold text-blue-600">+ Add New Category</option>
                    </select>
                </div>
            ) : (
                <div className="space-y-4 p-4 bg-gray-50 border rounded-xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded-md"
                            placeholder="Category Name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                    </div>
                    <TagPicker
                        allTags={allTags}
                        selectedTagIds={selectedTagIds}
                        onToggle={(id) => setSelectedTagIds(prev =>
                            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
                        )}
                        label="Assign Tags (Group Tags drive inventory tabs)"
                    />
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button onClick={() => { setIsCreating(false); setSelectedTagIds([]); }} className="text-gray-500 text-sm font-bold">Cancel</button>
                        <button onClick={handleCreate} className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-orange-900/10">Add Category</button>
                    </div>
                </div>
            )}
        </div>
    );
}
