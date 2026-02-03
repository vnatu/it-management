import { useState } from 'react';
import CategorySelect from '@/components/settings/CategorySelect';
import TypeSelect from '@/components/settings/TypeSelect';
import AttributeConfiguration from '@/components/settings/AttributeConfiguration';

export default function AssetCategoryPage() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

    return (
        <div className="p-8 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                {/* Breadcrumb or Title if needed */}
            </div>

            <div className="border-b mb-8">
                <nav className="flex gap-8">
                    <a href="#" className="pb-3 border-b-2 border-orange-500 text-orange-500 font-medium">Add Asset Category</a>
                    <a href="#" className="pb-3 text-gray-500 hover:text-gray-700">Add to Inventory</a>
                </nav>
            </div>

            <div className="grid grid-cols-2 gap-12">
                <CategorySelect
                    selectedCategoryId={selectedCategoryId}
                    onSelect={(id) => { setSelectedCategoryId(id); setSelectedTypeId(null); }}
                    onCategoryCreated={() => { }}
                />
                <TypeSelect
                    categoryId={selectedCategoryId}
                    selectedTypeId={selectedTypeId}
                    onSelect={setSelectedTypeId}
                />
            </div>

            {selectedTypeId && (
                <AttributeConfiguration typeId={selectedTypeId} />
            )}
        </div>
    );
}
