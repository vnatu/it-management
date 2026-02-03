'use client';

import { useState, useEffect } from 'react';
import { AssetAttributeDefinition, AttributeSection, ATTRIBUTE_SECTIONS } from '@/types/attributes';
// import { Trash2, Plus, Copy } from 'lucide-react'; // Commenting out until install fixed

interface AttributeConfigurationProps {
    typeId: number;
}

export default function AttributeConfiguration({ typeId }: AttributeConfigurationProps) {
    const [activeTab, setActiveTab] = useState<AttributeSection>(AttributeSection.COMMON);
    const [attributes, setAttributes] = useState<AssetAttributeDefinition[]>([]);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [sourceTypes, setSourceTypes] = useState<{ id: number, name: string }[]>([]); // Simplified type for source selection

    useEffect(() => {
        fetchAttributes();
        fetchAllTypesForCopy(); // Pre-fetch useful for modal
    }, [typeId]);

    const fetchAttributes = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/asset-types/${typeId}/attributes`);
            if (res.ok) {
                setAttributes(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch attributes:', error);
        }
    };

    const fetchAllTypesForCopy = async () => {
        try {
            const resCat = await fetch('http://localhost:8080/api/categories');
            if (resCat.ok) {
                const categories: any[] = await resCat.json();
                let allTypes: { id: number, name: string }[] = [];

                for (const cat of categories) {
                    const resType = await fetch(`http://localhost:8080/api/asset-categories/${cat.id}/types`);
                    if (resType.ok) {
                        const types: any[] = await resType.json();
                        allTypes = [...allTypes, ...types.map(t => ({ id: t.id, name: `${t.name} (${cat.name})` }))];
                    }
                }
                setSourceTypes(allTypes.filter(t => t.id !== typeId));
            }
        } catch (error) {
            console.error('Failed to fetch types for copy:', error);
        }
    };

    const handleAddAttribute = () => {
        const newAttr: AssetAttributeDefinition = {
            name: '',
            dataType: 'TEXT',
            required: false,
            section: activeTab,
            assetTypeId: typeId
        };
        setAttributes([...attributes, newAttr]);
    };

    const updateAttribute = (index: number, field: keyof AssetAttributeDefinition, value: any) => {
        const newAttrs = [...attributes];
        newAttrs[index] = { ...newAttrs[index], [field]: value };
        setAttributes(newAttrs);
    };

    const removeAttribute = (index: number) => {
        const newAttrs = attributes.filter((_, i) => i !== index);
        setAttributes(newAttrs);
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/asset-types/${typeId}/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attributes),
            });
            if (res.ok) {
                alert('Attributes saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save attributes:', error);
        }
    };

    const copyAttributesFromType = async (sourceTypeId: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/asset-types/${sourceTypeId}/attributes`);
            if (res.ok) {
                const sourceAttrs: AssetAttributeDefinition[] = await res.json();
                const newAttrs = sourceAttrs.map(a => ({ ...a, id: undefined, assetTypeId: typeId }));
                setAttributes([...attributes, ...newAttrs]);
                setShowCopyModal(false);
            }
        } catch (error) {
            console.error('Failed to copy', error);
        }
    };

    const currentSectionAttributes = attributes.map((attr, index) => ({ attr, index })).filter(item => item.attr.section === activeTab);

    return (
        <div className="mt-8">
            <div className="flex border-b mb-4 justify-between items-end">
                <div className="flex">
                    {ATTRIBUTE_SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            className={`mr-6 pb-2 font-medium ${activeTab === section.id ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
                            onClick={() => setActiveTab(section.id)}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => { fetchAllTypesForCopy(); setShowCopyModal(true); }}
                    className="mb-2 text-sm text-blue-600 font-medium hover:underline"
                >
                    Copy Attributes from...
                </button>
            </div>

            <div className="bg-orange-50 p-3 rounded-t-md grid grid-cols-12 gap-4 font-semibold text-sm text-gray-700">
                <div className="col-span-6">Attribute Name</div>
                <div className="col-span-4">Type</div>
                <div className="col-span-2">Required</div>
            </div>

            <div className="bg-gray-50 p-4 space-y-3">
                {currentSectionAttributes.map(({ attr, index }) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6">
                            <input
                                type="text"
                                value={attr.name}
                                onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                className="w-full p-2 border rounded bg-white"
                                placeholder="Attribute Name"
                            />
                        </div>
                        <div className="col-span-4">
                            <select
                                value={attr.dataType}
                                onChange={(e) => updateAttribute(index, 'dataType', e.target.value)}
                                className="w-full p-2 border rounded bg-white"
                            >
                                <option value="TEXT">Input Type</option>
                                <option value="NUMBER">Number</option>
                                <option value="DATE">Date</option>
                                <option value="BOOLEAN">Boolean</option>
                            </select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <input
                                type="checkbox"
                                checked={attr.required}
                                onChange={(e) => updateAttribute(index, 'required', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300"
                            />
                        </div>
                        <div className="col-span-1 text-red-500 cursor-pointer text-center" onClick={() => removeAttribute(index)}>
                            X {/* Replace with Trash Icon */}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end pt-2">
                    <button onClick={handleAddAttribute} className="bg-black text-white w-8 h-8 rounded flex items-center justify-center">+</button>
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                <button onClick={() => alert('Cancel')} className="px-6 py-2 border rounded text-orange-500 border-orange-500">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-orange-500 text-white rounded">Save</button>
            </div>

            {showCopyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Copy Attributes</h3>
                        <p className="text-sm text-gray-600 mb-4">Select an Asset Type to copy attributes from.</p>
                        <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                            {sourceTypes.map(t => (
                                <div
                                    key={t.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer border rounded"
                                    onClick={() => copyAttributesFromType(t.id)}
                                >
                                    {t.name}
                                </div>
                            ))}
                            {sourceTypes.length === 0 && <p>No other asset types found.</p>}
                        </div>
                        <button onClick={() => setShowCopyModal(false)} className="w-full py-2 border rounded">Close</button>
                    </div>
                </div>
            )}

        </div>
    );
}
