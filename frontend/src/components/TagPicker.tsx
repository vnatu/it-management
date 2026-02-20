"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Check, Tag as TagIcon, ChevronDown, Plus } from "lucide-react";

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

interface TagPickerProps {
    allTags: Tag[];
    selectedTagIds: number[];
    onToggle: (tagId: number) => void;
    label?: string;
}

export default function TagPicker({ allTags, selectedTagIds, onToggle, label = "Tags" }: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedTags = allTags.filter(t => selectedTagIds.includes(t.id));
    const filteredTags = allTags.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedTagIds.includes(t.id)
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div
                className="min-h-[42px] p-1.5 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer flex flex-wrap gap-2 items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedTags.length === 0 && !isOpen && (
                    <span className="text-gray-400 text-sm px-2">Select tags...</span>
                )}

                {selectedTags.map(tag => (
                    <span
                        key={tag.id}
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border"
                    >
                        <TagIcon size={12} />
                        {tag.name}
                        <button
                            type="button"
                            className="hover:bg-black/10 rounded-full p-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(tag.id);
                            }}
                        >
                            <X size={10} />
                        </button>
                    </span>
                ))}

                <div className="ml-auto pr-2 text-gray-400">
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-orange-500/20 outline-none"
                                placeholder="Search tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredTags.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-xs">
                                No more tags found
                            </div>
                        ) : (
                            filteredTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-colors group"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle(tag.id);
                                        setSearchQuery("");
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                        <span className="text-gray-700">{tag.name}</span>
                                        {tag.isGroupTag && (
                                            <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Tab</span>
                                        )}
                                    </div>
                                    <Plus size={14} className="text-gray-300 group-hover:text-orange-500" />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
