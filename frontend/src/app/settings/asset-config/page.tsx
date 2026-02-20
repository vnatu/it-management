"use client";

import { useState } from "react";
import CategorySelect from "@/components/settings/CategorySelect";
import TypeSelect from "@/components/settings/TypeSelect";
import AttributeConfiguration from "@/components/settings/AttributeConfiguration";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Settings2, PackagePlus } from "lucide-react";

export default function AssetCategoryPage() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [step, setStep] = useState<1 | 2>(1);

    const handleNext = () => {
        if (selectedTypeId) {
            setStep(2);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Main Tabs */}
            <div className="flex border-b border-gray-100 mb-8">
                <button className="px-10 py-5 text-xs font-black uppercase tracking-widest text-primary relative">
                    Asset Category Configuration
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
                </button>
            </div>

            <Card className="rounded-[2.5rem] p-4 shadow-2xl shadow-gray-200/50 border-gray-100">
                <CardContent className="p-6">
                    {/* Step 1: Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <CategorySelect
                                selectedCategoryId={selectedCategoryId}
                                onSelect={(id: number | null) => {
                                    setSelectedCategoryId(id);
                                    setSelectedTypeId(null);
                                    setStep(1);
                                }}
                                onCategoryCreated={() => { }}
                            />
                        </div>
                        {selectedCategoryId && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <TypeSelect
                                    categoryId={selectedCategoryId}
                                    selectedTypeId={selectedTypeId}
                                    onSelect={(id: number | null) => {
                                        setSelectedTypeId(id);
                                        setStep(1);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions for Step 1 */}
                    {step === 1 && (
                        <div className="flex gap-4 mt-12 pt-8 border-t border-gray-50">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedCategoryId(null);
                                    setSelectedTypeId(null);
                                }}
                                className="px-10 py-3.5 text-gray-400"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!selectedTypeId}
                                onClick={handleNext}
                                className="px-16 py-3.5"
                            >
                                Next
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Attribute Configuration */}
                    {step === 2 && selectedTypeId && (
                        <div className="mt-12 pt-12 border-t border-gray-100 animate-in fade-in slide-in-from-top-8 duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-brand-black rounded-[1rem] flex items-center justify-center text-white">
                                    <Settings2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-brand-black">Configure Attributes</h2>
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Applying custom fields to selected asset type</p>
                                </div>
                            </div>
                            <AttributeConfiguration typeId={selectedTypeId} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Empty State / Prompt */}
            {!selectedCategoryId && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                        <PackagePlus size={48} className="text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-300">Start Project Alpha</h3>
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest mt-2">Select a category to begin system configuration</p>
                </div>
            )}
        </div>
    );
}
