"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Check, ChevronDown, Tag as TagIcon } from "lucide-react";

interface Tag {
    id: number;
    name: string;
    color: string;
    isGroupTag?: boolean;
}

interface TagPickerProps {
    allTags: Tag[];
    selectedTagIds: number[];
    onToggle: (tagId: number) => void;
    label?: string;
    placeholder?: string;
}

export default function TagPicker({ allTags, selectedTagIds, onToggle, label, placeholder = "Search tags..." }: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredTags = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    {label}
                </label>
            )}

            <div
                className={`min-h-[46px] p-2 bg-gray-50 border rounded-xl flex flex-wrap gap-2 items-center cursor-pointer transition-all ${isOpen ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-gray-200'}`}
                onClick={toggleOpen}
            >
                {selectedTags.length === 0 && !isOpen && (
                    <span className="text-gray-400 text-sm pl-2 font-medium">{placeholder}</span>
                )}

                {selectedTags.map(tag => (
                    <span
                        key={tag.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight text-white shadow-sm animate-in zoom-in-95 duration-200"
                        style={{ backgroundColor: tag.color }}
                        onClick={(e) => { e.stopPropagation(); onToggle(tag.id); }}
                    >
                        {tag.name}
                        <X size={12} className="hover:scale-125 transition-transform cursor-pointer" />
                    </span>
                ))}

                {isOpen && (
                    <div className="flex-1 min-w-[120px] flex items-center gap-2 pr-2">
                        <Search size={14} className="text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-gray-700 p-0 placeholder:text-gray-400"
                            placeholder="Type to filter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                <div className="ml-auto pr-2 text-gray-400">
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto">
                        {filteredTags.length > 0 ? (
                            <div className="p-2 grid grid-cols-1 gap-1">
                                {filteredTags.map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${isSelected ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggle(tag.id);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                <span className="text-sm font-bold">
                                                    {tag.name}
                                                    {tag.isGroupTag && <span className="ml-2 text-[8px] bg-white px-1.5 py-0.5 rounded border border-orange-200 uppercase tracking-tight">Tab</span>}
                                                </span>
                                            </div>
                                            {isSelected && <Check size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gray-50">
                                <TagIcon size={32} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No tags match your search</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
