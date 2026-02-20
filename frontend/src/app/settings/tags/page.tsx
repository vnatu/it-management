"use client";

import { useState, useEffect } from "react";
import { Plus, Tag as TagIcon, Trash2, CheckCircle2, XCircle, Palette } from "lucide-react";

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

const PRESET_COLORS = [
    "#F26522", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899",
    "#F59E0B", "#6366F1", "#14B8A6", "#F43F5E", "#000000"
];

export default function TagSettingsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState({ name: "", color: PRESET_COLORS[0], isGroupTag: false });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/tags");
            if (res.ok) {
                const data = await res.json();
                setTags(data);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8080/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newTag, isSystem: false }),
            });
            if (res.ok) {
                setIsAdding(false);
                setNewTag({ name: "", color: PRESET_COLORS[0], isGroupTag: false });
                fetchTags();
            }
        } catch (error) {
            console.error("Error adding tag:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`http://localhost:8080/api/tags/${id}`, { method: "DELETE" });
            fetchTags();
        } catch (error) {
            console.error("Error deleting tag:", error);
        }
    };

    const toggleGroupTag = async (tag: Tag) => {
        try {
            const res = await fetch(`http://localhost:8080/api/tags/${tag.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...tag, isGroupTag: !tag.isGroupTag }),
            });
            if (res.ok) fetchTags();
        } catch (error) {
            console.error("Error updating tag:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tag Management</h1>
                    <p className="text-gray-500 font-medium">Create labels to organize and filter your assets</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus size={20} />
                        Create Tag
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Tag Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                                    placeholder="e.g. Critical, Leased, New Joiner"
                                    value={newTag.name}
                                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="isGroupTag"
                                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                                    checked={newTag.isGroupTag}
                                    onChange={(e) => setNewTag({ ...newTag, isGroupTag: e.target.checked })}
                                />
                                <label htmlFor="isGroupTag" className="text-sm font-bold text-orange-900 cursor-pointer">
                                    Promote to Inventory Tab (Group Tag)
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Tag Color</label>
                            <div className="grid grid-cols-5 gap-3">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewTag({ ...newTag, color })}
                                        className={`h-10 rounded-lg transition-all ${newTag.color === color ? 'ring-4 ring-orange-500/20 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                        >
                            Save Tag
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags.map(tag => (
                    <div key={tag.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                                    <TagIcon size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{tag.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {tag.isGroupTag ? 'Inventory Tab' : 'Regular Tag'}
                                    </p>
                                </div>
                            </div>
                            {!tag.isSystem && (
                                <button
                                    onClick={() => handleDelete(tag.id)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <button
                                onClick={() => toggleGroupTag(tag)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${tag.isGroupTag
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                    }`}
                            >
                                {tag.isGroupTag ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                Group Tag
                            </button>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {tags.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
                    <TagIcon size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No tags found. Start by creating one!</p>
                </div>
            )}
        </div>
    );
}
